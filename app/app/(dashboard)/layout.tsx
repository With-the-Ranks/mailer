import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import Profile from "@/components/profile";
import Nav from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <Nav>
        <Profile />
      </Nav>
      <div className="min-h-screen w-full overflow-x-hidden pt-5 dark:bg-black">
        <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />
        {children}
      </div>
    </SidebarProvider>
  );
}
