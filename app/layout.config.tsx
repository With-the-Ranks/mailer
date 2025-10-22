import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Mailer Documentation",
  },
  links: [
    {
      text: "Dashboard",
      url: "/",
      active: "none",
    },
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
  githubUrl: "https://github.com/With-the-Ranks/mailer",
};
