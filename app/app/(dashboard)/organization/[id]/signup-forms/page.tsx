import { notFound, redirect } from "next/navigation";

import CreateSignupFormButton from "@/components/create-signup-form-button";
import SignupForms from "@/components/signup-forms";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function SignupFormsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const organizationId = decodeURIComponent(params.id);

  const isMember = await isOrgMember(session.user.id as string, organizationId);
  if (!isMember) {
    notFound();
  }

  const data = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 xl:flex-row xl:space-y-0">
        <div className="flex flex-col items-center space-y-2 xl:flex-row xl:space-x-4 xl:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            Signup Forms for Audience list
          </h1>
        </div>
        <CreateSignupFormButton
          organizationId={decodeURIComponent(params.id)}
        />
      </div>
      <SignupForms organizationId={decodeURIComponent(params.id)} />
    </>
  );
}
