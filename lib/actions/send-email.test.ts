import { faker } from "@faker-js/faker";
import { describe, expect, test, vi } from "vitest";

vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: ({ to }: { to: string[] }) => {
          if (to[0] === "fail@example.com") {
            return Promise.resolve({
              data: null,
              error: "Something went wrong",
            });
          }
          return Promise.resolve({
            data: { message: "Email sent successfully" },
            error: null,
          });
        },
      },
    })),
  };
});

vi.mock("@maily-to/render", () => {
  return {
    Maily: vi.fn().mockImplementation(() => ({
      setPreviewText: vi.fn(),
      render: vi.fn().mockResolvedValue("<html>Email content</html>"),
      setVariableValues: vi.fn(),
    })),
  };
});

describe("sendEmail Functionality", () => {
  test("sendEmail should successfully send an email", async () => {
    vi.resetModules();
    const { sendEmail } = await import("@/lib/actions/send-email");

    const to = faker.internet.email();
    const from = faker.internet.email();
    const subject = "Welcome!";
    const content = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello World" }] },
      ],
    });
    const previewText = "Hello World Preview";

    const result = await sendEmail({ to, from, subject, content, previewText });
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ message: "Email sent successfully" });
  });

  test("sendEmail should handle failure in sending email", async () => {
    vi.resetModules();
    const { sendEmail } = await import("@/lib/actions/send-email");

    const to = "fail@example.com";
    const from = faker.internet.email();
    const subject = "Welcome!";
    const content = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello World" }] },
      ],
    });
    const previewText = "Hello World Preview";

    const result = await sendEmail({ to, from, subject, content, previewText });
    expect(result.data).toBeUndefined();
    expect(result.error).toBe("Something went wrong");
  });
});
