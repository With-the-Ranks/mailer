"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
} from "novel";
import { handleCommandNavigation } from "novel/extensions";

import { useEffect, useState, useTransition } from "react";

import { defaultExtensions } from "./extensions";
import { updateEmail } from "@/lib/actions";

import { EmailWithSite } from "./editor";
import { generateJSON } from '@tiptap/html';
import { slashCommand, suggestionItems } from "./slash-command";
import { useDebouncedCallback } from "use-debounce";

const extensions = [...defaultExtensions, slashCommand];

const NovelEditor = ({ email }: { email: EmailWithSite }) => {
    const [data, setData] = useState<EmailWithSite>(email);
    let [isPendingSaving, startTransitionSaving] = useTransition();
  
    // listen to CMD + S and override the default behavior
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.metaKey && e.key === "s") {
          e.preventDefault();
          startTransitionSaving(async () => {
            const response = await updateEmail(data, true);
          });
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [data]);

    const donateEmailTemplate = `
      <h2>Donate Email</h2>
    `;
  
    const signupEmailTemplate = `
      <h2>Signup Email</h2>
    `;
  
    const contentJSON: Record<string, string> = {
      fundraising: donateEmailTemplate,
      signup: signupEmailTemplate
    }

    function getEmailContent() {
      let content = email.content;
      if (!email.content) {
        const templateType = email.template || 'fundraising';
        content = contentJSON[templateType];
      }
      return generateJSON(content!, extensions);
    }  

    const debouncedUpdates = useDebouncedCallback(async (editor) => {
      setData((prev) => ({
        ...prev,
        content: editor.editor.getHTML(),
      }));
    });

    return (
      <EditorRoot>
        <EditorContent
          initialContent={getEmailContent()}
          onUpdate={debouncedUpdates}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}

          >
          <EditorCommand className="border-muted bg-background z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="dark:prose-invert px-2">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={`hover:bg-accent aria-selected:bg-accent dark:prose-invert aria-selected:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm `}
                  key={item.title}
                >
                  <div className="border-muted bg-background dark:text-white flex h-10 w-10 items-center justify-center rounded-md border">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{item.title}</p>
                    <p className="text-muted-foreground text-xs dark:text-white">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>


        </EditorContent>
      </EditorRoot>

    );
}

export default NovelEditor;