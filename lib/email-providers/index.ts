import { createResendProvider, ResendProvider } from "./resend";
import { createSesProvider, SesProvider } from "./ses";
import type {
  EmailProvider,
  EmailProviderClient,
  ProviderConfig,
} from "./types";

export type {
  EmailProvider,
  EmailProviderClient,
  ProviderConfig,
} from "./types";
export type {
  SendEmailParams,
  SendEmailResult,
  CancelEmailResult,
} from "./types";

/**
 * Check if Resend is the active email provider
 */
export function isResendEnabled(): boolean {
  return getDefaultProvider() === "resend";
}

/**
 * Get the default email provider
 * Returns "ses" by default, or "resend" if SES is not configured and Resend is enabled
 */
export function getDefaultProvider(): EmailProvider {
  const defaultProvider = process.env.DEFAULT_EMAIL_PROVIDER as
    | EmailProvider
    | undefined;

  if (defaultProvider === "resend" || defaultProvider === "ses") {
    return defaultProvider;
  }

  // Default to SES
  return "ses";
}

/**
 * Create an email provider client based on configuration
 */
export function createEmailProvider(
  config: ProviderConfig,
): EmailProviderClient {
  const { provider } = config;

  switch (provider) {
    case "resend":
      if (!isResendEnabled()) {
        throw new Error(
          "Resend is not the active email provider. Set DEFAULT_EMAIL_PROVIDER=resend to use Resend.",
        );
      }
      return createResendProvider({
        apiKey: config.apiKey,
      });

    case "ses":
    default:
      return createSesProvider({
        region: config.awsRegion,
        configurationSetName: config.configurationSetName,
      });
  }
}

/**
 * Create the default email provider based on environment configuration
 */
export function createDefaultProvider(): EmailProviderClient {
  const provider = getDefaultProvider();
  return createEmailProvider({ provider });
}

// Re-export provider classes for direct usage
export { SesProvider, createSesProvider } from "./ses";
export { ResendProvider, createResendProvider } from "./resend";
