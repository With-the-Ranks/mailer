"use client";

import "react-multi-email/dist/style.css";

import { Editor as MailyEditor } from "@maily-to/core";
import type { Email } from "@prisma/client";
import { ExternalLink, Loader2, X } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import { useEffect, useState, useTransition } from "react";
import Select from "react-select";
import { toast } from "sonner";

import { updateEmail, updatePostMetadata } from "@/lib/actions";
import { sendBulkEmail, unscheduleEmail } from "@/lib/actions/send-email";
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
import ScheduleEmailButton from "./schedule-email-button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type EmailWithSite = Email & {
  organization: { subdomain: string | null; logo: string | null } | null;
  template?: string | null;
};

export default function Editor({ email }: { email: EmailWithSite }) {
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

  function isValidTime(current: Moment) {
    return current.isSameOrAfter(new Date(), "day");
  }

  const variables = [
    { name: "email" },
    { name: "first_name" },
    { name: "last_name" },
  ];

  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`
    : `http://${data.organization?.subdomain}.localhost:3000/${data.slug}`;

  useEffect(() => {
    startTransitionSaving(async () => {
      await updateEmail(data, scheduledDate.toDate());
    });
  }, [scheduledDate]);

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
  }, [data, startTransitionSaving]);

  const logoUrl =
    (data && data.organization && data.organization.logo) ||
    "https://upload.wikimedia.org/wikipedia/commons/d/d4/Bernie_Sanders_2016_logo.png";

  const donationHtml = DonationTemplate({ logoUrl });
  const donationJSON = DonationJSON({ logoUrl });
  const signupHtml = SignupTemplate({ logoUrl });
  const signupJSON = SignupJSON({ logoUrl });

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
      await unscheduleEmail({
        resendId: data.resendId!,
      });
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
        organizationId: data.organizationId!,
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

  const getDefaultValueSelect = (value: string | null) => {
    if (value === "signup") {
      return { value: "signup", label: "Signup" };
    } else {
      return { value: "donation", label: "Donation" };
    }
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
    var label = "";
    if (isScheduledForFuture()) {
      if (!data.published) {
        label = "scheduled";
      } else {
        label = "unscheduled";
      }
    } else {
      if (!data.published) {
        label = "published";
      } else {
        label = "unpublished";
      }
    }
    return label;
  };

  const handleClickPublish = async () => {
    if (!data.title || !data.subject) {
      toast.error("Campaign name and subject are required.");
      return;
    }

    try {
      await handleSaveContent();
      if (!data.published) {
        await handleSendEmail();
      } else if (isScheduledForFuture()) {
        await handleUnscheduleEmail();
      }
      const formData = new FormData();
      formData.append("published", String(!data.published));
      await updatePostMetadata(formData, email.id, "published").then(() => {
        var toastLabel = getButtonLabel();
        toast.success(`Successfully ${toastLabel} your email.`);
        setData((prev) => ({ ...prev, published: !prev.published }));
      });
    } catch (error) {
      toast.error("Failed to publish email.");
    }
  };

  return (
    <div className="relative mx-auto min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 dark:border-stone-700 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
      <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
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
        <div className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {isPendingSaving ? "Saving..." : "Saved"}
        </div>
        <button
          onClick={() => startTransitionPublishing(handleClickPublish)}
          className={cn(
            "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none",
            isPendingPublishing
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isPendingPublishing}
        >
          {isPendingPublishing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <p>
              {data.published && isScheduledForFuture()
                ? "Unschedule"
                : !isScheduledForFuture() && data.published
                  ? "Unpublish"
                  : isScheduledForFuture() && !data.published
                    ? "Schedule"
                    : "Send Email"}
            </p>
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
          value={data.subject || ""}
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
            onChange={(e) => {
              setFrom(e.target.value);
            }}
            placeholder="With The Ranks"
            type="text"
            value={from}
          />
        </Label>

        {!showReplyTo ? (
          <button
            className="inline-block h-full shrink-0 bg-transparent px-1 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowReplyTo(true);
            }}
            type="button"
          >
            Reply-To
          </button>
        ) : null}
      </div>
      {showReplyTo ? (
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
              onClick={() => {
                setShowReplyTo(false);
              }}
              type="button"
            >
              <X className="inline-block" size={16} />
            </button>
          </div>
        </Label>
      ) : null}

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
          isDisabled // Lock the template dropdown
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
            contentHtml={data.template == "signup" ? signupHtml : donationHtml}
            contentJson={data.content ? JSON.parse(data.content) : undefined}
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
            variables={variables}
          />
        )}
      </div>
    </div>
  );
}
