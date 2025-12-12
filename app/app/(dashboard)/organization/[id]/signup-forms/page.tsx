import { notFound, redirect } from "next/navigation";

import CreateSignupFormButton from "@/components/create-signup-form-button";
import SignupForms from "@/components/signup-forms";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function SignupFormsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      <div className="flex flex-col items-center space-y-4 md:items-start">
        <h1 className="mb-0 text-center text-2xl font-bold sm:text-3xl md:text-left dark:text-white">
          Signup Forms
        </h1>
        <div className="py-4 md:py-6 lg:py-8">
          <CreateSignupFormButton organizationId={decodeURIComponent(id)} />
        </div>
      </div>
      <SignupForms organizationId={decodeURIComponent(id)} />
    </>
  );
}
