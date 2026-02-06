import { notFound, redirect } from "next/navigation";

import SignupFormEditor from "@/components/signup-form-editor";
import { getSession, isOrgMember } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function SignupFormCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const organizationId = decodeURIComponent(id);

  const isMember = await isOrgMember(session.user.id as string, organizationId);
  if (!isMember) {
    notFound();
  }

  const audienceLists = await prisma.audienceList.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Signup Form
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your form and save to create it. You can then activate it to
          get the public link and embed code.
        </p>
      </div>

      <SignupFormEditor
        signupForm={null}
        audienceLists={audienceLists}
        organizationId={organizationId}
      />
    </div>
  );
}
