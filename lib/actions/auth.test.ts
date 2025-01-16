import { faker } from "@faker-js/faker";
import { describe, expect, test, vi } from "vitest";

import prisma from "@/lib/__mocks__/prisma";
import mockUser from "@/lib/__mocks__/user";
import { registerUser } from "@/lib/actions/auth";

vi.mock("@/lib/prisma");

const createUserData = () => {
  const userData = new FormData();
  userData.append("email", faker.internet.email());
  userData.append("password", faker.internet.password());
  return userData;
};

describe("Authentication", () => {
  test("registerUser should succeed for new email", async () => {
    const userData = createUserData();
    const email = userData.get("email")!.toString();
    const password = userData.get("password")!.toString();

    const mockedUser = mockUser({ email, password });
    prisma.user.create.mockResolvedValue(mockedUser);

    const result = await registerUser(userData);
    expect(result.user).toBeDefined();
    expect(result.error).toBeUndefined();

    // for simpler type checking - we already know this is not undefined from previous assertion
    if (result.user) {
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toMatch(email);
    }
  });

  test("registerUser should fail for existing email", async () => {
    const userData = createUserData();
    await registerUser(userData);

    const email = userData.get("email")?.toString();
    const mockedUser = mockUser({ email });
    prisma.user.findUnique.mockResolvedValue(mockedUser);
    const secondResult = await registerUser(userData);

    expect(secondResult.user).toBeUndefined();
    expect(secondResult.error).toBeDefined();
  });
});
