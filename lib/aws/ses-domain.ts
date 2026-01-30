import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from "@aws-sdk/client-sesv2";
import { generateKeyPairSync } from "crypto";

import { getSesClient } from "./ses-client";

export interface DnsRecord {
  type: "TXT" | "MX" | "CNAME";
  name: string;
  value: string;
  priority?: number;
}

export interface DomainVerificationResult {
  success: boolean;
  publicKey?: string;
  dnsRecords?: DnsRecord[];
  error?: string;
}

export interface DomainStatusResult {
  verified: boolean;
  dkimStatus?: string;
  spfStatus?: string;
  error?: string;
}

/**
 * Generate an RSA key pair for DKIM signing
 * Uses 1024-bit keys as required by SES
 */
function generateDkimKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 1024,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // Strip PEM headers and convert to single-line base64
  const base64PrivateKey = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const base64PublicKey = publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  return { privateKey: base64PrivateKey, publicKey: base64PublicKey };
}

/**
 * Generate DNS records needed for domain verification
 */
function generateDnsRecords(
  domain: string,
  publicKey: string,
  dkimSelector: string,
  region: string,
): DnsRecord[] {
  return [
    // MX record for bounce handling
    {
      type: "MX" as const,
      name: `mail.${domain}`,
      value: `feedback-smtp.${region}.amazonses.com`,
      priority: 10,
    },
    // SPF record for mail subdomain
    {
      type: "TXT" as const,
      name: `mail.${domain}`,
      value: "v=spf1 include:amazonses.com ~all",
    },
    // DKIM record
    {
      type: "TXT" as const,
      name: `${dkimSelector}._domainkey.${domain}`,
      value: `p=${publicKey}`,
    },
    // DMARC record (recommended)
    {
      type: "TXT" as const,
      name: `_dmarc.${domain}`,
      value: "v=DMARC1; p=none;",
    },
  ];
}

/**
 * Add a domain to SES with DKIM signing
 */
export async function addSesDomain(
  domain: string,
  region?: string,
  dkimSelector: string = "mailer",
): Promise<DomainVerificationResult> {
  const awsRegion = region || process.env.AWS_DEFAULT_REGION || "us-east-1";

  try {
    const sesClient = getSesClient(awsRegion);
    const { privateKey, publicKey } = generateDkimKeyPair();

    // Create email identity with DKIM
    await sesClient.send(
      new CreateEmailIdentityCommand({
        EmailIdentity: domain,
        DkimSigningAttributes: {
          DomainSigningSelector: dkimSelector,
          DomainSigningPrivateKey: privateKey,
        },
      }),
    );

    // Set custom MailFrom domain for SPF
    await sesClient.send(
      new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domain,
        MailFromDomain: `mail.${domain}`,
      }),
    );

    const dnsRecords = generateDnsRecords(
      domain,
      publicKey,
      dkimSelector,
      awsRegion,
    );

    return {
      success: true,
      publicKey,
      dnsRecords,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error adding domain";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check domain verification status in SES
 */
export async function verifySesDomain(
  domain: string,
  region?: string,
): Promise<DomainStatusResult> {
  const awsRegion = region || process.env.AWS_DEFAULT_REGION || "us-east-1";

  try {
    const sesClient = getSesClient(awsRegion);
    const response = await sesClient.send(
      new GetEmailIdentityCommand({
        EmailIdentity: domain,
      }),
    );

    return {
      verified: response.VerificationStatus === "SUCCESS",
      dkimStatus: response.DkimAttributes?.Status,
      spfStatus: response.MailFromAttributes?.MailFromDomainStatus,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error verifying domain";
    return {
      verified: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete a domain from SES
 */
export async function deleteSesDomain(
  domain: string,
  region?: string,
): Promise<{ success: boolean; error?: string }> {
  const awsRegion = region || process.env.AWS_DEFAULT_REGION || "us-east-1";

  try {
    const sesClient = getSesClient(awsRegion);
    await sesClient.send(
      new DeleteEmailIdentityCommand({
        EmailIdentity: domain,
      }),
    );

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error deleting domain";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
