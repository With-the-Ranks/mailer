import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Unit tests for user registration

import prisma from "@/lib/__mocks__/prisma";
import mockUser from "@/lib/__mocks__/user";

vi.mock("@/lib/prisma");
vi.mock("@/lib/actions/send-email", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}));

const createUserFormData = () => {
  const fd = new FormData();
  fd.append("email", faker.internet.email());
  fd.append("password", faker.internet.password());
  return fd;
};

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(((args: {
      data: { email: string; password: string; name: string };
    }) =>
      Promise.resolve(
        mockUser({
          email: args.data.email,
          password: args.data.password,
          name: args.data.name,
        }),
      )) as typeof prisma.user.create);
    prisma.verificationToken.create.mockResolvedValue({
      identifier: "test@example.com",
      token: "test-token",
      expires: new Date(),
    });
    prisma.organization.create.mockResolvedValue({
      id: "org-123",
      name: "Test Org",
      subdomain: "test-org",
      customDomain: null,
      description: null,
      logo: null,
      font: "font-default",
      image: null,
      imageBlurhash: null,
      message404: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailApiKey: null,
      activeDomainId: null,
    });
    (
      prisma as unknown as {
        organizationMember: { create: ReturnType<typeof vi.fn> };
      }
    ).organizationMember = {
      create: vi.fn().mockResolvedValue({
        id: "member-123",
        userId: "user-123",
        organizationId: "org-123",
        role: "ADMIN",
      }),
    };
    prisma.user.update.mockResolvedValue(mockUser({}));
    prisma.audienceList.create.mockResolvedValue({
      id: "list-123",
      name: "Master List",
      description: null,
      organizationId: "org-123",
      customFields: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  test("returns user and success message for new email", async () => {
    const { sendEmail } = await import("@/lib/actions/send-email");
    const { registerUser } = await import("@/lib/actions/auth");
    const fd = createUserFormData();
    const email = fd.get("email")!.toString();

    const result = await registerUser(fd);

    expect(result.user).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.message).toMatch(/Registration successful/);
    expect(result.user?.email).toBe(email);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  test("sends verification email after registration", async () => {
    const { sendEmail } = await import("@/lib/actions/send-email");
    const { registerUser } = await import("@/lib/actions/auth");
    const fd = createUserFormData();

    await registerUser(fd);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Verify your email address",
      }),
    );
  });

  test("returns error when email already exists", async () => {
    const { registerUser } = await import("@/lib/actions/auth");
    const fd = createUserFormData();
    const email = fd.get("email")!.toString();
    prisma.user.findUnique.mockResolvedValue(mockUser({ email }));

    const result = await registerUser(fd);

    expect(result.user).toBeUndefined();
    expect(result.error).toMatch(/already exists/);
  });

  test("creates verification token after user creation", async () => {
    const { registerUser } = await import("@/lib/actions/auth");
    const fd = createUserFormData();

    await registerUser(fd);

    expect(prisma.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: expect.any(String),
          token: expect.any(String),
          expires: expect.any(Date),
        }),
      }),
    );
  });
});
