"use client";

import "react-multi-email/dist/style.css";

import { Editor as MailyEditor } from "@maily-to/core";
import type { Email } from "@prisma/client";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import Select from "react-select";
import { toast } from "sonner";

import { updateEmail, updatePostMetadata } from "@/lib/actions";
import { sendBulkEmail } from "@/lib/actions/send-email";
import { cn } from "@/lib/utils";

import { AudienceListDropdown } from "./audience-list-dropdown";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type EmailWithSite = Email & {
  organization: { subdomain: string | null } | null;
  template?: string | null;
};

export default function Editor({ email }: { email: EmailWithSite }) {
  const [isPendingSaving, startTransitionSaving] = useTransition();
  const [isPendingPublishing, startTransitionPublishing] = useTransition();
  const [data, setData] = useState<EmailWithSite>(email);
  const [hydrated, setHydrated] = useState(true);
  const [from, setFrom] = useState(email.from || "noreply@painatthepump.com");
  const [showReplyTo, setShowReplyTo] = useState(false);
  const [selectedAudienceList, setSelectedAudienceList] = useState<
    string | null
  >(email.audienceListId || null);
  const variables = [
    { name: "email" },
    { name: "first_name" },
    { name: "last_name" },
  ];

  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`
    : `http://${data.organization?.subdomain}.localhost:3000/${data.slug}`;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          await updateEmail(data);
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data, startTransitionSaving]);

  const donationHtml = `<img src="https://app.kahbob.com/_next/image?url=%2Flogo.png&w=128&q=75" data-maily-component="logo" data-size="md" data-alignment="left" style="position:relative;margin-top:0;height:48px;margin-right:auto;margin-left:0"><div data-maily-component="spacer" data-height="xl" style="width: 100%; height: 64px;" class="spacer" contenteditable="false"></div><h2><strong>Donation Intrepid Email</strong></h2><p>Are you ready to take your digital marketing to the next level? Introducing Intrepid Email Campaign, the ultimate solution for managing and automating your digital campaigns effortlessly.</p><p>Elevate your marketing efforts with Intrepid Email Campaign! Click below to try it out:</p><a data-maily-component="button" mailycomponent="button" text="Try Intrepid Now →" url="" alignment="left" variant="filled" borderradius="round" buttoncolor="#141313" textcolor="#ffffff"></a><div data-maily-component="spacer" data-height="xl" style="width: 100%; height: 64px;" class="spacer" contenteditable="false"></div><p>Join our vibrant community of users and developers on GitHub, where Intrepid is an <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/arikchakma/maily.to"><em>open-source</em></a> project. Together, we'll shape the future of digital marketing.</p><p>Regards,<br>The Intrepid Team</p>`;

  const signupHtml = `<img src="https://app.kahbob.com/_next/image?url=%2Flogo.png&w=128&q=75" data-maily-component="logo" data-size="md" data-alignment="left" style="position:relative;margin-top:0;height:48px;margin-right:auto;margin-left:0"><div data-maily-component="spacer" data-height="xl" style="width: 100%; height: 64px;" class="spacer" contenteditable="false"></div><h2><strong>Signup Intrepid Email</strong></h2><p>Are you ready to take your digital marketing to the next level? Introducing Intrepid Email Campaign, the ultimate solution for managing and automating your digital campaigns effortlessly.</p><p>Elevate your marketing efforts with Intrepid Email Campaign! Click below to try it out:</p><a data-maily-component="button" mailycomponent="button" text="Try Intrepid Now →" url="" alignment="left" variant="filled" borderradius="round" buttoncolor="#141313" textcolor="#ffffff"></a><div data-maily-component="spacer" data-height="xl" style="width: 100%; height: 64px;" class="spacer" contenteditable="false"></div><p>Join our vibrant community of users and developers on GitHub, where Intrepid is an <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/arikchakma/maily.to"><em>open-source</em></a> project. Together, we'll shape the future of digital marketing.</p><p>Regards,<br>The Intrepid Team</p>`;

  const handleSendEmail = async () => {
    try {
      if (!selectedAudienceList) {
        toast.error("Please select an audience list.");
        return;
      }

      const content = data.content;
      const result = await sendBulkEmail({
        audienceListId: selectedAudienceList,
        from,
        subject: data.subject,
        content,
        previewText: data.previewText,
      });
      if (result.error) {
        toast.error(`Failed to send email: ${result.error}`);
      } else {
        toast.success("Emails sent successfully");
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
      await updateEmail(data);
      toast.success("Content saved successfully");
    } catch (error) {
      toast.error("Failed to save content");
    }
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
      }
      const formData = new FormData();
      formData.append("published", String(!data.published));
      await updatePostMetadata(formData, email.id, "published").then(() => {
        toast.success(
          `Successfully ${data.published ? "unpublished" : "published"} your email.`,
        );
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
            <p>{data.published ? "Unpublish" : "Send Email"}</p>
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
          <span className="w-40 shrink-0 font-normal text-gray-600">From</span>
          <Input
            className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => {
              setFrom(e.target.value);
            }}
            placeholder="noreply@painatthepump.com"
            type="text"
            value={from}
            disabled
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
              placeholder="noreply@intrepid.com"
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
