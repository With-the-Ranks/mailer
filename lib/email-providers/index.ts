import { createResendProvider } from "./resend";
import { createSesProvider } from "./ses";
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

// Check if Resend is the active email provider
export function isResendEnabled(): boolean {
  return getDefaultProvider() === "resend";
}

// Get default email provider from environment
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

// Create an email provider client based on configuration
export function createEmailProvider(
  config: ProviderConfig,
): EmailProviderClient {
  const { provider } = config;

  switch (provider) {
    case "resend":
      return createResendProvider({
        apiKey: config.apiKey,
      });

    case "ses":
      return createSesProvider({
        region: config.awsRegion,
        configurationSetName: config.configurationSetName,
      });

    default:
      throw new Error(
        `Unknown email provider: "${config.provider}". Valid providers are: "ses", "resend".`,
      );
  }
}

// Create the default email provider based on environment configuration
export function createDefaultProvider(): EmailProviderClient {
  const provider = getDefaultProvider();
  return createEmailProvider({ provider });
}

// Re-export provider classes for direct usage
export { SesProvider, createSesProvider } from "./ses";
export { ResendProvider, createResendProvider } from "./resend";
