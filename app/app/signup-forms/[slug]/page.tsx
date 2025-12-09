import { notFound } from "next/navigation";

import { EmbedResizeScript } from "@/components/embed-resize-script";
import PublicSignupForm from "@/components/public-signup-form";
import prisma from "@/lib/prisma";

export default async function PublicSignupFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const search = await searchParams;

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

  // Theme parameters
  const theme = search.theme as string | undefined;
  const bgColor = search.bg as string | undefined;
  const embed = search.embed === "true";
  const hideTitle = search.hideTitle === "true" || search.notitle === "true";

  // Apply custom theme styles
  const getContainerStyle = () => {
    if (theme === "dark") {
      return "bg-[#282c4a] text-white border-[#282c4a]";
    }
    if (bgColor) {
      return `text-white border-transparent`;
    }
    return "bg-white text-gray-900 dark:bg-gray-800 dark:text-white";
  };

  const containerClass = `rounded-lg shadow-lg p-8 ${getContainerStyle()}`;
  const customBgStyle = bgColor
    ? { backgroundColor: `#${bgColor}` }
    : undefined;
  const pageClass = embed
    ? "min-h-screen bg-transparent"
    : "min-h-screen bg-gray-50 py-12 dark:bg-gray-900";

  return (
    <>
      {embed && <EmbedResizeScript formSlug={decodedSlug} />}
      <div className={pageClass}>
        <div className="mx-auto max-w-2xl">
          <div className={containerClass} style={customBgStyle}>
            {!hideTitle && (
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold">{signupForm.name}</h1>
              </div>
            )}
            <PublicSignupForm
              signupForm={signupForm}
              theme={{
                buttonBg:
                  (search.buttonBg as string | undefined) ||
                  (theme === "dark" || bgColor ? "ffffff" : undefined),
                buttonText:
                  (search.buttonText as string | undefined) ||
                  (theme === "dark" || bgColor ? "000000" : undefined),
                inputBg:
                  theme === "dark" || bgColor
                    ? "rgba(255,255,255,0.1)"
                    : undefined,
                inputText:
                  (search.inputTextColor as string | undefined) ||
                  (search.inputColor as string | undefined) ||
                  (theme === "dark" || bgColor ? "232656" : undefined),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
