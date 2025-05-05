import type { EmailProps } from "./donation-template";

export const SignupJSON = ({ logoUrl, fullWidthImageUrl }: EmailProps) => ({
  type: "doc",
  content: [
    {
      type: "section",
      attrs: {
        borderRadius: 6,
        backgroundColor: "#107FE5",
        align: "center",
        borderWidth: 0,
        paddingTop: 0,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        showIfKey: null,
      },
      content: [
        { type: "paragraph", attrs: { textAlign: "left", showIfKey: null } },
        {
          type: "logo",
          attrs: {
            src: logoUrl,
            alt: null,
            title: null,
            "maily-component": "logo",
            size: "sm",
            alignment: "center",
            showIfKey: null,
            isSrcVariable: false,
          },
        },
        {
          type: "image",
          attrs: {
            src: fullWidthImageUrl,
            alt: null,
            title: null,
            width: "80%",
            height: "auto",
            alignment: "center",
            externalLink: null,
            isExternalLinkVariable: false,
            borderRadius: 24,
            isSrcVariable: false,
            aspectRatio: 1.9047619047619047,
            lockAspectRatio: true,
            showIfKey: null,
          },
        },
        {
          type: "columns",
          attrs: { showIfKey: null, gap: 8 },
          content: [
            {
              type: "column",
              attrs: {
                columnId: "38597163-983e-44f8-a299-b441a9523d01",
                width: "5",
                verticalAlign: "bottom",
              },
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: null, showIfKey: null },
                },
              ],
            },
            {
              type: "column",
              attrs: {
                columnId: "1cc7d67b-8d3c-420b-bd75-d08ceeeb90a7",
                width: "90",
                verticalAlign: "top",
              },
              content: [
                {
                  type: "section",
                  attrs: {
                    borderRadius: 6,
                    backgroundColor: "#107FE5",
                    align: "center",
                    borderWidth: 0,
                    borderColor: "#e2e2e2",
                    paddingTop: 0,
                    paddingRight: 8,
                    paddingBottom: 8,
                    paddingLeft: 8,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    showIfKey: null,
                  },
                  content: [
                    {
                      type: "section",
                      attrs: {
                        borderRadius: 0,
                        backgroundColor: "",
                        align: "left",
                        borderWidth: 0,
                        borderColor: "",
                        paddingTop: 0,
                        paddingRight: 16,
                        paddingBottom: 16,
                        paddingLeft: 16,
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        showIfKey: null,
                      },
                      content: [
                        {
                          type: "heading",
                          attrs: {
                            textAlign: "left",
                            level: 1,
                            showIfKey: null,
                          },
                          content: [
                            {
                              type: "text",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                                { type: "bold" },
                              ],
                              text: "Join Bernie and AOC in Philly this Sunday!",
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          attrs: { textAlign: "left", showIfKey: null },
                          content: [
                            {
                              type: "text",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                              text: "Hey friend",
                            },
                            { type: "text", text: " " },
                            {
                              type: "text",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                              text: "— did you hear the news?",
                            },
                            {
                              type: "hardBreak",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                            },
                            {
                              type: "hardBreak",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                            },
                            {
                              type: "text",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                              text: "Bernie is joining a rally with Helen Gym and AOC in Philadelphia this Sunday, and he is hoping he can count on you to attend.",
                            },
                            {
                              type: "hardBreak",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                            },
                            {
                              type: "hardBreak",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                              ],
                            },
                            {
                              type: "text",
                              marks: [
                                {
                                  type: "textStyle",
                                  attrs: { color: "rgb(255, 255, 255)" },
                                },
                                { type: "bold" },
                              ],
                              text: "Here are all the details:",
                            },
                          ],
                        },
                        {
                          type: "section",
                          attrs: {
                            borderRadius: 20,
                            backgroundColor: "#FFFFFF",
                            align: "left",
                            borderWidth: 0,
                            borderColor: "#e2e2e2",
                            paddingTop: 16,
                            paddingRight: 16,
                            paddingBottom: 16,
                            paddingLeft: 16,
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: 0,
                            marginLeft: 0,
                            showIfKey: null,
                          },
                          content: [
                            { type: "horizontalRule" },
                            {
                              type: "heading",
                              attrs: {
                                textAlign: "center",
                                level: 3,
                                showIfKey: null,
                              },
                              content: [
                                {
                                  type: "text",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                    { type: "bold" },
                                  ],
                                  text: "RALLY WITH SENATOR BERNIE SANDERS, HELEN GYM AND AOC",
                                },
                              ],
                            },
                            {
                              type: "spacer",
                              attrs: { height: 8, showIfKey: null },
                            },
                            { type: "horizontalRule" },
                            {
                              type: "paragraph",
                              attrs: { textAlign: "center", showIfKey: null },
                              content: [
                                {
                                  type: "text",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                    { type: "bold" },
                                  ],
                                  text: "Sunday, May 14",
                                },
                                {
                                  type: "hardBreak",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                  text: "Doors open at 4:00 p.m.",
                                },
                                {
                                  type: "hardBreak",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                  text: "Event starts at 5:00 p.m.",
                                },
                                {
                                  type: "hardBreak",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                },
                                {
                                  type: "hardBreak",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  marks: [
                                    {
                                      type: "textStyle",
                                      attrs: { color: "#125B9E" },
                                    },
                                    { type: "bold" },
                                  ],
                                  text: "Franklin Music Hall 421 N 7th Street Philadelphia, PA 19123",
                                },
                              ],
                            },
                            {
                              type: "button",
                              attrs: {
                                text: "RSVP",
                                isTextVariable: false,
                                url: "",
                                isUrlVariable: false,
                                alignment: "center",
                                variant: "filled",
                                borderRadius: "round",
                                buttonColor: "#FF4141",
                                textColor: "#ffffff",
                                showIfKey: null,
                                paddingTop: 10,
                                paddingRight: 32,
                                paddingBottom: 10,
                                paddingLeft: 32,
                              },
                            },
                          ],
                        },
                      ],
                    },
                    { type: "spacer", attrs: { height: 8, showIfKey: null } },
                    {
                      type: "paragraph",
                      attrs: { textAlign: null, showIfKey: null },
                      content: [
                        {
                          type: "text",
                          marks: [
                            { type: "textStyle", attrs: { color: "#ffffff" } },
                          ],
                          text: "We hope to see you there!",
                        },
                      ],
                    },
                    {
                      type: "paragraph",
                      attrs: { textAlign: null, showIfKey: null },
                      content: [
                        {
                          type: "text",
                          marks: [
                            { type: "textStyle", attrs: { color: "#ffffff" } },
                            { type: "italic" },
                          ],
                          text: "- Team Bernie",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "column",
              attrs: {
                columnId: "27a977a1-3f8a-4758-81b8-646bfe916baa",
                width: "5",
                verticalAlign: "top",
              },
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: null, showIfKey: null },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
