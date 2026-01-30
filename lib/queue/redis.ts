import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error(
      "REDIS_URL environment variable is not set. Redis is required for email queue processing.",
    );
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection error:", err);
  });

  redisClient.on("connect", () => {
    console.log("[Redis] Connected successfully");
  });

  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Export connection options for BullMQ
export function getRedisConnectionOptions() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  return {
    connection: new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }),
  };
}
