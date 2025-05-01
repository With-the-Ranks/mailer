export interface EmailProps {
  logoUrl: string;
  fullWidthImageUrl: string;
}

export const DonationJSON = ({ logoUrl, fullWidthImageUrl }: EmailProps) => {
  return {
    type: "doc",
    content: [
      {
        type: "image",
        attrs: {
          src: logoUrl,
          alt: "Logo",
          title: "Logo",
          "maily-component": "logo",
          size: "lg",
          alignment: "center",
        },
      },
      {
        type: "image",
        attrs: {
          src: fullWidthImageUrl,
          alt: "Preview Image",
          style: "display:block;width:100%;max-width:100%;height:auto;",
        },
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [{ type: "text", text: "Dear Friend," }],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "I’m John Smith, and I’m running for City Council because I believe we can make our community a better place to live. Our city is facing challenges, and the decisions we make now will shape our future. If elected, I’ll work to keep our neighborhoods safe, support local businesses, invest in our kids, and improve our public spaces.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "But I can’t do it alone. Running a strong campaign takes resources, and I need your help. Even a small contribution, like $10, can make a big difference.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Would you consider donating today to help us build a better future?",
          },
        ],
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $10 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $27 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $100 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Thank you so much for your support. Together, we can make this happen!",
          },
        ],
      },
    ],
  };
};
