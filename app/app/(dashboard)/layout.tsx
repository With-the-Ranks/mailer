import type { ReactNode } from "react";

import Profile from "@/components/profile";
import Nav from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
