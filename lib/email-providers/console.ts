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
      const links = [...html.matchAll(/href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((l) => l.startsWith("http"));
      if (links.length) console.log("Links:\n" + links.join("\n"));
    }
    console.log("");

    return { messageId: `console-${Date.now()}` };
  }
}

export function createConsoleProvider(): ConsoleProvider {
  return new ConsoleProvider();
}
