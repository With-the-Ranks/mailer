import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});

export const docs = defineDocs({
  dir: "content/docs",
});
