import { FileText } from "lucide-react";

import type { BlockItem, SignupForm } from "./types";

// Create a default signup block that uses the first available signup form
export function createDefaultSignupBlock(signupForms: SignupForm[]): BlockItem {
  const firstForm =
    signupForms && signupForms.length > 0 ? signupForms[0] : null;

  return {
    title: "Signup Form",
    icon: <FileText className="h-4 w-4" />,
    description: firstForm
      ? `Add a button for ${firstForm.name} signup form.`
      : "Add a signup form button.",
    searchTerms: ["signup", "form", "subscribe", "button"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      const baseUrl = window.location.origin;
      const signupUrl = firstForm
        ? `${baseUrl}/signup-forms/${firstForm.slug}`
        : `${baseUrl}/signup-forms`;

      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "columns",
          attrs: { showIfKey: null, gap: 8 },
          content: [
            {
              type: "column",
              attrs: {
                columnId: firstForm
                  ? `signup-form-${firstForm.id}-column`
                  : "signup-form-default-column",
                width: "100",
                verticalAlign: "top",
              },
              content: [
                {
                  type: "button",
                  attrs: {
                    url: signupUrl,
                    text: firstForm ? firstForm.name : "Sign Up",
                    variant: "filled",
                    alignment: "center",
                    showIfKey: null,
                    textColor: "#ffffff",
                    paddingTop: 12,
                    buttonColor: "#3611C9",
                    paddingLeft: 32,
                    borderRadius: "round",
                    paddingRight: 32,
                    isUrlVariable: false,
                    isTextVariable: false,
                    paddingBottom: 12,
                  },
                },
                ...(firstForm?.description
                  ? [
                      {
                        type: "paragraph" as const,
                        attrs: {
                          showIfKey: null,
                          textAlign: "center" as const,
                        },
                        content: [
                          {
                            type: "text" as const,
                            marks: [
                              {
                                type: "textStyle" as const,
                                attrs: {
                                  color: "#6b7280",
                                  fontSize: "12px",
                                },
                              },
                            ],
                            text: firstForm.description,
                          },
                        ],
                      },
                    ]
                  : []),
              ],
            },
          ],
        })
        .run();
    },
  };
}

// Create dynamic signup form blocks from API data
export function createSignupFormBlocks(signupForms: SignupForm[]): BlockItem[] {
  if (!signupForms || signupForms.length === 0) {
    return [];
  }

  return signupForms.map((form) => ({
    title: form.name,
    icon: <FileText className="h-4 w-4" />,
    description: `Add a button for ${form.name} signup form.`,
    searchTerms: [
      "signup",
      "form",
      "subscribe",
      "button",
      form.name.toLowerCase(),
      form.slug,
    ],
    command: ({ editor, range }: { editor: any; range: any }) => {
      const baseUrl = window.location.origin;
      const signupUrl = `${baseUrl}/signup-forms/${form.slug}`;

      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "columns",
          attrs: { showIfKey: null, gap: 8 },
          content: [
            {
              type: "column",
              attrs: {
                columnId: `signup-form-${form.id}-column`,
                width: "100",
                verticalAlign: "top",
              },
              content: [
                {
                  type: "button",
                  attrs: {
                    url: signupUrl,
                    text: form.name,
                    variant: "filled",
                    alignment: "center",
                    showIfKey: null,
                    textColor: "#ffffff",
                    paddingTop: 12,
                    buttonColor: "#3611C9",
                    paddingLeft: 32,
                    borderRadius: "round",
                    paddingRight: 32,
                    isUrlVariable: false,
                    isTextVariable: false,
                    paddingBottom: 12,
                  },
                },
                ...(form.description
                  ? [
                      {
                        type: "paragraph" as const,
                        attrs: {
                          showIfKey: null,
                          textAlign: "center" as const,
                        },
                        content: [
                          {
                            type: "text" as const,
                            marks: [
                              {
                                type: "textStyle" as const,
                                attrs: {
                                  color: "#6b7280",
                                  fontSize: "12px",
                                },
                              },
                            ],
                            text: form.description,
                          },
                        ],
                      },
                    ]
                  : []),
              ],
            },
          ],
        })
        .run();
    },
  }));
}
