"use client";

import "react-multi-email/dist/style.css";
import "@maily-to/core/style.css";

import { Editor as MailyEditor } from "@maily-to/core";
import {
  getVariableSuggestions,
  VariableExtension,
} from "@maily-to/core/extensions";
import type { Email } from "@prisma/client";
import { Loader2, X } from "lucide-react";
import type { Moment } from "moment";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

import { updateEmail, updatePostMetadata } from "@/lib/actions";
import { getAudiences } from "@/lib/actions/audience-list";
import { isErrorResponse } from "@/lib/utils";

import { EmailPreviewButton } from "./email-preview-button";
import SendEmailButton from "./send-email-button";
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
  const [isPendingPublishing, _startTransitionPublishing] = useTransition();
  const [scheduledDate, setScheduledDate] = useState<Moment>(
    moment(email.scheduledTime) || null,
  );

  const [editorVars, setEditorVars] = useState<
    { name: string; required: boolean }[]
  >([
    { name: "first_name", required: false },
    { name: "last_name", required: false },
    { name: "email", required: false },
  ]);

  const defaultJson = useMemo(() => {
    return email.content
      ? JSON.parse(email.content)
      : {
          type: "doc",
          content: [],
        };
  }, [email.content]);

  const [contentObj, setContentObj] = useState<any>(defaultJson);

  const [data, setData] = useState({
    ...email,
    content: JSON.stringify(defaultJson),
  } as EmailWithSite & { content: string });

  useEffect(() => {
    setContentObj(defaultJson);
    const str = JSON.stringify(defaultJson);
    setData((d) => ({ ...d, content: str }));
  }, [defaultJson]);

  const [hydrated, setHydrated] = useState(true);
  const [from, setFrom] = useState(email.from || "With The Ranks");
  const [showReplyTo, setShowReplyTo] = useState(false);
  const [selectedAudienceList, setSelectedAudienceList] = useState<
    string | null
  >(email.audienceListId || null);

  // Redirect if email is already published.
  useEffect(() => {
    if (data.published) {
      router.push(`/email/${data.id}/`);
    }
  }, [data.published, data.id, router]);

  useEffect(() => {
    startTransitionSaving(async () => {
      await updateEmail(data, null);
    });
  }, [data]);

  useEffect(() => {
    if (!selectedAudienceList) return;
    getAudiences(selectedAudienceList).then((res) => {
      if (isErrorResponse(res)) {
        toast.error(res.error);
      } else {
        const customs = res.customFields.map((f) => ({
          name: f,
          required: false,
        }));
        setEditorVars([
          { name: "first_name", required: false },
          { name: "last_name", required: false },
          { name: "email", required: false },
          ...customs,
        ]);
      }
    });
  }, [selectedAudienceList]);

  const getButtonLabel = () => {
    if (!data.published) {
      return "Send";
    } else {
      return "Analytics";
    }
  };

  const handleClickPublish = async (scheduledTime?: string) => {
    try {
      await updateEmail(
        data,
        scheduledTime ? new Date(scheduledTime) : scheduledDate.toDate(),
      );
      const formData = new FormData();
      formData.append("published", "true");
      await updatePostMetadata(formData, email.id, "published");
      toast.success("Successfully published your email.");
      setData((prev) => ({ ...prev, published: true }));
      router.push(`/email/${data.id}/`);
      mutate(`/api/email/${data.id}`);
    } catch {
      toast.error("Failed to publish email.");
    }
  };

  return (
    <div className="relative mx-auto min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 dark:border-stone-700 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
      <div className="absolute right-5 top-5 mb-5 flex flex-wrap items-center gap-3">
        <div className="rounded-[28px] bg-stone-100 px-4 py-2.5 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {isPendingSaving ? "Saving..." : "Saved"}
        </div>
        <EmailPreviewButton
          editor={contentObj}
          subject={data.subject || ""}
          previewText={data.previewText || ""}
          fromName={from || ""}
        />
        <SendEmailButton
          isSending={isPendingPublishing}
          getButtonLabel={getButtonLabel}
          onConfirm={handleClickPublish}
          selectedAudienceList={selectedAudienceList}
          setSelectedAudienceList={setSelectedAudienceList}
          organizationId={data.organizationId!}
          scheduledTimeValue={scheduledDate}
          isValidTime={(current) => current.isSameOrAfter(new Date(), "day")}
          setScheduledTimeValue={setScheduledDate}
          isScheduleDisabled={data.published && scheduledDate > moment()}
          subject={data.subject || ""}
          previewText={data.previewText || ""}
          from={from}
          content={data.content || ""}
          emailId={data.id}
        />
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
            contentJson={contentObj}
            extensions={[
              VariableExtension.configure({
                suggestion: getVariableSuggestions("@"),
                variables: editorVars,
              }),
            ]}
            key={`${"editor"}|${editorVars.map((v) => v.name).join(",")}`}
            onCreate={() => {
              setHydrated(true);
            }}
            onUpdate={(editor) => {
              const updated = editor.getJSON();
              const updatedStr = JSON.stringify(updated);

              setContentObj(updated);
              setData((d) => ({
                ...d,
                content: updatedStr,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
