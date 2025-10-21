"use client";

import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_REASONS = [
  "I receive too many emails",
  "The content is not relevant to me",
  "I never signed up for this list",
  "The emails are too frequent",
  "I prefer other communication channels",
  "Other",
];

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "manual" }
  | {
      status: "ready";
      email: string;
      listId: string;
      alreadyUnsubscribed: boolean;
      reasons: string[];
    };

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function UnsubscribePageContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email");
  const listParam = searchParams?.get("list");
  const organizationParam = searchParams?.get("organization");

  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const [manualEmail, setManualEmail] = useState("");
  const [manualListId, setManualListId] = useState("");

  useEffect(() => {
    if (!emailParam) {
      setManualEmail("");
      setManualListId("");
      setFetchState({ status: "manual" });
      return;
    }

    if (!listParam && !organizationParam) {
      setManualEmail(emailParam ?? "");
      setManualListId("");
      setFetchState({ status: "manual" });
      return;
    }

    const controller = new AbortController();

    async function loadAudienceDetails() {
      setFetchState({ status: "loading" });
      try {
        const params = new URLSearchParams();
        if (emailParam) params.set("email", emailParam);
        if (listParam) params.set("list", listParam);
        if (organizationParam) params.set("organization", organizationParam);

        const response = await fetch(`/api/unsubscribe?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Unable to load unsubscribe data.");
        }

        const data = await response.json();

        setFetchState({
          status: "ready",
          email: data.email,
          listId: data.listId,
          alreadyUnsubscribed: Boolean(data.alreadyUnsubscribed),
          reasons:
            Array.isArray(data.reasons) && data.reasons.length > 0
              ? data.reasons
              : DEFAULT_REASONS,
        });
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        setFetchState({
          status: "error",
          message: error?.message || "Failed to load unsubscribe data.",
        });
      }
    }

    loadAudienceDetails();

    return () => controller.abort();
  }, [emailParam, listParam, organizationParam]);

  const handleSubmit = useCallback(async () => {
    if (fetchState.status === "manual") {
      const trimmedEmail = manualEmail.trim();
      if (!trimmedEmail) {
        setSubmitState({
          status: "error",
          message: "Please enter an email address to unsubscribe.",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setSubmitState({
          status: "error",
          message: "Please enter a valid email address.",
        });
        return;
      }

      setSubmitState({ status: "submitting" });

      try {
        const params = new URLSearchParams({ email: trimmedEmail });
        if (manualListId.trim()) params.set("list", manualListId.trim());
        if (organizationParam) params.set("organization", organizationParam);

        const response = await fetch(`/api/unsubscribe?${params.toString()}`);

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            payload?.error || "Unable to find that subscription.",
          );
        }

        const data = await response.json();

        setFetchState({
          status: "ready",
          email: data.email,
          listId: data.listId,
          alreadyUnsubscribed: Boolean(data.alreadyUnsubscribed),
          reasons:
            Array.isArray(data.reasons) && data.reasons.length > 0
              ? data.reasons
              : DEFAULT_REASONS,
        });
        setSubmitState({ status: "idle" });
        return;
      } catch (error: any) {
        setSubmitState({
          status: "error",
          message:
            error?.message ||
            "We could not find a subscription for that email address.",
        });
        return;
      }
    }

    if (fetchState.status !== "ready") return;

    if (!selectedReason) {
      setSubmitState({
        status: "error",
        message: "Please select a reason before unsubscribing.",
      });
      return;
    }

    if (selectedReason === "Other" && !customReason.trim()) {
      setSubmitState({
        status: "error",
        message: "Please provide more details for the selected reason.",
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fetchState.email,
          listId: fetchState.listId,
          reason: selectedReason,
          customReason: customReason.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error || "Unable to process unsubscribe request.",
        );
      }

      setSubmitState({
        status: "success",
        message: payload?.message || "You have been unsubscribed.",
      });
    } catch (error: any) {
      setSubmitState({
        status: "error",
        message: error?.message || "Failed to unsubscribe. Please try again.",
      });
    }
  }, [
    customReason,
    fetchState,
    selectedReason,
    manualEmail,
    manualListId,
    organizationParam,
  ]);

  const renderContent = useCallback(() => {
    if (fetchState.status === "loading") {
      return (
        <LoadingState
          title="Loading unsubscribe options"
          description="Hold on while we pull up your subscription details..."
        />
      );
    }

    if (fetchState.status === "error") {
      return (
        <ErrorState
          title="We couldn't process this link"
          description={fetchState.message}
        />
      );
    }

    if (fetchState.status === "manual") {
      return (
        <ManualEntryForm
          email={manualEmail}
          listId={manualListId}
          onEmailChange={setManualEmail}
          onListChange={setManualListId}
          onSubmit={handleSubmit}
          submitState={submitState}
        />
      );
    }

    if (submitState.status === "success") {
      return (
        <SuccessState
          title="Successfully unsubscribed"
          description="You have been successfully unsubscribed from this mailing list. You will no longer receive emails from us."
        />
      );
    }

    if (fetchState.status === "ready" && fetchState.alreadyUnsubscribed) {
      return (
        <SuccessState
          title="You're already unsubscribed"
          description={`The email ${fetchState.email} is already unsubscribed. If this was a mistake, please contact the organization to resubscribe.`}
        />
      );
    }

    if (fetchState.status === "ready") {
      return (
        <UnsubscribeForm
          email={fetchState.email}
          reasons={fetchState.reasons}
          selectedReason={selectedReason}
          customReason={customReason}
          onSelectReason={(reason) => {
            setSubmitState({ status: "idle" });
            setSelectedReason(reason);
          }}
          onCustomReasonChange={(value) => {
            setSubmitState({ status: "idle" });
            setCustomReason(value);
          }}
          onSubmit={handleSubmit}
          submitState={submitState}
        />
      );
    }

    return null;
  }, [
    customReason,
    fetchState,
    handleSubmit,
    selectedReason,
    submitState,
    manualEmail,
    manualListId,
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Manage Your Email Preferences
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We respect your inbox. Let us know why you&apos;re unsubscribing so
            we can improve.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          {renderContent()}
        </section>
      </div>
    </main>
  );
}

function LoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
      <h2 className="mt-4 text-xl font-semibold text-red-800">{title}</h2>
      <p className="mt-2 text-sm text-red-700">{description}</p>
      <p className="mt-4 text-xs text-red-600">
        If you believe this is incorrect, please contact the organization
        directly for assistance.
      </p>
    </div>
  );
}

function SuccessState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-green-500" />
      <h2 className="mt-4 text-xl font-semibold text-green-800">{title}</h2>
      <p className="mt-2 text-sm text-green-700">{description}</p>
      <p className="mt-4 text-xs text-green-600">
        Thank you for the time you spent with us. You&apos;re always welcome to
        rejoin.
      </p>
    </div>
  );
}

interface UnsubscribeFormProps {
  email: string;
  reasons: string[];
  selectedReason: string;
  customReason: string;
  onSelectReason: (reason: string) => void;
  onCustomReasonChange: (value: string) => void;
  onSubmit: () => void;
  submitState: SubmitState;
}

function UnsubscribeForm({
  email,
  reasons,
  selectedReason,
  customReason,
  onSelectReason,
  onCustomReasonChange,
  onSubmit,
  submitState,
}: UnsubscribeFormProps) {
  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-blue-50/80 p-4">
        <p className="text-sm text-blue-800">
          You&apos;re unsubscribing the email address:
          <span className="ml-1 font-semibold">{email}</span>
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold text-slate-800">
          Why are you unsubscribing?
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Your feedback helps us improve the emails we send.
        </p>
        <fieldset className="mt-4 space-y-2">
          {reasons.map((reason) => (
            <label
              key={reason}
              className="flex cursor-pointer items-start rounded-lg border border-transparent px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <input
                type="radio"
                name="unsubscribe-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(event) => onSelectReason(event.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-slate-700">{reason}</span>
            </label>
          ))}
        </fieldset>

        {selectedReason === "Other" ? (
          <div className="mt-3">
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="unsubscribe-other"
            >
              Tell us a bit more (optional)
            </label>
            <textarea
              id="unsubscribe-other"
              value={customReason}
              onChange={(event) => onCustomReasonChange(event.target.value)}
              rows={3}
              placeholder="Your feedback helps us improve..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        ) : null}
      </section>

      {submitState.status === "error" && (
        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {submitState.message}
        </div>
      )}

      {submitState.status === "success" && (
        <div className="rounded-md border border-green-100 bg-green-50 p-3 text-sm text-green-700">
          {submitState.message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitState.status === "submitting"}
          className="inline-flex w-full flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitState.status === "submitting" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Unsubscribing…
            </span>
          ) : submitState.status === "success" ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Unsubscribed
            </span>
          ) : (
            "Confirm Unsubscribe"
          )}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex w-full flex-1 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Go Back
        </button>
      </div>

      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <p>
          You can always resubscribe later by contacting the organization
          directly. We value your privacy and will respect your choice.
        </p>
      </div>
    </div>
  );
}

interface ManualEntryFormProps {
  email: string;
  listId: string;
  onEmailChange: (value: string) => void;
  onListChange: (value: string) => void;
  onSubmit: () => void;
  submitState: SubmitState;
}

function ManualEntryForm({
  email,
  listId,
  onEmailChange,
  onListChange,
  onSubmit,
  submitState,
}: ManualEntryFormProps) {
  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-blue-50/80 p-4">
        <h2 className="text-lg font-semibold text-blue-900">
          Find your subscription
        </h2>
        <p className="mt-1 text-sm text-blue-700">
          Enter the email address you want to unsubscribe. If you know the list
          ID from the link you received, include it below (optional).
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="unsubscribe-email"
          >
            Email address
          </label>
          <input
            id="unsubscribe-email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="unsubscribe-list-id"
          >
            Audience list ID (optional)
          </label>
          <input
            id="unsubscribe-list-id"
            type="text"
            value={listId}
            onChange={(event) => onListChange(event.target.value)}
            placeholder="Paste the list identifier if you have it"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-slate-500">
            We&apos;ll look up your subscription using just the email if you
            don&apos;t know the list ID.
          </p>
        </div>
      </div>

      {submitState.status === "error" && (
        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {submitState.message}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitState.status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState.status === "submitting" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Looking up subscription…
          </span>
        ) : (
          "Find subscription"
        )}
      </button>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-sm text-slate-600">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <UnsubscribePageContent />
    </Suspense>
  );
}
