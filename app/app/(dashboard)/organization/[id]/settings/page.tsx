import Form from "@/components/form";
import { updateOrganization } from "@/lib/actions";
import prisma from "@/lib/prisma";

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "US Eastern (America/New_York)" },
  { value: "America/Chicago", label: "US Central (America/Chicago)" },
  { value: "America/Denver", label: "US Mountain (America/Denver)" },
  { value: "America/Los_Angeles", label: "US Pacific (America/Los_Angeles)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
];

export default async function OrganizationSettingsIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
        title="Timezone"
        description="Timezone used for scheduling emails and displaying times in the dashboard."
        helpText="Default is US Eastern. Used for schedule picker and upcoming emails."
        inputAttrs={{
          name: "timezone",
          type: "text",
          defaultValue: data?.timezone ?? "America/New_York",
          placeholder: "America/New_York",
          options: TIMEZONE_OPTIONS,
        }}
        handleSubmit={updateOrganization}
      />
    </div>
  );
}
