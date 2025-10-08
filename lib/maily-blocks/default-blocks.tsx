import {
  Building2,
  Circle,
  Columns,
  CornerDownLeft,
  Heading1,
  Heading2,
  Heading3,
  Image,
  ImageIcon,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  RotateCcw,
  Square as FooterIcon,
  Square as SpacerIcon,
  Square,
  Trash2,
  Type,
} from "lucide-react";

import type { BlockItem } from "./types";

// Default Maily blocks
export const createDefaultBlocks = (organization?: {
  logo?: string | null;
  image?: string | null;
}): BlockItem[] => [
  {
    title: "Text",
    icon: <Type className="h-4 w-4" />,
    description: "Just start typing with plain text.",
    searchTerms: ["text", "paragraph"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "paragraph",
          content: [{ type: "text", text: "Text" }],
        })
        .run();
    },
  },
  {
    title: "Heading 1",
    icon: <Heading1 className="h-4 w-4" />,
    description: "Big heading.",
    searchTerms: ["h1", "heading1", "title"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Heading 1" }],
        })
        .run();
    },
  },
  {
    title: "Heading 2",
    icon: <Heading2 className="h-4 w-4" />,
    description: "Medium heading.",
    searchTerms: ["h2", "heading2"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Heading 2" }],
        })
        .run();
    },
  },
  {
    title: "Heading 3",
    icon: <Heading3 className="h-4 w-4" />,
    description: "Small heading.",
    searchTerms: ["h3", "heading3"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Heading 3" }],
        })
        .run();
    },
  },
  {
    title: "Bullet List",
    icon: <List className="h-4 w-4" />,
    description: "Create a simple bullet list.",
    searchTerms: ["bullet", "list", "ul"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "text", text: "List item" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Ordered List",
    icon: <ListOrdered className="h-4 w-4" />,
    description: "Create a list with numbering.",
    searchTerms: ["ordered", "list", "ol", "numbered"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [{ type: "text", text: "List item" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Image",
    icon: <Image className="h-4 w-4" />,
    description: "Add an image to your email.",
    searchTerms: ["image", "picture", "photo"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      const defaultImage =
        organization?.image ||
        "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/xWeI0TM-GpziuotvjNV9MZnAaazSEJdQvKvsHP.png";
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "image",
          attrs: {
            src: defaultImage,
            alt: "Organization Image",
          },
        })
        .run();
    },
  },
  {
    title: "Logo",
    icon: <Building2 className="h-4 w-4" />,
    description: "Add your company logo.",
    searchTerms: ["logo", "brand"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      const defaultLogo =
        organization?.logo ||
        "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/V9V9woJ-p15PivASjXuq5gIW6xpgCb6Pes69i3.png";
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "logo",
          attrs: {
            src: defaultLogo,
            alt: "Organization Logo",
          },
        })
        .run();
    },
  },
  {
    title: "Inline Image",
    icon: <Image className="h-4 w-4" />,
    description: "Add a small inline image.",
    searchTerms: ["inline", "image", "small"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      const defaultImage =
        organization?.image ||
        "https://p8xzrdk6askgal6s.public.blob.vercel-storage.com/xWeI0TM-GpziuotvjNV9MZnAaazSEJdQvKvsHP.png";
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "inlineImage",
          attrs: {
            src: defaultImage,
            alt: "Organization Image",
          },
        })
        .run();
    },
  },
  {
    title: "Columns",
    icon: <Columns className="h-4 w-4" />,
    description: "Create a multi-column layout.",
    searchTerms: ["columns", "layout", "grid"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "columns",
          attrs: { gap: 8 },
          content: [
            {
              type: "column",
              attrs: { width: "50" },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Column 1" }],
                },
              ],
            },
            {
              type: "column",
              attrs: { width: "50" },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Column 2" }],
                },
              ],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Section",
    icon: <Square className="h-4 w-4" />,
    description: "Add a content section.",
    searchTerms: ["section", "container"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "section",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Section content" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Repeat",
    icon: <RotateCcw className="h-4 w-4" />,
    description: "Repeat content for each item.",
    searchTerms: ["repeat", "loop", "foreach"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "repeat",
          attrs: { each: "items" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Repeat content" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Divider",
    icon: <Minus className="h-4 w-4" />,
    description: "Add a horizontal divider line.",
    searchTerms: ["divider", "separator", "line"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "divider",
        })
        .run();
    },
  },
  {
    title: "Spacer",
    icon: <SpacerIcon className="h-4 w-4" />,
    description: "Add vertical spacing.",
    searchTerms: ["spacer", "space", "gap"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "spacer",
          attrs: { height: 20 },
        })
        .run();
    },
  },
  {
    title: "Button",
    icon: <Circle className="h-4 w-4" />,
    description: "Add a call-to-action button.",
    searchTerms: ["button", "cta", "call-to-action"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "button",
          attrs: {
            text: "Button",
            url: "#",
            variant: "filled",
            alignment: "center",
          },
        })
        .run();
    },
  },
  {
    title: "Link Card",
    icon: <Link className="h-4 w-4" />,
    description: "Add a link preview card.",
    searchTerms: ["link", "card", "preview"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "linkCard",
          attrs: {
            url: "https://example.com",
            title: "Link Title",
            description: "Link description",
          },
        })
        .run();
    },
  },
  {
    title: "Hard Break",
    icon: <CornerDownLeft className="h-4 w-4" />,
    description: "Add a line break.",
    searchTerms: ["break", "line", "br"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "hardBreak",
        })
        .run();
    },
  },
  {
    title: "Blockquote",
    icon: <Quote className="h-4 w-4" />,
    description: "Add a quoted text block.",
    searchTerms: ["quote", "blockquote"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Quote text" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Footer",
    icon: <FooterIcon className="h-4 w-4" />,
    description: "Add footer content.",
    searchTerms: ["footer", "end"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "footer",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Footer content" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Clear Line",
    icon: <Trash2 className="h-4 w-4" />,
    description: "Clear the current line.",
    searchTerms: ["clear", "empty"],
    command: ({ editor, range }: { editor: any; range: any }) => {
      editor
        .chain()
        .deleteRange(range)
        .insertContent({
          type: "clearLine",
        })
        .run();
    },
  },
];

// Backward compatibility - export the default blocks without organization data
export const defaultBlocks = createDefaultBlocks();
