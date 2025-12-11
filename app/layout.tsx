import "fumadocs-ui/style.css";
import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";

import { Providers } from "./providers";

const title = "Mailer - Easiest way to send organizing emails";
const description =
  "Mailer makes it easy for anyone to quickly send high-performing emails.";
const image = "https://withtheranks.com/assets/meta.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["/mailer.svg"],
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
