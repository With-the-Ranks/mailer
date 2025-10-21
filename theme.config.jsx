export default {
  logo: <strong>Mailer Documentation</strong>,
  logoLink: "/docs",
  project: {
    link: "https://github.com/With-the-Ranks/mailer",
  },
  docsRepositoryBase: "https://github.com/With-the-Ranks/mailer/tree/main",
  head: () => {
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://withtheranks.com/favicon.svg" />
        <meta
          property="og:description"
          content="Documentation for Mailer - Simple solution for managing and automating digital campaigns"
        />
      </>
    );
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Mailer",
    };
  },
  primaryHue: 260,
  primarySaturation: 80,
  footer: {
    component: (
      <div className="w-full border-t py-4 text-center">
        <p className="text-sm text-gray-600">
          MIT {new Date().getFullYear()} © Mailer
        </p>
      </div>
    ),
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    titleComponent: ({ title, type }) => {
      if (type === "separator") {
        return <div className="mb-2 mt-4 font-semibold">{title}</div>;
      }
      return title;
    },
  },
};
