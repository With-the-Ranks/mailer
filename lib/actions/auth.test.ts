import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, test, vi } from "vitest";

import prisma from "@/lib/__mocks__/prisma";
import mockUser from "@/lib/__mocks__/user";
import { registerUser } from "@/lib/actions/auth";
import { sendEmail } from "@/lib/actions/send-email";

vi.mock("@/lib/prisma");
vi.mock("@/lib/actions/send-email", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}));

const createUserData = () => {
  const fd = new FormData();
  fd.append("email", faker.internet.email());
  fd.append("password", faker.internet.password());
  return fd;
};

beforeEach(() => {
  prisma.user.findUnique.mockResolvedValue(null);
  prisma.verificationToken.create.mockResolvedValue({
    identifier: "",
    token: "",
    expires: new Date(),
  });
});

describe("Authentication", () => {
  test("registerUser should succeed for new email", async () => {
    const fd = createUserData();
    const email = fd.get("email")!.toString();
    const pwd = fd.get("password")!.toString();

    prisma.user.create.mockResolvedValue(mockUser({ email, password: pwd }));

    const result = await registerUser(fd);

    expect(result.user).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.message).toMatch(/Registration successful/);

    if (result.user) {
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(email);
    }

    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  test("registerUser should fail for existing email", async () => {
    const fd = createUserData();
    const email = fd.get("email")!.toString();

    // simulate user already exists
    prisma.user.findUnique.mockResolvedValue(mockUser({ email }));

    const result2 = await registerUser(fd);

    expect(result2.user).toBeUndefined();
    expect(result2.error).toMatch(/already exists/);
  });
});
