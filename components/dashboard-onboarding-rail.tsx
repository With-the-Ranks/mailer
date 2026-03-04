"use client";

import { GripHorizontal, ListChecks } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function getPositionKey(userId: string, organizationId: string): string {
  return `onboarding:position:${userId}:${organizationId}`;
}

type PanelPosition = {
  x: number;
  y: number;
};

const PANEL_GAP = 8;
const PANEL_TOP_OFFSET = 16;
const PANEL_RIGHT_OFFSET = 16;

export default function DashboardOnboardingRail({
  organizationId,
  userId,
  userRole,
  onboarding,
  className,
  collapsedClassName,
}: DashboardOnboardingRailProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState<PanelPosition>({
    x: 24,
    y: PANEL_TOP_OFFSET,
  });
  const dragStart = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

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
  const isCollapsedButtonVisible = collapsed && activeOnboarding?.shouldShow;

  const getPanelSize = useCallback(() => {
    if (typeof window === "undefined") {
      return { width: 416, height: 520 };
    }
    return {
      width: Math.min(416, Math.max(280, window.innerWidth - PANEL_GAP * 2)),
      height: Math.min(560, Math.max(320, window.innerHeight - PANEL_GAP * 2)),
    };
  }, []);

  const clampPosition = useCallback(
    (next: PanelPosition): PanelPosition => {
      if (typeof window === "undefined") return next;
      const { width, height } = getPanelSize();
      const maxX = Math.max(PANEL_GAP, window.innerWidth - width - PANEL_GAP);
      const maxY = Math.max(PANEL_GAP, window.innerHeight - height - PANEL_GAP);

      return {
        x: Math.min(Math.max(PANEL_GAP, next.x), maxX),
        y: Math.min(Math.max(PANEL_GAP, next.y), maxY),
      };
    },
    [getPanelSize],
  );

  const defaultPosition = useMemo<PanelPosition>(() => {
    if (typeof window === "undefined") {
      return { x: 24, y: PANEL_TOP_OFFSET };
    }
    const { width } = getPanelSize();
    return clampPosition({
      x: window.innerWidth - width - PANEL_RIGHT_OFFSET,
      y: PANEL_TOP_OFFSET,
    });
  }, [clampPosition, getPanelSize]);

  const getAnchorPosition = useCallback((): PanelPosition => {
    if (typeof window === "undefined") {
      return { x: 24, y: PANEL_TOP_OFFSET };
    }
    const { width } = getPanelSize();
    return clampPosition({
      x: window.innerWidth - width - PANEL_RIGHT_OFFSET,
      y: PANEL_TOP_OFFSET,
    });
  }, [clampPosition, getPanelSize]);

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        getPositionKey(userId, organizationId),
      );
      if (!raw) {
        setPosition(defaultPosition);
        return;
      }
      const parsed = JSON.parse(raw) as PanelPosition;
      if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") {
        setPosition(defaultPosition);
        return;
      }
      setPosition(clampPosition(parsed));
    } catch {
      setPosition(defaultPosition);
    }
  }, [clampPosition, defaultPosition, organizationId, userId]);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => clampPosition(prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPosition]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        getPositionKey(userId, organizationId),
        JSON.stringify(position),
      );
    } catch {
      // ignore storage errors
    }
  }, [organizationId, position, userId]);

  if (!activeOnboarding) {
    return null;
  }

  const setCollapsedState = (next: boolean) => {
    if (!next) {
      setPosition(getAnchorPosition());
    }
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

  const handleDragStart = (
    event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    const onPointerMove = (moveEvent: PointerEvent) => {
      const state = dragStart.current;
      if (!state) return;
      const deltaX = moveEvent.clientX - state.pointerX;
      const deltaY = moveEvent.clientY - state.pointerY;
      const next = clampPosition({
        x: state.startX + deltaX,
        y: state.startY + deltaY,
      });
      setPosition(next);
    };
    const onPointerUp = () => {
      dragStart.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (isCollapsedButtonVisible) {
    return (
      <div
        className={cn(
          "fixed top-4 right-4 z-30",
          className,
          collapsedClassName,
        )}
      >
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
    <div
      className={cn("fixed z-30 w-[min(26rem,calc(100vw-1rem))]", className)}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="relative">
        {activeOnboarding.shouldShow && (
          <button
            type="button"
            className="absolute top-2 left-1/2 z-10 -translate-x-1/2 cursor-grab rounded-sm p-1 text-stone-500 hover:text-stone-700 active:cursor-grabbing dark:text-stone-400 dark:hover:text-stone-200"
            onPointerDown={handleDragStart}
            aria-label="Drag onboarding panel"
          >
            <GripHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
        <DashboardOnboarding
          organizationId={organizationId}
          userId={userId}
          userRole={activeUserRole}
          onboarding={activeOnboarding}
          onCollapse={() => setCollapsedState(true)}
        />
      </div>
    </div>
  );
}
