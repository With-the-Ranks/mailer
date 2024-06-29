import Form from "@/components/form";
import DeleteOrganizationForm from "@/components/form/delete-organization-form";
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
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
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

      <Form
        title="Description"
        description="The description of your organization."
        helpText="Include SEO-optimized keywords that you want to rank for."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: data?.description!,
          placeholder: "An organzation with great email campaign tool.",
        }}
        handleSubmit={updateOrganization}
      />

      <DeleteOrganizationForm organizationName={data?.name!} />
    </div>
  );
}
