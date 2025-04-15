"use client";

import "react-multi-email/dist/style.css";
import "@maily-to/core/style.css";

import { Editor as MailyEditor } from "@maily-to/core";
import {
  getVariableSuggestions,
  VariableExtension,
} from "@maily-to/core/extensions";
import type { Email } from "@prisma/client";
import { ExternalLink, Loader2, X } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Select from "react-select";
import { toast } from "sonner";

import { updateEmail, updatePostMetadata } from "@/lib/actions";
import {
  sendBulkEmail,
  sendEmail,
  unscheduleEmail,
} from "@/lib/actions/send-email";
import {
  DonationJSON,
  DonationTemplate,
} from "@/lib/email-templates/donation-template";
import {
  SignupJSON,
  SignupTemplate,
} from "@/lib/email-templates/signup-template";
import { cn } from "@/lib/utils";

import { AudienceListDropdown } from "./audience-list-dropdown";
import { PreviewModal } from "./modal/preview-modal";
import ScheduleEmailButton from "./schedule-email-button";
// import ScheduleEmailButton from "./schedule-email-button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type EmailWithSite = Email & {
  organization: {
    subdomain: string | null;
    logo: string | null;
    image: string | null;
  } | null;
  template?: string | null;
};

export default function Editor({ email }: { email: EmailWithSite }) {
  const router = useRouter();

  const [isPendingSaving, startTransitionSaving] = useTransition();
  const [isPendingPublishing, startTransitionPublishing] = useTransition();
  const [scheduledDate, setScheduledDate] = useState<Moment>(
    moment(email.scheduledTime) || null,
  );
  const [data, setData] = useState<EmailWithSite>(email);
  const [hydrated, setHydrated] = useState(true);
  const [from, setFrom] = useState(email.from || "With The Ranks");
  const [showReplyTo, setShowReplyTo] = useState(false);
  const [selectedAudienceList, setSelectedAudienceList] = useState<
    string | null
  >(email.audienceListId || null);
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if email is already published.
  useEffect(() => {
    if (data.published) {
      router.push(`/email/${data.id}/analytics`);
    }
  }, [data.published, data.id, router]);

  function isValidTime(current: Moment) {
    return current.isSameOrAfter(new Date(), "day");
  }

  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`
    : `http://${data.organization?.subdomain}.localhost:3000/${data.slug}`;

  useEffect(() => {
    startTransitionSaving(async () => {
      await updateEmail(data, scheduledDate.toDate());
    });
  }, [scheduledDate, data]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          await updateEmail(data, scheduledDate.toDate());
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data, startTransitionSaving, scheduledDate]);

  const DEFAULT_LOGO_URL = process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL || "";
  const logoUrl = data.organization?.logo ?? DEFAULT_LOGO_URL;
  const fullWidthImageUrl = data.organization?.image ?? "";

  const donationHtml = DonationTemplate({ logoUrl, fullWidthImageUrl });
  const donationJSON = DonationJSON({ logoUrl, fullWidthImageUrl });
  const signupHtml = SignupTemplate({ logoUrl, fullWidthImageUrl });
  const signupJSON = SignupJSON({ logoUrl, fullWidthImageUrl });

  const isScheduledForFuture = () => {
    return scheduledDate > moment();
  };

  useEffect(() => {
    if (!data.content) {
      let content = JSON.stringify(donationJSON);
      if (data.template === "signup") {
        content = JSON.stringify(signupJSON);
      }
      setData((prevData) => ({
        ...prevData,
        content: content,
      }));
    }
  }, [data.content, data.template, donationJSON, signupJSON]);

  const handleUnscheduleEmail = async () => {
    try {
      await unscheduleEmail({ resendId: data.resendId! });
    } catch (error) {
      toast.error("Failed to unschedule email");
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!selectedAudienceList) {
        toast.error("Please select an audience list.");
        return;
      }
      const content = data.content;
      const emailScheduleTime = isScheduledForFuture()
        ? scheduledDate.toISOString()
        : "";
      const result = await sendBulkEmail({
        audienceListId: selectedAudienceList,
        from,
        subject: data.subject,
        content,
        previewText: data.previewText,
        scheduledTime: emailScheduleTime,
        id: data.id,
      });
      if (result.error) {
        toast.error(`Failed to send email: ${result.error}`);
      } else {
        if (!isScheduledForFuture()) {
          toast.success("Emails sent successfully");
        }
      }
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const clickPreview = () => {
    if (data.published) {
      router.push(`/email/${data.id}/analytics`);
    } else {
      if (!data.title || !data.subject) {
        toast.error("Campaign name and subject are required.");
        return;
      }
      setShowPreview(true);
    }
  };

  const handleSendTest = async (to: string) => {
    try {
      await sendEmail({
        to,
        from,
        subject: data.subject!,
        content: data.content!,
        previewText: data.previewText!,
      });
      toast.success("Test email sent");
    } catch {
      toast.error("Failed to send test email");
    }
  };

  const getDefaultValueSelect = (value: string | null) => {
    return value === "signup"
      ? { value: "signup", label: "Signup" }
      : { value: "donation", label: "Donation" };
  };

  const handleSaveContent = async () => {
    try {
      await updateEmail(data, scheduledDate.toDate());
      toast.success("Content saved successfully");
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  const getButtonLabel = () => {
    if (!data.published) {
      return "Preview & Send";
    } else {
      return "Analytics";
    }
  };

  const handleClickPublish = async () => {
    const wasPublished = data.published;
    try {
      await handleSaveContent();
      if (!wasPublished) {
        await handleSendEmail();
      } else if (isScheduledForFuture()) {
        await handleUnscheduleEmail();
      }
      const formData = new FormData();
      formData.append("published", String(!wasPublished));
      await updatePostMetadata(formData, email.id, "published").then(() => {
        const toastLabel = getButtonLabel();
        toast.success(`Successfully ${toastLabel} your email.`);
        setData((prev) => ({ ...prev, published: !prev.published }));
      });
    } catch (error) {
      toast.error("Failed to publish email.");
    }
  };

  return (
    <div className="relative mx-auto min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 dark:border-stone-700 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
      <div className="absolute right-5 top-5 mb-5 flex flex-wrap items-center gap-3">
        {data.published && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-stone-400 hover:text-stone-500"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <div className="rounded-[28px] bg-stone-100 px-4 py-2.5 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {isPendingSaving ? "Saving..." : "Saved"}
        </div>
        <button
          onClick={() => clickPreview()}
          disabled={isPendingPublishing}
          className={cn(
            "btn text-sm",
            isPendingPublishing && "cursor-not-allowed opacity-50",
          )}
        >
          {isPendingPublishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            getButtonLabel()
          )}
        </button>
      </div>
      <div className="mb-5 flex flex-col space-y-3 border-b border-stone-200 pb-5 dark:border-stone-700">
        <input
          type="text"
          placeholder="Campaign Name"
          defaultValue={email?.title || ""}
          autoFocus
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="dark:placeholder-text-600 border-none px-0 font-cal text-3xl placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
          required
        />
      </div>
      <Label className="flex items-center font-normal">
        <span className="w-40 shrink-0 font-normal text-gray-600 after:ml-0.5 after:text-red-400 after:content-['*']">
          Subject
        </span>
        <Input
          className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setData({ ...data, subject: e.target.value })}
          placeholder="Email Subject"
          type="text"
          value={email.subject || ""}
          required
        />
      </Label>
      <div className="flex items-center gap-1.5">
        <Label className="flex grow items-center font-normal">
          <span className="w-40 shrink-0 font-normal text-gray-600">
            From Name
          </span>
          <Input
            className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setFrom(e.target.value)}
            placeholder="With The Ranks"
            type="text"
            value={from}
          />
        </Label>
        {!showReplyTo ? (
          <button
            className="inline-block h-full shrink-0 bg-transparent px-1 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setShowReplyTo(true)}
            type="button"
          >
            Reply-To
          </button>
        ) : null}
      </div>
      {showReplyTo && (
        <Label className="flex items-center font-normal">
          <span className="w-40 shrink-0 font-normal text-gray-600">
            Reply-To
          </span>
          <div className="align-content-stretch flex grow items-center">
            <Input
              className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => setData({ ...data, replyTo: e.target.value })}
              placeholder="noreply@withtheranks.coop"
              type="text"
              value={data.replyTo || ""}
            />
            <button
              className="flex h-10 shrink-0 items-center bg-transparent px-1 text-gray-500 hover:text-gray-700"
              onClick={() => setShowReplyTo(false)}
              type="button"
            >
              <X className="inline-block" size={16} />
            </button>
          </div>
        </Label>
      )}
      <AudienceListDropdown
        selectedAudienceList={selectedAudienceList}
        setSelectedAudienceList={setSelectedAudienceList}
        organizationId={data.organizationId ?? ""}
      />
      <Label className="flex items-center font-normal">
        <span className="w-40 shrink-0 font-normal text-gray-600">
          Template
        </span>
        <Select
          className="h-auto grow rounded-none border-x-0 border-gray-300 px-0 py-2.5 text-base focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={getDefaultValueSelect(data.template)}
          isDisabled
        />
      </Label>
      <ScheduleEmailButton
        scheduledTimeValue={scheduledDate}
        isValidTime={isValidTime}
        setScheduledTimeValue={setScheduledDate}
        isDisabled={isScheduledForFuture() && data.published}
      />
      <div className="relative my-6">
        <Input
          className="h-auto rounded-none border-x-0 border-gray-300 px-0 py-2.5 pr-5 text-base focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => setData({ ...data, previewText: e.target.value })}
          placeholder="Preview Text"
          type="text"
          value={data.previewText || ""}
        />
      </div>
      <div>
        {!hydrated ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : (
          <MailyEditor
            config={{
              hasMenuBar: false,
              wrapClassName: "editor-wrap",
              bodyClassName: "!mt-0 !border-0 !p-0",
              contentClassName: "editor-content mx-auto mt-20",
              toolbarClassName: "flex-wrap !items-start",
              spellCheck: false,
              autofocus: false,
            }}
            contentHtml={data.template === "signup" ? signupHtml : donationHtml}
            contentJson={data.content ? JSON.parse(data.content) : undefined}
            extensions={[
              VariableExtension.configure({
                suggestion: getVariableSuggestions("@"),
                variables: [
                  {
                    name: "first_name",
                    required: false,
                  },
                  {
                    name: "last_name",
                    required: false,
                  },
                  {
                    name: "email",
                    required: false,
                  },
                ],
              }),
            ]}
            key={data.template}
            onCreate={(editor) => {
              setHydrated(true);
              setData((prev) => ({
                ...prev,
                content: JSON.stringify(editor?.getJSON() || {}),
              }));
            }}
            onUpdate={(editor) => {
              setData((prev) => ({
                ...prev,
                content: JSON.stringify(editor?.getJSON() || {}),
              }));
            }}
          />
        )}
      </div>
      {showPreview && (
        <PreviewModal
          content={data.content ?? ""}
          previewText={data.previewText ?? undefined}
          onCancel={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            startTransitionPublishing(() => handleClickPublish());
          }}
          onSendTest={handleSendTest}
        />
      )}
    </div>
  );
}
