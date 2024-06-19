"use client";

import { useEffect, useState, useTransition } from "react";
import { Email } from "@prisma/client";
import { updateEmail, updatePostMetadata } from "@/lib/actions";
import NovelEditor from "./novel-editor";
import { cn } from "@/lib/utils";
import LoadingDots from "./icons/loading-dots";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ReactMultiEmail } from "react-multi-email";
import Select from 'react-select';
import 'react-multi-email/dist/style.css';

const styles = {
  fontFamily: "sans-serif",
  width: "500px",
  border: "1px solid #eee",
  background: "#f3f3f3",
  padding: "25px",
  margin: "20px"
};

export type EmailWithSite = Email & { organization: { subdomain: string | null } | null } & { key: number };

export default function Editor({ email }: { email: EmailWithSite }) {
  let [isPendingSaving, startTransitionSaving] = useTransition();
  let [isPendingPublishing, startTransitionPublishing] = useTransition();
  email.key = 0;
  const [data, setData] = useState<EmailWithSite>(email);
  const [hydrated, setHydrated] = useState(false);

  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`
    : `http://${data.organization?.subdomain}.localhost:3000/${data.slug}`;

  // listen to CMD + S and override the default behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          const response = await updateEmail(data, false);
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data]);

  type SelectOption = {
    value: string;
    label: string;
  }

  const selectOptions: SelectOption[] = [
    {value: 'fundraising', label: 'Fundraising'},
    {value: 'signup', label: 'Signup'}
  ];
  const selectDict: Record<string, SelectOption> = {
    'fundraising': {value: 'fundraising', label: 'Fundraising'},
    'signup': {value: 'signup', label: 'Signup'}
  }

  const selectOnChange = (selectOption: any) => {
    const { value } = selectOption;
    setData({ ...data, template: value, key: data.key+=1 })
  }

  return (
    <div className="relative min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 dark:border-stone-700 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
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
          onClick={() => {
            const formData = new FormData();
            console.log(data.published, typeof data.published);
            formData.append("published", String(!data.published));
            startTransitionPublishing(async () => {
              await updatePostMetadata(formData, email.id, "published").then(
                () => {
                  toast.success(
                    `Successfully ${
                      data.published ? "unpublished" : "published"
                    } your email.`,
                  );
                  setData((prev) => ({ ...prev, published: !prev.published }));
                },
              );
            });
          }}
          className={cn(
            "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none",
            isPendingPublishing
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isPendingPublishing}
        >
          {isPendingPublishing ? (
            <LoadingDots />
          ) : (
            <p>{data.published ? "Unpublish" : "Publish"}</p>
          )}
        </button>
      </div>
      <div className="mb-5 flex flex-col space-y-3 border-b border-stone-200 pb-5 dark:border-stone-700">
        <input
          type="text"
          placeholder="Title"
          defaultValue={email?.title || ""}
          autoFocus
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="dark:placeholder-text-600 border-none px-0 font-cal text-3xl placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
        />
        <ReactMultiEmail
          style={styles}
          placeholder="Input your Email Address"
          emails={email.emailsTo}
          onChange={(_emails: string[]) => {
            setData({ ...data, emailsTo: _emails });
          }}
          getLabel={(
            email: string,
            index: number,
            removeEmail: (index: number) => void
          ) => {
            return (
              <div data-tag key={index}>
                {email}
                <span data-tag-handle onClick={() => removeEmail(index)}>
                  ×
                </span>
              </div>
            );
          }}
        />
        {/* <TextareaAutosize
          placeholder="Description"
          defaultValue={email?.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="dark:placeholder-text-600 w-full resize-none border-none px-0 placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
        /> */}
        <Select 
          defaultValue={data.template ? selectDict[data.template] : selectDict['fundraising']}
          options={selectOptions}
          onChange={selectOnChange}
        />
      </div>
      <NovelEditor
        email={data} key={data.key}
      />
    </div>
  );
}
