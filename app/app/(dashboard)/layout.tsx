import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import DashboardOnboardingRail from "@/components/dashboard-onboarding-rail";
import Profile from "@/components/profile";
import Nav from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { getCurrentOnboardingState } from "@/lib/onboarding-state";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const { organizationId, userRole, onboarding } =
    await getCurrentOnboardingState(userId);

  return (
    <SidebarProvider>
      <Nav>
        <Profile />
      </Nav>
      <div className="bg-dotted min-h-screen w-full overflow-x-hidden pt-5 dark:bg-[#0D0D0D]">
        <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />
        {organizationId && onboarding && (
          <DashboardOnboardingRail
            organizationId={organizationId}
            userId={userId}
            userRole={userRole}
            onboarding={onboarding}
          />
        )}
        <main className="mx-auto w-full max-w-7xl px-4 pt-2 pb-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
