import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import nodemailer from "nodemailer";

import { getSesClient } from "@/lib/aws/ses-client";
import { logError } from "@/lib/utils";

import type {
  CancelEmailResult,
  EmailProviderClient,
  SendEmailParams,
  SendEmailResult,
} from "./types";

export interface SesProviderConfig {
  region?: string;
  configurationSetName?: string;
}

export class SesProvider implements EmailProviderClient {
  private region: string;
  private configurationSetName?: string;

  constructor(config: SesProviderConfig = {}) {
    this.region =
      config.region || process.env.AWS_DEFAULT_REGION || "us-east-1";
    // Only use env when configurationSetName is not explicitly passed (so callers can force no config set)
    this.configurationSetName =
      "configurationSetName" in config
        ? config.configurationSetName
        : process.env.AWS_SES_CONFIG_SET;
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
      headers,
    } = params;

    try {
      const sesClient = getSesClient(this.region);

      // Build raw email using nodemailer's stream transport
      const transporter = nodemailer.createTransport({ streamTransport: true });

      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html: html || undefined,
        text: text || undefined,
        replyTo: replyTo
          ? Array.isArray(replyTo)
            ? replyTo.join(", ")
            : replyTo
          : undefined,
        cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          encoding: "base64" as const,
        })),
        headers: {
          "X-Entity-Ref-ID": crypto.randomUUID(),
          ...headers,
        },
      };

      const info = await transporter.sendMail(mailOptions);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of info.message) {
        chunks.push(Buffer.from(chunk));
      }
      const rawEmailData = Buffer.concat(chunks);

      // Send via SES (omit ConfigurationSetName when not set so send works without event tracking)
      const command = new SendEmailCommand({
        Content: {
          Raw: { Data: rawEmailData },
        },
        ...(this.configurationSetName && {
          ConfigurationSetName: this.configurationSetName,
        }),
      });

      const response = await sesClient.send(command);

      return {
        messageId: response.MessageId || null,
      };
    } catch (error) {
      logError("SES sendEmail error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown SES error";
      return {
        messageId: null,
        error: errorMessage,
      };
    }
  }

  async cancelScheduledEmail(_messageId: string): Promise<CancelEmailResult> {
    // SES doesn't support canceling scheduled emails directly
    // This would need to be handled at the queue level
    return {
      success: false,
      error: "SES does not support canceling scheduled emails directly",
    };
  }
}

export function createSesProvider(config?: SesProviderConfig): SesProvider {
  return new SesProvider(config);
}
