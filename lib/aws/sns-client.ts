import { SNSClient } from "@aws-sdk/client-sns";

// Cache clients by region to avoid recreating them
const clientCache = new Map<string, SNSClient>();

export function getSnsClient(region?: string): SNSClient {
  const awsRegion = region || process.env.AWS_DEFAULT_REGION || "us-east-1";

  // Return cached client if available
  const cached = clientCache.get(awsRegion);
  if (cached) {
    return cached;
  }

  // Precedence: AWS_SES_* (Vercel-safe) > AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY > AWS_ACCESS_KEY/AWS_SECRET_KEY
  const accessKeyId =
    process.env.AWS_SES_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY;
  const secretAccessKey =
    process.env.AWS_SES_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_KEY;

  const clientOptions: ConstructorParameters<typeof SNSClient>[0] = {
    region: awsRegion,
    endpoint: process.env.AWS_SNS_ENDPOINT || undefined,
  };

  if (accessKeyId && secretAccessKey) {
    clientOptions.credentials = {
      accessKeyId,
      secretAccessKey,
    };
  }

  const client = new SNSClient(clientOptions);

  clientCache.set(awsRegion, client);
  return client;
}

export function clearSnsClientCache(): void {
  clientCache.forEach((client) => {
    if (typeof client.destroy === "function") {
      client.destroy();
    }
  });
  clientCache.clear();
}
