import Form from "@/components/form";
import { updateOrganization } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { getTimezoneOptions } from "@/lib/timezones";

export default async function OrganizationSettingsIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const timezoneOptions = getTimezoneOptions();
  const data = await prisma.organization.findUnique({
    where: { id: decodeURIComponent(id) },
    select: {
      name: true,
      logo: true,
      timezone: true,
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Organization's Name"
        description="The name of your organization."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name ?? "",
          placeholder: "My Campaign Organization",
          maxLength: 32,
        }}
        handleSubmit={updateOrganization}
      />
      <Form
        title="Logo"
        description="The logo for your organization. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          defaultValue: "",
        }}
        handleSubmit={updateOrganization}
      />
      <Form
        key={`timezone-${data?.timezone ?? "default"}`}
        title="Timezone"
        description="Timezone used for scheduling emails and displaying times in the dashboard."
        helpText="Default is US Eastern. Used for schedule picker and upcoming emails."
        inputAttrs={{
          name: "timezone",
          type: "text",
          defaultValue: data?.timezone ?? "America/New_York",
          placeholder: "America/New_York",
          options: timezoneOptions,
        }}
        handleSubmit={updateOrganization}
      />
    </div>
  );
}
