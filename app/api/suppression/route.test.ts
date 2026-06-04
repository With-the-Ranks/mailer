import { beforeEach, describe, expect, test, vi } from "vitest";

// Unit tests for suppression list API route

const mockPrisma = {
  emailSuppression: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

const mockGetSession = vi.fn();

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));
vi.mock("@/lib/auth", () => ({ getSession: () => mockGetSession() }));

describe("GET /api/suppression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/suppression");

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("returns suppression entries when authenticated", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.findMany.mockResolvedValue([
      { id: "1", email: "bounce@example.com", reason: "HARD_BOUNCE" },
    ]);
    mockPrisma.emailSuppression.count.mockResolvedValue(1);
    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/suppression");

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  test("filters entries by search parameter", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.findMany.mockResolvedValue([]);
    mockPrisma.emailSuppression.count.mockResolvedValue(0);
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost/api/suppression?search=bounce",
    );

    await GET(request as never);

    expect(mockPrisma.emailSuppression.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: { contains: "bounce" } },
      }),
    );
  });

  test("respects limit and offset parameters", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.findMany.mockResolvedValue([]);
    mockPrisma.emailSuppression.count.mockResolvedValue(0);
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost/api/suppression?limit=50&offset=10",
    );

    await GET(request as never);

    expect(mockPrisma.emailSuppression.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        skip: 10,
      }),
    );
  });
});

describe("POST /api/suppression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/suppression", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 400 when email is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/suppression", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Email is required");
  });

  test("returns 400 for invalid email format", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/suppression", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid email format");
  });

  test("returns 201 when email is added successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.findUnique.mockResolvedValue(null);
    mockPrisma.emailSuppression.create.mockResolvedValue({
      id: "new-1",
      email: "new@example.com",
      reason: "MANUAL",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/suppression", {
      method: "POST",
      body: JSON.stringify({ email: "New@Example.com" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.email).toBe("new@example.com");
  });

  test("normalizes email to lowercase before saving", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.findUnique.mockResolvedValue(null);
    mockPrisma.emailSuppression.create.mockResolvedValue({
      id: "new-1",
      email: "test@example.com",
      reason: "MANUAL",
    });
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/suppression", {
      method: "POST",
      body: JSON.stringify({ email: "TEST@EXAMPLE.COM" }),
    });

    await POST(request as never);

    expect(mockPrisma.emailSuppression.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "test@example.com",
      }),
    });
  });
});

describe("DELETE /api/suppression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const { DELETE } = await import("./route");
    const request = new Request("http://localhost/api/suppression?id=123");

    const response = await DELETE(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 400 when neither id nor email provided", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const { DELETE } = await import("./route");
    const request = new Request("http://localhost/api/suppression");

    const response = await DELETE(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Either id or email is required");
  });

  test("deletes entry by id when id is provided", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.delete.mockResolvedValue({});
    const { DELETE } = await import("./route");
    const request = new Request("http://localhost/api/suppression?id=sup-123");

    const response = await DELETE(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.emailSuppression.delete).toHaveBeenCalledWith({
      where: { id: "sup-123" },
    });
  });

  test("deletes entry by email when email is provided", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.emailSuppression.delete.mockResolvedValue({});
    const { DELETE } = await import("./route");
    const request = new Request(
      "http://localhost/api/suppression?email=TEST@example.com",
    );

    const response = await DELETE(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.emailSuppression.delete).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });
});
