"use client";

import confetti from "canvas-confetti";
import { CheckCircle2, ChevronRight, Circle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { OnboardingState } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

type DashboardOnboardingProps = {
  organizationId: string;
  userId: string;
  userRole: "ADMIN" | "MANAGER" | null;
  onboarding: OnboardingState;
  onCollapse?: () => void;
  className?: string;
};

function fireOnboardingConfetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.62 },
  });
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { x: 0.2, y: 0.6 },
  });
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { x: 0.8, y: 0.6 },
  });
}

function getCelebrationKey(userId: string, organizationId: string): string {
  return `onboarding:celebrated:${userId}:${organizationId}`;
}

function getSuccessDismissKey(userId: string, organizationId: string): string {
  return `onboarding:success:dismissed:${userId}:${organizationId}`;
}

function getSuccessSnoozeKey(userId: string, organizationId: string): string {
  return `onboarding:success:snooze:${userId}:${organizationId}`;
}

export default function DashboardOnboarding({
  organizationId,
  userId,
  userRole,
  onboarding,
  onCollapse,
  className,
}: DashboardOnboardingProps) {
  const [completionResolved, setCompletionResolved] = useState(false);
  const [hideSuccessCard, setHideSuccessCard] = useState(false);
  const remainingSteps = onboarding.totalCount - onboarding.completedCount;

  useEffect(() => {
    if (!onboarding.isComplete) {
      setCompletionResolved(true);
      setHideSuccessCard(false);
      return;
    }

    const celebrationKey = getCelebrationKey(userId, organizationId);
    const dismissKey = getSuccessDismissKey(userId, organizationId);
    const snoozeKey = getSuccessSnoozeKey(userId, organizationId);

    try {
      const alreadyCelebrated =
        window.localStorage.getItem(celebrationKey) === "1";
      const dismissedForever = window.localStorage.getItem(dismissKey) === "1";
      const snoozedUntil = Number(
        window.localStorage.getItem(snoozeKey) || "0",
      );
      const now = Date.now();

      setHideSuccessCard(dismissedForever || snoozedUntil > now);

      if (alreadyCelebrated) {
        return;
      } else {
        window.localStorage.setItem(celebrationKey, "1");
        fireOnboardingConfetti();
      }
    } catch {
      setHideSuccessCard(false);
    } finally {
      setCompletionResolved(true);
    }
  }, [onboarding.isComplete, organizationId, userId]);

  if (!onboarding.isComplete) {
    if (!onboarding.shouldShow) return null;

    return (
      <Card
        className={cn(
          "border-[#D3D3D3] bg-white dark:border-[#D3D3D3] dark:bg-[#2D2D2D]",
          className,
        )}
      >
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
            <div>
              <CardTitle className="text-xl text-black dark:text-white">
                Getting Started
              </CardTitle>
              <CardDescription className="mt-1 text-stone-600 dark:text-stone-300">
                Complete these steps to launch your first campaign flow.
              </CardDescription>
            </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              {onCollapse && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 border-[#D3D3D3] bg-white text-black hover:bg-stone-100 dark:border-[#D3D3D3] dark:bg-[#2D2D2D] dark:text-white dark:hover:bg-[#252525]"
                  onClick={onCollapse}
                  aria-label="Collapse onboarding panel"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-[#D3D3D3] bg-white p-3 dark:border-[#D3D3D3] dark:bg-[#252525]">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {onboarding.completedCount}/{onboarding.totalCount}
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  completed
                </span>
              </div>
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                {remainingSteps} remaining
              </span>
            </div>
          </div>
          <Progress value={onboarding.progressPercent} className="mt-4 h-2.5" />
        </CardHeader>
        <CardContent className="space-y-3">
          {onboarding.steps.map((step, index) => {
            const needsAdmin =
              (step.id === "branding" || step.id === "domain-setup") &&
              !step.completed &&
              userRole !== "ADMIN";
            const isCreateStep =
              step.id === "people" ||
              step.id === "signup" ||
              step.id === "first-email";

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-start justify-between gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center",
                  step.completed
                    ? "border-[#D3D3D3] bg-green-50/70 dark:border-[#D3D3D3] dark:bg-green-900/20"
                    : "border-[#D3D3D3] bg-white dark:border-[#D3D3D3] dark:bg-[#252525]",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-stone-400 dark:text-stone-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black dark:text-white">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto sm:shrink-0">
                  {step.completed ? (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-700 dark:border-green-500 dark:text-green-300"
                    >
                      Completed
                    </Badge>
                  ) : needsAdmin ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full sm:w-auto"
                    >
                      Admin required
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="w-full sm:w-auto">
                      <Link href={step.href} scroll={step.scroll}>
                        {isCreateStep ? "Create" : "Continue"}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (!completionResolved || hideSuccessCard) {
    return null;
  }

  const hideForToday = () => {
    try {
      const oneDayMs = 24 * 60 * 60 * 1000;
      window.localStorage.setItem(
        getSuccessSnoozeKey(userId, organizationId),
        String(Date.now() + oneDayMs),
      );
    } finally {
      setHideSuccessCard(true);
    }
  };

  const dismissForever = () => {
    try {
      window.localStorage.setItem(
        getSuccessDismissKey(userId, organizationId),
        "1",
      );
    } finally {
      setHideSuccessCard(true);
    }
  };

  return (
    <Card
      className={cn(
        "border-[#D3D3D3] bg-green-50/70 dark:border-[#D3D3D3] dark:bg-green-900/20",
        className,
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-green-700 dark:text-green-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Onboarding complete
          </p>
          <p className="text-xs text-green-700/90 dark:text-green-300/90">
            Great work. You completed {onboarding.completedCount}/
            {onboarding.totalCount} steps.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[#D3D3D3] bg-white text-black hover:bg-stone-100 dark:border-[#D3D3D3] dark:bg-[#2D2D2D] dark:text-white dark:hover:bg-[#252525]"
              onClick={dismissForever}
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 border-[#D3D3D3] bg-white text-black hover:bg-stone-100 dark:border-[#D3D3D3] dark:bg-[#2D2D2D] dark:text-white dark:hover:bg-[#252525]"
          onClick={hideForToday}
          aria-label="Hide onboarding success today"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
