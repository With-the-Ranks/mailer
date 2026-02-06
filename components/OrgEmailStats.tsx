"use client";

import EmailStats from "@/components/EmailStats";
import SesOrgStats from "@/components/SesOrgStats";

interface OrgEmailStatsProps {
  organizationId: string;
  emailProvider: "ses" | "resend";
}

export default function OrgEmailStats({
  organizationId,
  emailProvider,
}: OrgEmailStatsProps) {
  if (emailProvider === "ses") {
    return <SesOrgStats organizationId={organizationId} />;
  }

  return <EmailStats organizationId={organizationId} />;
}
