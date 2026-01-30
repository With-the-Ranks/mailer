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

  const client = new SNSClient({
    region: awsRegion,
    endpoint: process.env.AWS_SNS_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });

  clientCache.set(awsRegion, client);
  return client;
}

export function clearSnsClientCache(): void {
  clientCache.clear();
}
