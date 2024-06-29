import { faker } from "@faker-js/faker";
import { describe, expect, test, vi } from "vitest";

type MockResponse = { data: { message: string } | null; error: string | null };

const mockResend = (mockResponse: MockResponse) => {
  vi.doMock("resend", () => {
    return {
      Resend: vi.fn().mockImplementation(() => ({
        emails: {
          send: vi.fn().mockImplementation(({ to }: { to: string[] }) => {
            if (to[0] === "fail@example.com") {
              return Promise.resolve({
                data: null,
                error: "Something went wrong",
              });
            }
            return Promise.resolve(mockResponse);
          }),
        },
      })),
    };
  });
};

const mockMailyRender = () => {
  vi.doMock("@maily-to/render", () => {
    return {
      Maily: vi.fn().mockImplementation(() => ({
        setPreviewText: vi.fn(),
        renderAsync: vi.fn().mockResolvedValue("<html>Email content</html>"),
      })),
    };
  });
};

describe("sendEmail Functionality", () => {
  test("sendEmail should successfully send an email", async () => {
    const mockSuccessResponse = {
      data: { message: "Email sent successfully" },
      error: null,
    };
    mockResend(mockSuccessResponse);
    mockMailyRender();

    const to = faker.internet.email();
    const from = faker.internet.email();
    const subject = "Welcome!";
    const content = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello World" }],
        },
      ],
    });
    const previewText = "Hello World Preview";

    // Clear the module cache and re-import sendEmail
    vi.resetModules();
    const { sendEmail } = await import("@/lib/actions/send-email");

    const result = await sendEmail({ to, from, subject, content, previewText });
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ message: "Email sent successfully" });
  });

  test("sendEmail should handle failure in sending email", async () => {
    const mockFailureResponse = { data: null, error: "Something went wrong" };
    mockResend(mockFailureResponse);
    mockMailyRender();

    const to = "fail@example.com"; // Explicitly testing the failure case
    const from = faker.internet.email();
    const subject = "Welcome!";
    const content = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello World" }],
        },
      ],
    });
    const previewText = "Hello World Preview";

    // Clear the module cache and re-import sendEmail
    vi.resetModules();
    const { sendEmail } = await import("@/lib/actions/send-email");

    const result = await sendEmail({ to, from, subject, content, previewText });
    expect(result.data).toBeUndefined();
    expect(result.error).toBe("Something went wrong");
  });
});
