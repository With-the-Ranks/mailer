export type EmailProvider = "ses" | "resend";

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
}

export interface SendEmailParams {
  to: string | string[];
  from: string;
  subject: string;
  html?: string; // At least one of html or text required
  text?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  tags?: Array<{ name: string; value: string }>;
  headers?: Record<string, string>;
  scheduledAt?: string;
}

export interface SendEmailResult {
  messageId: string | null;
  error?: string;
}

export interface CancelEmailResult {
  success: boolean;
  error?: string;
}

export interface EmailProviderClient {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
  cancelScheduledEmail?(messageId: string): Promise<CancelEmailResult>;
}

export interface ProviderConfig {
  provider: EmailProvider;
  // SES-specific
  awsRegion?: string;
  configurationSetName?: string;
  // Resend-specific
  apiKey?: string;
}
