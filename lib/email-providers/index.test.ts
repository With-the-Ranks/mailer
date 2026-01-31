import { beforeEach, describe, expect, test, vi } from "vitest";

// Unit tests for email provider factory

vi.mock("./ses", () => ({
  createSesProvider: vi.fn(() => ({
    sendEmail: vi.fn().mockResolvedValue({ messageId: "ses-123", error: null }),
  })),
  SesProvider: vi.fn(),
}));

vi.mock("./resend", () => ({
  createResendProvider: vi.fn(() => ({
    sendEmail: vi
      .fn()
      .mockResolvedValue({ messageId: "resend-123", error: null }),
  })),
  ResendProvider: vi.fn(),
}));

describe("getDefaultProvider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  test("returns ses when DEFAULT_EMAIL_PROVIDER is not set", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "");
    const { getDefaultProvider } = await import("./index");

    const result = getDefaultProvider();

    expect(result).toBe("ses");
  });

  test("returns ses when DEFAULT_EMAIL_PROVIDER is ses", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
    const { getDefaultProvider } = await import("./index");

    const result = getDefaultProvider();

    expect(result).toBe("ses");
  });

  test("returns resend when DEFAULT_EMAIL_PROVIDER is resend", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "resend");
    const { getDefaultProvider } = await import("./index");

    const result = getDefaultProvider();

    expect(result).toBe("resend");
  });

  test("returns ses for invalid DEFAULT_EMAIL_PROVIDER value", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "invalid");
    const { getDefaultProvider } = await import("./index");

    const result = getDefaultProvider();

    expect(result).toBe("ses");
  });
});

describe("isResendEnabled", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  test("returns true when DEFAULT_EMAIL_PROVIDER is resend", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "resend");
    const { isResendEnabled } = await import("./index");

    const result = isResendEnabled();

    expect(result).toBe(true);
  });

  test("returns false when DEFAULT_EMAIL_PROVIDER is ses", async () => {
    vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
    const { isResendEnabled } = await import("./index");

    const result = isResendEnabled();

    expect(result).toBe(false);
  });
});

describe("createEmailProvider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  describe("SES provider", () => {
    test("creates SES provider when provider is ses", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
      const { createEmailProvider } = await import("./index");
      const { createSesProvider } = await import("./ses");

      const provider = createEmailProvider({ provider: "ses" });

      expect(createSesProvider).toHaveBeenCalled();
      expect(provider.sendEmail).toBeDefined();
    });

    test("passes AWS region to SES provider", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
      const { createEmailProvider } = await import("./index");
      const { createSesProvider } = await import("./ses");

      createEmailProvider({ provider: "ses", awsRegion: "us-west-2" });

      expect(createSesProvider).toHaveBeenCalledWith(
        expect.objectContaining({ region: "us-west-2" }),
      );
    });

    test("passes configuration set name to SES provider", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
      const { createEmailProvider } = await import("./index");
      const { createSesProvider } = await import("./ses");

      createEmailProvider({
        provider: "ses",
        configurationSetName: "mailer-events",
      });

      expect(createSesProvider).toHaveBeenCalledWith(
        expect.objectContaining({ configurationSetName: "mailer-events" }),
      );
    });
  });

  describe("Resend provider", () => {
    test("creates Resend provider when provider is resend", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "resend");
      const { createEmailProvider } = await import("./index");
      const { createResendProvider } = await import("./resend");

      const provider = createEmailProvider({ provider: "resend" });

      expect(createResendProvider).toHaveBeenCalled();
      expect(provider.sendEmail).toBeDefined();
    });

    test("creates Resend provider even when SES is default", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
      const { createEmailProvider } = await import("./index");
      const { createResendProvider } = await import("./resend");

      const provider = createEmailProvider({ provider: "resend" });

      expect(createResendProvider).toHaveBeenCalled();
      expect(provider.sendEmail).toBeDefined();
    });

    test("passes API key to Resend provider", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "resend");
      const { createEmailProvider } = await import("./index");
      const { createResendProvider } = await import("./resend");

      createEmailProvider({ provider: "resend", apiKey: "re_test_key" });

      expect(createResendProvider).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: "re_test_key" }),
      );
    });
  });

  describe("error handling", () => {
    test("throws error for unknown provider type", async () => {
      vi.stubEnv("DEFAULT_EMAIL_PROVIDER", "ses");
      const { createEmailProvider } = await import("./index");

      expect(() =>
        createEmailProvider({ provider: "mailgun" as never }),
      ).toThrow('Unknown email provider: "mailgun"');
    });
  });
});
