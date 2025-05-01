import type { EmailProps } from "./donation-template";

export const SignupJSON = ({ logoUrl, fullWidthImageUrl }: EmailProps) => {
  return {
    type: "doc",
    content: [
      {
        type: "image",
        attrs: {
          src: fullWidthImageUrl,
          alt: "Banner Image",
          style:
            "display:block;width:100%;max-width:100%;height:auto;border-radius:24px;",
        },
      },
      {
        type: "logo",
        attrs: {
          src: logoUrl,
          alt: null,
          title: null,
          "maily-component": "logo",
          size: "md",
          alignment: "center",
        },
      },
      { type: "spacer", attrs: { height: "xl" } },
      {
        type: "heading",
        attrs: { textAlign: "left", level: 2 },
        content: [
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Signup Mailer",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Are you ready to take your digital marketing to the next level? Introducing Mailer, the ultimate solution for managing and automating your digital campaigns effortlessly.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Elevate your marketing efforts with Mailer! Click below to try it out:",
          },
        ],
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Sign up for Mailer Now →",
          url: "",
          alignment: "left",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#141313",
          textColor: "#ffffff",
        },
      },
      { type: "spacer", attrs: { height: "xl" } },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Join our vibrant community of users and developers on GitHub, where Mailer is an ",
          },
          {
            type: "text",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://github.com/arikchakma/maily.to",
                  target: "_blank",
                  rel: "noopener noreferrer nofollow",
                  class: null,
                },
              },
              { type: "italic" },
            ],
            text: "open-source",
          },
          {
            type: "text",
            text: " project. Together, we'll shape the future of digital marketing.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          { type: "text", text: "Regards," },
          { type: "hardBreak" },
          { type: "text", text: "The Mailer Team" },
        ],
      },
    ],
  };
};
