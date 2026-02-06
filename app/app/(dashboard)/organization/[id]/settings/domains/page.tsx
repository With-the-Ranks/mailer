import { notFound } from "next/navigation";

import { getDefaultProvider } from "@/lib/email-providers";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

import DomainsClient from "./domains-client";

export default async function DomainsSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: organizationId } = await params;
  const session = await getSession();

  if (!session?.user.id) {
    notFound();
  }

  const emailProvider = getDefaultProvider();

  const organization = await prisma.organization.findUnique({
    where: { id: decodeURIComponent(organizationId) },
    select: {
      id: true,
      name: true,
      activeDomainId: true,
      emailApiKey: true,
      domains: {
        select: {
          id: true,
          domain: true,
          provider: true,
          status: true,
          awsRegion: true,
          dkimPublicKey: true,
          dkimSelector: true,
          dkimStatus: true,
          spfStatus: true,
          clickTracking: true,
          openTracking: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  const domainOptionsForResend = (organization.domains ?? []).map(
    (d: { id: string; domain: string; status: string | null }) => ({
      value: d.id,
      label: `${d.domain} — ${d.status ?? "Unknown"}`,
    }),
  );
  const selectOptionsForResend =
    domainOptionsForResend.length > 0
      ? domainOptionsForResend
      : [
          { value: "", label: `Default (${process.env.EMAIL_DOMAIN ?? ""})` },
          ...domainOptionsForResend,
        ];

  return (
    <DomainsClient
      emailProvider={emailProvider}
      organizationId={organization.id}
      organizationName={organization.name || "Organization"}
      domains={organization.domains}
      activeDomainId={organization.activeDomainId}
      emailApiKey={organization.emailApiKey ?? ""}
      domainOptionsForResend={selectOptionsForResend}
    />
  );
}
