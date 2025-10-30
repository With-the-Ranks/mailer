import { notFound, redirect } from "next/navigation";

import SignupFormEditor from "@/components/signup-form-editor";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function EditSignupFormPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const { id, formId } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const signupForm = await prisma.signupForm.findFirst({
    where: {
      id: decodeURIComponent(formId),
      organizationId: decodeURIComponent(id),
      organization: {
        users: {
          some: {
            id: session.user.id as string,
          },
        },
      },
    },
    include: {
      fields: {
        orderBy: {
          order: "asc",
        },
      },
      organization: true,
      audienceList: true,
    },
  });

  if (!signupForm) {
    notFound();
  }

  // Get audience lists for the organization
  const audienceLists = await prisma.audienceList.findMany({
    where: {
      organizationId: decodeURIComponent(id),
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Signup Form
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your signup form fields and settings
        </p>
      </div>

      <SignupFormEditor
        signupForm={signupForm}
        audienceLists={audienceLists}
        organizationId={decodeURIComponent(id)}
      />
    </div>
  );
}
