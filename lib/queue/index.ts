export {
  getRedisClient,
  closeRedisConnection,
  getRedisConnectionOptions,
} from "./redis";

export {
  getEmailQueue,
  queueEmail,
  queueBulkEmails,
  startEmailWorker,
  stopEmailWorker,
  getQueueStats,
  cleanOldJobs,
  type EmailJobData,
  type QueueEmailResult,
} from "./email-queue";
