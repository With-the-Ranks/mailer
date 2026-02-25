"use client";

import { ListChecks } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import type { OnboardingState } from "@/lib/onboarding";

import DashboardOnboarding from "./dashboard-onboarding";
import { Button } from "./ui/button";

type DashboardOnboardingRailProps = {
  organizationId: string;
  userId: string;
  userRole: "ADMIN" | "MANAGER" | null;
  onboarding: OnboardingState;
  className?: string;
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
}: DashboardOnboardingRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const fallbackState = useMemo<OnboardingStateResponse>(
    () => ({
      organizationId,
      userRole,
      onboarding,
    }),
    [onboarding, organizationId, userRole],
  );

  const serverStateSignature = useMemo(
    () =>
      [
        organizationId,
        userRole ?? "none",
        onboarding.completedCount,
        onboarding.progressPercent,
        onboarding.isComplete ? "1" : "0",
        onboarding.shouldShow ? "1" : "0",
        onboarding.steps.map((step) => `${step.id}:${step.completed ? 1 : 0}`),
      ].join("|"),
    [onboarding, organizationId, userRole],
  );
  const previousServerStateSignature = useRef(serverStateSignature);

  const { data, mutate } = useSWR<OnboardingStateResponse>(
    "/api/onboarding-state",
    (url: string) =>
      fetch(url, { cache: "no-store" }).then((res) => res.json()),
    {
      fallbackData: fallbackState,
      refreshInterval: (latest) => (latest?.onboarding?.shouldShow ? 5000 : 0),
      revalidateOnFocus: true,
    },
  );

  const activeState =
    data && data.organizationId === organizationId ? data : fallbackState;
  const activeOnboarding = activeState.onboarding;
  const activeUserRole = activeState.userRole;

  useEffect(() => {
    if (previousServerStateSignature.current === serverStateSignature) {
      return;
    }
    previousServerStateSignature.current = serverStateSignature;

    void mutate(fallbackState, {
      revalidate: true,
    });
  }, [fallbackState, mutate, serverStateSignature]);

  useEffect(() => {
    void mutate();
  }, [mutate, pathname, searchParamsString]);

  useEffect(() => {
    if (activeOnboarding?.isComplete) {
      setCollapsed(false);
    }
  }, [activeOnboarding?.isComplete]);

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

  if (!activeOnboarding) {
    return null;
  }

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
      <div className={className}>
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
