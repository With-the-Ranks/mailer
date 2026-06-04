import { notFound } from "next/navigation";

import { EmbedResizeScript } from "@/components/embed-resize-script";
import PublicSignupForm from "@/components/public-signup-form";
import { isValidHexColor } from "@/lib/color-validation";
import prisma from "@/lib/prisma";

function getQueryValue(
  search: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = search[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

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
  const sourceCode =
    getQueryValue(search, "sourceCode") ||
    getQueryValue(search, "source_code") ||
    getQueryValue(search, "sc");
  const source =
    getQueryValue(search, "source") ||
    getQueryValue(search, "utm_source") ||
    (embed ? "embed" : "direct");

  // Apply custom theme styles
  const getContainerStyle = () => {
    if (theme === "dark") {
      return "bg-[#282c4a] text-white border-[#282c4a]";
    }
    if (bgColor) {
      return `text-white border-transparent`;
    }
    return "bg-white text-gray-900 dark:bg-[#2D2D2D] dark:text-white";
  };

  const containerClass = `rounded-lg shadow-lg p-8 ${getContainerStyle()}`;
  const customBgStyle =
    bgColor && isValidHexColor(bgColor)
      ? { backgroundColor: `#${bgColor}` }
      : undefined;
  const pageBgStyle =
    embed && bgColor && isValidHexColor(bgColor)
      ? { backgroundColor: `#${bgColor}` }
      : undefined;
  const pageClass = embed
    ? "min-h-screen"
    : "min-h-screen bg-gray-50 py-12 dark:bg-[#0D0D0D]";

  return (
    <>
      {embed && <EmbedResizeScript formSlug={decodedSlug} />}
      <div className={pageClass} style={pageBgStyle}>
        <div className="mx-auto max-w-2xl">
          <div className={containerClass} style={customBgStyle}>
            {!hideTitle && (
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold">{signupForm.name}</h1>
              </div>
            )}
            <PublicSignupForm
              signupForm={signupForm}
              attribution={{
                source,
                sourceCode,
              }}
              theme={{
                buttonBg: (() => {
                  const btnBg = search.buttonBg as string | undefined;
                  return btnBg && isValidHexColor(btnBg)
                    ? btnBg
                    : theme === "dark" || bgColor
                      ? "ffffff"
                      : undefined;
                })(),
                buttonText: (() => {
                  const btnText = search.buttonText as string | undefined;
                  return btnText && isValidHexColor(btnText)
                    ? btnText
                    : theme === "dark" || bgColor
                      ? "000000"
                      : undefined;
                })(),
                inputBg:
                  theme === "dark" || bgColor
                    ? "rgba(255,255,255,0.1)"
                    : undefined,
                inputText: (() => {
                  const inputTextColor = search.inputTextColor as
                    | string
                    | undefined;
                  const inputColor = search.inputColor as string | undefined;
                  if (inputTextColor && isValidHexColor(inputTextColor)) {
                    return inputTextColor;
                  }
                  if (inputColor && isValidHexColor(inputColor)) {
                    return inputColor;
                  }
                  return theme === "dark" || bgColor ? "232656" : undefined;
                })(),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
