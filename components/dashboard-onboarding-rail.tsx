"use client";

import { ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

import type { OnboardingState } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

import DashboardOnboarding from "./dashboard-onboarding";
import { Button } from "./ui/button";

type DashboardOnboardingRailProps = {
  organizationId: string;
  userId: string;
  userRole: "ADMIN" | "MANAGER" | null;
  onboarding: OnboardingState;
  className?: string;
  collapsedClassName?: string;
};

type OnboardingStateResponse = {
  organizationId: string | null;
  userRole: "ADMIN" | "MANAGER" | null;
  onboarding: OnboardingState | null;
};

function getCollapsedKey(userId: string, organizationId: string): string {
  return `onboarding:collapsed:${userId}:${organizationId}`;
}

export default function DashboardOnboardingRail({
  organizationId,
  userId,
  userRole,
  onboarding,
  className,
  collapsedClassName,
}: DashboardOnboardingRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const fallbackState: OnboardingStateResponse = {
    organizationId,
    userRole,
    onboarding,
  };

  const { data } = useSWR<OnboardingStateResponse>(
    "/api/onboarding-state",
    (url: string) => fetch(url).then((res) => res.json()),
    {
      fallbackData: fallbackState,
      refreshInterval: (latest) => (latest?.onboarding?.shouldShow ? 15000 : 0),
      revalidateOnFocus: true,
    },
  );

  const activeState =
    data && data.organizationId === organizationId ? data : fallbackState;
  const activeOnboarding = activeState.onboarding;
  const activeUserRole = activeState.userRole;

  if (!activeOnboarding) {
    return null;
  }

  useEffect(() => {
    if (activeOnboarding.isComplete) {
      setCollapsed(false);
    }
  }, [activeOnboarding.isComplete]);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(
        getCollapsedKey(userId, organizationId),
      );
      setCollapsed(value === "1");
    } catch {
      setCollapsed(false);
    }
  }, [organizationId, userId]);

  const setCollapsedState = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(
        getCollapsedKey(userId, organizationId),
        next ? "1" : "0",
      );
    } catch {
      // ignore storage errors
    }
  };

  if (collapsed && activeOnboarding.shouldShow) {
    return (
      <div className={cn(className, collapsedClassName)}>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-10 w-10 border-[#D3D3D3] bg-white text-black shadow-xs hover:bg-stone-100 dark:border-[#D3D3D3] dark:bg-[#2D2D2D] dark:text-white dark:hover:bg-[#252525]"
          onClick={() => setCollapsedState(false)}
          aria-label="Expand onboarding panel"
          title="Open onboarding"
        >
          <ListChecks className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DashboardOnboarding
      organizationId={organizationId}
      userId={userId}
      userRole={activeUserRole}
      onboarding={activeOnboarding}
      onCollapse={() => setCollapsedState(true)}
      className={className}
    />
  );
}
