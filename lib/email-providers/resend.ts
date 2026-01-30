import { Resend } from "resend";

import { logError } from "@/lib/utils";

import type {
  CancelEmailResult,
  EmailProviderClient,
  SendEmailParams,
  SendEmailResult,
} from "./types";

export interface ResendProviderConfig {
  apiKey?: string;
}

export class ResendProvider implements EmailProviderClient {
  private client: Resend;

  constructor(config: ResendProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Resend API key is required. Set RESEND_API_KEY environment variable or pass apiKey in config.",
      );
    }
    this.client = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const {
      to,
      from,
      subject,
      html,
      text,
      replyTo,
      cc,
      bcc,
      attachments,
      tags,
      scheduledAt,
    } = params;

    try {
      const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || "",
        text: text || "",
        replyTo: replyTo
          ? Array.isArray(replyTo)
            ? replyTo
            : [replyTo]
          : undefined,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
        tags,
        scheduledAt: scheduledAt || undefined,
      };

      const { data, error } = await this.client.emails.send(payload);

      if (error) {
        const errorMessage =
          typeof error === "string" ? error : JSON.stringify(error);
        return {
          messageId: null,
          error: errorMessage,
        };
      }

      return {
        messageId: data?.id || null,
      };
    } catch (error) {
      logError("Resend sendEmail error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Resend error";
      return {
        messageId: null,
        error: errorMessage,
      };
    }
  }

  async cancelScheduledEmail(messageId: string): Promise<CancelEmailResult> {
    try {
      await this.client.emails.cancel(messageId);
      return { success: true };
    } catch (error) {
      logError("Resend cancelScheduledEmail error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export function createResendProvider(
  config?: ResendProviderConfig,
): ResendProvider {
  return new ResendProvider(config);
}
