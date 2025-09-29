import Link from "next/link";

import Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { updateOrganization } from "@/lib/actions";
import prisma from "@/lib/prisma";

export default async function OrganizationSettingsIndex({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await prisma.organization.findUnique({
    where: { id: decodeURIComponent(id) },
    select: {
      name: true,
      emailApiKey: true,
      activeDomainId: true,
      domains: {
        select: { id: true, domain: true, status: true },
      },
    },
  });

  const domainOptions = (data?.domains ?? []).map((d) => ({
    value: d.id,
    label: `${d.domain} — ${d.status}`,
  }));

  const selectOptions =
    domainOptions.length > 0
      ? domainOptions
      : [
          { value: "", label: `Default (${process.env.EMAIL_DOMAIN})` },
          ...domainOptions,
        ];
  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Organization's Name"
        description="The name of your organization."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "My Campaign Organization",
          maxLength: 32,
        }}
        handleSubmit={updateOrganization}
      />
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
        description={`Pick which verified domain Resend should use. Defaults to ${process.env.EMAIL_DOMAIN}`}
        helpText={
          domainOptions.length === 0
            ? "No domains on this API key yet."
            : "Choose a domain (or leave blank for default)."
        }
        inputAttrs={{
          name: "activeDomainId",
          type: "select",
          defaultValue: data?.activeDomainId || "",
          options: selectOptions,
        }}
        handleSubmit={updateOrganization}
        disabled={domainOptions.length === 0}
      />
    </div>
  );
}
