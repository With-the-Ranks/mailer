import { describe, expect, test } from "vitest";
import {
  applyOrganizationBrandingToEmailContent,
  getPreferredOrganizationLogoSrc,
} from "@/lib/maily-blocks/logo-utils";

const DEFAULT_TEMPLATE_LOGO_URL =
  "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/logo.png";

describe("getPreferredOrganizationLogoSrc", () => {
  test("prefers organization logo over fallback image", () => {
    expect(
      getPreferredOrganizationLogoSrc({
        logo: "https://cdn.example.com/logo.png",
        image: "https://cdn.example.com/image.png",
      }),
    ).toBe("https://cdn.example.com/logo.png");
  });

  test("falls back to image when logo is empty", () => {
    expect(
      getPreferredOrganizationLogoSrc({
        logo: "   ",
        image: "https://cdn.example.com/image.png",
      }),
    ).toBe("https://cdn.example.com/image.png");
  });
});

describe("applyOrganizationBrandingToEmailContent", () => {
  test("replaces template default logo src with organization logo", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "logo",
          attrs: { src: DEFAULT_TEMPLATE_LOGO_URL },
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      logo: "https://cdn.example.com/org-logo.png",
    });

    expect((result as any).content[0].attrs.src).toBe(
      "https://cdn.example.com/org-logo.png",
    );
  });

  test("replaces empty logo src with organization logo", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "logo",
          attrs: { src: "" },
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      logo: "https://cdn.example.com/org-logo.png",
    });

    expect((result as any).content[0].attrs.src).toBe(
      "https://cdn.example.com/org-logo.png",
    );
  });

  test("does not overwrite custom logo src in content", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "logo",
          attrs: { src: "https://cdn.example.com/custom-template-logo.png" },
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      logo: "https://cdn.example.com/org-logo.png",
    });

    expect((result as any).content[0].attrs.src).toBe(
      "https://cdn.example.com/custom-template-logo.png",
    );
  });

  test("returns original content when organization has no logo or image", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "logo",
          attrs: { src: DEFAULT_TEMPLATE_LOGO_URL },
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      logo: null,
      image: null,
    });

    expect(result).toBe(content);
  });

  test("replaces default section background and button colors", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: { backgroundColor: "#ffffff", borderColor: "#D4D4D4" },
          content: [
            {
              type: "button",
              attrs: { buttonColor: "#1547E6" },
            },
            {
              type: "text",
              text: "Unsubscribe",
              marks: [
                { type: "link", attrs: { href: "{{unsubscribe_url}}" } },
                { type: "textStyle", attrs: { color: "#2563eb" } },
              ],
            },
          ],
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      backgroundColor: "#f0f7ff",
      buttonColor: "#0a5ad8",
    });

    expect((result as any).content[0].attrs.backgroundColor).toBe("#f0f7ff");
    expect((result as any).content[0].attrs.borderColor).toBe("#99bbf0");
    expect((result as any).content[0].content[0].attrs.buttonColor).toBe(
      "#0a5ad8",
    );
    expect((result as any).content[0].content[1].marks[1].attrs.color).toBe(
      "#0a5ad8",
    );
  });

  test("does not overwrite custom section background and button colors", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "section",
          attrs: { backgroundColor: "#f3f4f6" },
          content: [
            {
              type: "button",
              attrs: { buttonColor: "#16a34a" },
            },
            {
              type: "text",
              text: "Custom link",
              marks: [
                { type: "link", attrs: { href: "https://example.com" } },
                { type: "textStyle", attrs: { color: "#9333ea" } },
              ],
            },
          ],
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      backgroundColor: "#f0f7ff",
      buttonColor: "#0a5ad8",
    });

    expect((result as any).content[0].attrs.backgroundColor).toBe("#f3f4f6");
    expect((result as any).content[0].content[0].attrs.buttonColor).toBe(
      "#16a34a",
    );
    expect((result as any).content[0].content[1].marks[1].attrs.color).toBe(
      "#9333ea",
    );
  });

  test("adds textStyle color to link marks when missing", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Visit profile",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      buttonColor: "#0a5ad8",
    });

    const marks = (result as any).content[0].content[0].marks;
    const textStyleMark = marks.find((mark: any) => mark.type === "textStyle");
    expect(textStyleMark?.attrs?.color).toBe("#0a5ad8");
  });

  test("normalizes numeric button borderRadius to smooth for renderer compatibility", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "button",
          attrs: {
            text: "Sign up",
            url: "https://example.com",
            borderRadius: 8,
            buttonColor: "#1547E6",
          },
        },
      ],
    };

    const result = applyOrganizationBrandingToEmailContent(content, {
      buttonColor: "#0a5ad8",
    });

    expect((result as any).content[0].attrs.borderRadius).toBe("smooth");
  });
});
