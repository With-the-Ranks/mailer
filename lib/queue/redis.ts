import Redis from "ioredis";

let redisClient: Redis | null = null;

const bullMqConnections: Redis[] = [];

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
        console.error("[Redis] Max retry attempts reached, giving up");
        return null;
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

  for (const connection of bullMqConnections) {
    try {
      await connection.quit();
    } catch (err) {
      console.error("[Redis] Error closing BullMQ connection:", err);
    }
  }
  bullMqConnections.length = 0;
}

export function getRedisConnectionOptions() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  bullMqConnections.push(connection);

  return {
    connection,
  };
}
