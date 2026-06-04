import Form from "@/components/form";
import { updateOrganization } from "@/lib/actions";
import { getOrganizationBrandColors } from "@/lib/organization-branding";
import prisma from "@/lib/prisma";
import { getTimezoneOptions } from "@/lib/timezones";

const LEGACY_DEFAULT_ORGANIZATION_LOGO_URL =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png";

export default async function OrganizationSettingsIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const timezoneOptions = getTimezoneOptions();
  const decodedId = decodeURIComponent(id);
  const [data, brandColors] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: decodedId },
      select: {
        name: true,
        fromName: true,
        logo: true,
        timezone: true,
      },
    }),
    getOrganizationBrandColors(decodedId),
  ]);
  const logoValue =
    data?.logo?.trim() === LEGACY_DEFAULT_ORGANIZATION_LOGO_URL
      ? ""
      : (data?.logo ?? "");

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
        title="Default From Name"
        description="Default sender name used for new emails."
        helpText="Leave blank to fall back to your organization name."
        inputAttrs={{
          name: "fromName",
          type: "text",
          defaultValue: data?.fromName ?? "",
          placeholder: data?.name ?? "My Campaign Organization",
          maxLength: 64,
          required: false,
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
      <Form
        title="Logo"
        description="The logo for your organization. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          defaultValue: logoValue,
        }}
        handleSubmit={updateOrganization}
      />
      <Form
        key={`backgroundColor-${brandColors.backgroundColor}`}
        title="Background color"
        description="Default background color for email templates."
        helpText="Pick a hex color used for template section backgrounds."
        inputAttrs={{
          name: "backgroundColor",
          type: "color",
          defaultValue: brandColors.backgroundColor,
        }}
        handleSubmit={updateOrganization}
      />
      <Form
        key={`buttonColor-${brandColors.buttonColor}`}
        title="Button color"
        description="Default button color for email templates."
        helpText="Pick a hex color used for call-to-action buttons."
        inputAttrs={{
          name: "buttonColor",
          type: "color",
          defaultValue: brandColors.buttonColor,
        }}
        handleSubmit={updateOrganization}
      />
    </div>
  );
}
