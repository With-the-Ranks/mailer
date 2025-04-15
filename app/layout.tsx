import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";

import { Providers } from "./providers";

const title =
  "Mailer – Simple solution for managing and automating digital campaigns.";
const description =
  "Mailer is a comprehensive platform designed to streamline digital marketing and campaign management.";
const image = "https://withtheranks.com/assets/meta.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["https://withtheranks.com/favicon.svg"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: "@vercel",
  },
  metadataBase: new URL("https://app.withtheranks.coop/"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
