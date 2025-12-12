import { UserMinus } from "lucide-react";

import type { BlockItem } from "./types";

export function createUnsubscribeBlock(): BlockItem {
  return {
    title: "Unsubscribe",
    icon: <UserMinus className="h-4 w-4" />,
    description: "Add a default unsubscribe footer block.",
    searchTerms: ["unsubscribe", "footer", "optout", "compliance"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "section",
          attrs: {
            align: "center",
            paddingTop: 16,
            paddingBottom: 16,
            showIfKey: null,
          },
          content: [
            {
              type: "paragraph",
              attrs: {
                showIfKey: null,
                textAlign: "center",
              },
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "textStyle",
                      attrs: {
                        color: "#6b7280",
                        fontSize: "12px",
                      },
                    },
                  ],
                  text: "If you no longer wish to receive these emails, please unsubscribe here: ",
                },
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "{{unsubscribe_url}}",
                        target: "_blank",
                        rel: "noopener noreferrer nofollow",
                      },
                    },
                    {
                      type: "textStyle",
                      attrs: {
                        color: "#2563eb",
                        fontSize: "12px",
                        textDecoration: "underline",
                      },
                    },
                  ],
                  text: "Unsubscribe",
                },
              ],
            },
          ],
        })
        .run();
    },
  };
}
