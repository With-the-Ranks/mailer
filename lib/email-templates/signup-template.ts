import type { EmailProps } from "./donation-template";

export const SignupTemplate = ({ logoUrl, fullWidthImageUrl }: EmailProps) => {
  return `
    <img src="${fullWidthImageUrl}" alt="Hero Image" style="display:block;width:100%;max-width:100%;height:auto;border-radius:24px;">
    <img src="${logoUrl}" data-maily-component="logo" data-size="md" data-alignment="left" style="position:relative;margin-top:0;height:48px;margin-right:auto;margin-left:0">
    <div data-maily-component="spacer" data-height="xl" style="width:100%;height:64px;" class="spacer" contenteditable="false"></div>
    <h2><strong>Signup The Mailer</strong></h2>
    <p>Are you ready to take your digital marketing to the next level? Introducing The Mailer, the ultimate solution for managing and automating your digital campaigns effortlessly.</p>
    <p>Elevate your marketing efforts with The Mailer! Click below to try it out:</p>
    <a data-maily-component="button" mailycomponent="button" text="Sign up for The Mailer Now →" url="" alignment="left" variant="filled" borderradius="round" buttoncolor="#141313" textcolor="#ffffff"></a>
    <div data-maily-component="spacer" data-height="xl" style="width:100%;height:64px;" class="spacer" contenteditable="false"></div>
    <p>Join our vibrant community of users and developers on GitHub, where The Mailer is an <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/arikchakma/maily.to"><em>open-source</em></a> project. Together, we'll shape the future of digital marketing.</p>
    <p>Regards,<br>The The Mailer Team</p>
  `;
};

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
            text: "Signup The Mailer",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Are you ready to take your digital marketing to the next level? Introducing The Mailer, the ultimate solution for managing and automating your digital campaigns effortlessly.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Elevate your marketing efforts with The Mailer! Click below to try it out:",
          },
        ],
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Sign up for The Mailer Now →",
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
            text: "Join our vibrant community of users and developers on GitHub, where The Mailer is an ",
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
          { type: "text", text: "The The Mailer Team" },
        ],
      },
    ],
  };
};
