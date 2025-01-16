import type { ReactNode } from "react";

import Nav from "@/components/nav";
import Profile from "@/components/profile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Nav>
        <Profile />
      </Nav>
      <div className="min-h-screen dark:bg-black sm:pl-60">{children}</div>
    </div>
  );
}
