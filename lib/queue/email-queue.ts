import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

import { getConfigurationSetName } from "@/lib/aws/ses-config";
import { createEmailProvider, type EmailProvider } from "@/lib/email-providers";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/utils";

// Queue name - use region-specific queues for rate limiting
const QUEUE_NAME = "email-send";

const EMAIL_SEND_TIMEOUT_MS = 30000;

let queueConnection: Redis | null = null;
let workerConnection: Redis | null = null;

export interface EmailJobData {
  emailId: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  organizationId: string;
  provider: EmailProvider;
  awsRegion?: string;
  configurationSetName?: string;
  headers?: Record<string, string>;
  userId?: string;
  scheduledAt?: string;
}

export interface QueueEmailResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

let emailQueue: Queue<EmailJobData> | null = null;
let emailWorker: Worker<EmailJobData> | null = null;

/**
 * Get or create the email queue
 */
export function getEmailQueue(): Queue<EmailJobData> {
  if (emailQueue) {
    return emailQueue;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  queueConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  emailQueue = new Queue<EmailJobData>(QUEUE_NAME, {
    connection: queueConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
    },
  });

  return emailQueue;
}

/**
 * Add an email to the queue
 */
export async function queueEmail(
  data: EmailJobData,
  delay?: number,
): Promise<QueueEmailResult> {
  try {
    const queue = getEmailQueue();

    const job = await queue.add(data.emailId, data, {
      delay: delay || 0,
      jobId: `${data.emailId}-${data.to}`,
    });

    return {
      success: true,
      jobId: job.id,
    };
  } catch (error) {
    logError("Failed to queue email", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Queue multiple emails (bulk send)
 */
export async function queueBulkEmails(
  emails: EmailJobData[],
  delay?: number,
): Promise<{ success: number; failed: number; errors: string[] }> {
  const queue = getEmailQueue();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Add emails in batches of 100
  const batchSize = 100;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    try {
      await queue.addBulk(
        batch.map((email) => ({
          name: email.emailId,
          data: email,
          opts: {
            delay: delay || 0,
            jobId: `${email.emailId}-${email.to}`,
          },
        })),
      );
      success += batch.length;
    } catch (error) {
      failed += batch.length;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${errorMsg}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Process email jobs from the queue
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const {
    emailId,
    to,
    from,
    subject,
    html,
    text,
    replyTo,
    provider,
    awsRegion,
    configurationSetName,
    headers,
    userId,
  } = job.data;

  // Check suppression list before sending
  const suppressed = await prisma.emailSuppression.findUnique({
    where: { email: to },
  });

  if (suppressed) {
    logError("Email skipped - recipient suppressed", null, {
      emailId,
      to,
      reason: suppressed.reason,
    });

    try {
      await prisma.emailEvent.create({
        data: {
          emailId,
          userId: userId || null,
          emailTo: to,
          eventType: "suppressed",
          timestamp: new Date(),
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code !== "P2002"
      ) {
        logError("Error creating suppression event", error);
      }
    }

    return;
  }

  // Create email provider
  const client = createEmailProvider({
    provider,
    awsRegion,
    configurationSetName,
  });

  const sendPromise = client.sendEmail({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    headers,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(`Email send timed out after ${EMAIL_SEND_TIMEOUT_MS}ms`),
      );
    }, EMAIL_SEND_TIMEOUT_MS);
  });

  const result = await Promise.race([sendPromise, timeoutPromise]);

  if (result.error) {
    // Log the failure and throw to trigger retry
    logError("Email send failed", null, {
      emailId,
      to,
      error: result.error,
    });
    throw new Error(result.error);
  }

  // Update email record with provider message ID
  const updateData: {
    resendId?: string;
    sesMessageId?: string;
    providerUsed: string;
  } = {
    providerUsed: provider,
  };

  if (provider === "resend" && result.messageId) {
    updateData.resendId = result.messageId;
  } else if (result.messageId) {
    updateData.sesMessageId = result.messageId;
  }

  await prisma.email.update({
    where: { id: emailId },
    data: updateData,
  });

  // Create email event
  try {
    await prisma.emailEvent.create({
      data: {
        emailId,
        userId: userId || null,
        emailTo: to,
        eventType: "sent",
        timestamp: new Date(),
      },
    });
  } catch (error: unknown) {
    // Ignore duplicate events
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code !== "P2002"
    ) {
      logError("Error creating email event", error);
    }
  }
}

/**
 * Start the email worker
 */
export function startEmailWorker(
  concurrency: number = 10,
): Worker<EmailJobData> {
  if (emailWorker) {
    return emailWorker;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  workerConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  emailWorker = new Worker<EmailJobData>(QUEUE_NAME, processEmailJob, {
    connection: workerConnection,
    concurrency,
    limiter: {
      max: 14, // SES default rate limit per second
      duration: 1000,
    },
  });

  emailWorker.on("completed", (job) => {
    console.log(`[EmailQueue] Job ${job.id} completed for ${job.data.to}`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(
      `[EmailQueue] Job ${job?.id} failed for ${job?.data.to}:`,
      err.message,
    );
  });

  emailWorker.on("error", (err) => {
    console.error("[EmailQueue] Worker error:", err);
  });

  console.log(`[EmailQueue] Worker started with concurrency ${concurrency}`);

  return emailWorker;
}

export async function stopEmailWorker(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    console.log("[EmailQueue] Worker stopped");
  }

  if (workerConnection) {
    await workerConnection.quit();
    workerConnection = null;
    console.log("[EmailQueue] Worker Redis connection closed");
  }
}

export async function closeEmailQueue(): Promise<void> {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
    console.log("[EmailQueue] Queue closed");
  }

  if (queueConnection) {
    await queueConnection.quit();
    queueConnection = null;
    console.log("[EmailQueue] Queue Redis connection closed");
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getEmailQueue();

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Clean old jobs from the queue
 */
export async function cleanOldJobs(
  olderThanMs: number = 7 * 24 * 3600 * 1000,
): Promise<void> {
  const queue = getEmailQueue();
  await queue.clean(olderThanMs, 1000, "completed");
  await queue.clean(olderThanMs, 1000, "failed");
}
