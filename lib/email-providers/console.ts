import type {
  EmailProviderClient,
  SendEmailParams,
  SendEmailResult,
} from "./types";

export class ConsoleProvider implements EmailProviderClient {
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const { to, from, subject, html, text } = params;
    console.log(
      `\n[DEV EMAIL] From: ${from} | To: ${Array.isArray(to) ? to.join(", ") : to} | Subject: ${subject}`,
    );
    if (text) console.log(text);
    if (html) {
      // Extract and log all links from the HTML content
      const links: string[] = [];
      let match: RegExpExecArray | null;
      const regex = /href="([^"]+)"/g;
      while ((match = regex.exec(html)) !== null) {
        if (match[1].startsWith("http")) {
          links.push(match[1]);
        }
      }
      if (links.length) console.log("Links:\n" + links.join("\n"));
    }
    console.log("");

    return { messageId: `console-${Date.now()}` };
  }
}

export function createConsoleProvider(): ConsoleProvider {
  if (process.env.NODE_ENV === "production") {
    throw new Error("ConsoleProvider must not be used in production.");
  }
  return new ConsoleProvider();
}
