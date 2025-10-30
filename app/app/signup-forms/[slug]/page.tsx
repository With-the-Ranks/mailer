import { notFound } from "next/navigation";

import PublicSignupForm from "@/components/public-signup-form";
import prisma from "@/lib/prisma";

export default async function PublicSignupFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const signupForm = await prisma.signupForm.findFirst({
    where: {
      slug: decodedSlug,
      isActive: true,
    },
    include: {
      fields: {
        orderBy: {
          order: "asc",
        },
      },
      organization: true,
    },
  });

  if (!signupForm) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {signupForm.name}
            </h1>
          </div>

          <PublicSignupForm signupForm={signupForm} />
        </div>
      </div>
    </div>
  );
}
