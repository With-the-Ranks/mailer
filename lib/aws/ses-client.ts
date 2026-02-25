import { SESv2Client } from "@aws-sdk/client-sesv2";

// Cache clients by region to avoid recreating them
const clientCache = new Map<string, SESv2Client>();

export function getSesClient(region?: string): SESv2Client {
  const awsRegion = region || process.env.AWS_DEFAULT_REGION || "us-east-1";

  // Return cached client if available
  const cached = clientCache.get(awsRegion);
  if (cached) {
    return cached;
  }

  // Use standard AWS credential env var names
  const accessKeyId =
    process.env.AWS_SES_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY;
  const secretAccessKey =
    process.env.AWS_SES_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_KEY;

  const clientOptions: ConstructorParameters<typeof SESv2Client>[0] = {
    region: awsRegion,
    endpoint: process.env.AWS_SES_ENDPOINT || undefined,
  };

  if (accessKeyId && secretAccessKey) {
    clientOptions.credentials = {
      accessKeyId,
      secretAccessKey,
    };
  }

  const client = new SESv2Client(clientOptions);

  clientCache.set(awsRegion, client);
  return client;
}

export function clearClientCache(): void {
  clientCache.forEach((client) => {
    if (typeof client.destroy === "function") {
      client.destroy();
    }
  });
  clientCache.clear();
}
