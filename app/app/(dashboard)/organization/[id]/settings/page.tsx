import Link from "next/link";

import Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { updateOrganization } from "@/lib/actions";
import prisma from "@/lib/prisma";

export default async function OrganizationSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.organization.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      domains: true,
      activeDomain: true,
    },
  });

  const domainOptions =
    data?.domains.map((d) => ({
      value: d.id,
      label: d.domain + (d.status ? ` (${d.status})` : ""),
    })) ?? [];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-end gap-2">
        <Link href="https://resend.com/api-keys" target="_blank">
          <Button variant="outline" size="sm">
            Create API Key
          </Button>
        </Link>
        <Link
          href="https://resend.com/docs/api-reference/api-keys/create-api-key"
          target="_blank"
        >
          <Button variant="outline" size="sm">
            View API Docs
          </Button>
        </Link>
      </div>

      <Form
        title="Email API Key"
        description="Set a custom Resend API key for this organization."
        helpText="Optional. Overrides the email provider Resend API key."
        inputAttrs={{
          name: "emailApiKey",
          type: "password",
          defaultValue: data?.emailApiKey ?? "",
          placeholder: "re_abc123...",
        }}
        handleSubmit={updateOrganization}
      />
      <div className="flex justify-end gap-2">
        <Link href="https://resend.com/domains" target="_blank">
          <Button variant="outline" size="sm">
            Custom Domain
          </Button>
        </Link>
        <Link
          href="https://resend.com/docs/api-reference/domains/create-domain"
          target="_blank"
        >
          <Button variant="outline" size="sm">
            View API Docs
          </Button>
        </Link>
      </div>
      <Form
        title="Active Sending Domain"
        description={`Select the domain used to send emails. If none selected, defaults to ${process.env.EMAIL_DOMAIN}`}
        helpText={
          domainOptions.length === 0
            ? "No verified domains yet. Using default active sending domain."
            : "Choose a verified domain or leave blank to use the default."
        }
        inputAttrs={{
          name: "activeDomainId",
          type: "select",
          defaultValue: data?.activeDomain?.id ?? "",
          options: [
            {
              value: "default",
              label: `Default (${process.env.EMAIL_DOMAIN})`,
            },
            ...domainOptions,
          ],
        }}
        handleSubmit={updateOrganization}
        disabled={!data?.emailApiKey}
      />
    </div>
  );
}
