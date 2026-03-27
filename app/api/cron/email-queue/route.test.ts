import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mockGetQueueStats = vi.fn();
const mockStartEmailWorker = vi.fn();

vi.mock("@/lib/queue", () => ({
  getQueueStats: (...args: unknown[]) => mockGetQueueStats(...args),
  startEmailWorker: (...args: unknown[]) => mockStartEmailWorker(...args),
}));

const ORIGINAL_ENV = { ...process.env };

describe("POST /api/cron/email-queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    process.env = { ...ORIGINAL_ENV };
    process.env.CRON_SECRET = "test-secret";
    process.env.REDIS_URL = "redis://localhost:6379";
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...ORIGINAL_ENV };
  });

  test("returns 503 when Redis is not configured", async () => {
    delete process.env.REDIS_URL;
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
        headers: { authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("REDIS_URL environment variable is not set");
    expect(mockStartEmailWorker).not.toHaveBeenCalled();
  });

  test("starts the worker and returns queue stats", async () => {
    mockGetQueueStats.mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 2,
      failed: 0,
      delayed: 3,
    });

    const { POST } = await import("./route");
    const responsePromise = POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    await vi.advanceTimersByTimeAsync(15_000);

    const response = await responsePromise;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.waitedMs).toBe(15_000);
    expect(body.stats).toEqual({
      waiting: 0,
      active: 0,
      completed: 2,
      failed: 0,
      delayed: 3,
    });
    expect(mockStartEmailWorker).toHaveBeenCalledTimes(1);
    expect(mockGetQueueStats).toHaveBeenCalledTimes(1);
  });

  test("returns 500 when queue processing fails", async () => {
    mockGetQueueStats.mockRejectedValue(new Error("queue failed"));

    const { POST } = await import("./route");
    const responsePromise = POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    await vi.advanceTimersByTimeAsync(15_000);

    const response = await responsePromise;
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("queue failed");
    expect(mockStartEmailWorker).toHaveBeenCalledTimes(1);
  });

  test("returns 401 when auth token is missing or invalid", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockStartEmailWorker).not.toHaveBeenCalled();
  });

  test("does not require auth when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    mockGetQueueStats.mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    });

    const { POST } = await import("./route");
    const responsePromise = POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
      }),
    );

    await vi.advanceTimersByTimeAsync(15_000);

    const response = await responsePromise;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockStartEmailWorker).toHaveBeenCalledTimes(1);
  });

  test("rejects POST requests without the authorization header when CRON_SECRET is set", async () => {
    mockGetQueueStats.mockResolvedValue({
      waiting: 1,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/cron/email-queue", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockStartEmailWorker).not.toHaveBeenCalled();
  });
});
