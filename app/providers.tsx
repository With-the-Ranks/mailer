"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { ModalProvider } from "@/components/modal/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster richColors position="bottom-right" />
      <ModalProvider>{children}</ModalProvider>
    </SessionProvider>
  );
}
