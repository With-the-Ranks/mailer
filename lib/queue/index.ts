export {
  getRedisClient,
  closeRedisConnection,
  getRedisConnectionOptions,
} from "./redis";

export {
  getEmailQueue,
  queueEmail,
  queueBulkEmails,
  removeJobs,
  startEmailWorker,
  stopEmailWorker,
  getQueueStats,
  cleanOldJobs,
  type EmailJobData,
  type QueueEmailResult,
} from "./email-queue";
