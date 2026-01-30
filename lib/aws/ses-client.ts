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

  const client = new SESv2Client({
    region: awsRegion,
    endpoint: process.env.AWS_SES_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });

  clientCache.set(awsRegion, client);
  return client;
}

export function clearClientCache(): void {
  clientCache.clear();
}
