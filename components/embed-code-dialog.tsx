"use client";

import { Check, Code2, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { escapeHtml, escapeJs } from "@/lib/color-validation";

interface EmbedCodeDialogProps {
  formSlug: string;
  formName: string;
}

export function EmbedCodeDialog({ formSlug, formName }: EmbedCodeDialogProps) {
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://yourdomain.com";

  const embedUrl = `${baseUrl}/app/signup-forms/${encodeURIComponent(formSlug)}?embed=true`;
  const safeFormName = escapeHtml(formName);
  const safeFormNameJs = escapeJs(formName);
  const safeFormSlug = escapeJs(formSlug);
  const safeBaseUrl = escapeJs(baseUrl);

  // iframe embed code
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="800" 
  style="border: none; max-width: 600px;"
  title="${safeFormName}">
</iframe>`;

  // JavaScript embed code
  const scriptCode = `<div id="signup-form-${formSlug}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '100%';
    iframe.height = '800';
    iframe.style.border = 'none';
    iframe.style.maxWidth = '600px';
    iframe.title = '${safeFormNameJs}';
    
    var container = document.getElementById('signup-form-${formSlug}');
    if (container) {
      container.appendChild(iframe);
    }
    
    // Auto-resize iframe based on content
    window.addEventListener('message', function(event) {
      if (event.origin === '${safeBaseUrl}' && event.data.formSlug === '${safeFormSlug}') {
        if (event.data.height) {
          iframe.height = event.data.height + 'px';
        }
      }
    });
  })();
</script>`;

  const copyToClipboard = async (text: string, type: "iframe" | "script") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "iframe") {
        setCopiedIframe(true);
        setTimeout(() => setCopiedIframe(false), 2000);
      } else {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Optionally show error toast
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Code2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Embed Code</DialogTitle>
          <DialogDescription>
            Copy the code below to embed this form on your website.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="iframe" className="mt-4 w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">iframe</TabsTrigger>
            <TabsTrigger value="script">JavaScript</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>iframe Embed Code</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(iframeCode, "iframe")}
                >
                  {copiedIframe ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={iframeCode}
                readOnly
                className="resize-none font-mono text-xs"
                rows={7}
              />
              <p className="text-muted-foreground text-xs">
                Paste this code into your HTML where you want the form to
                appear.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="script" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>JavaScript Embed with Auto-Resize</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(scriptCode, "script")}
                >
                  {copiedScript ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={scriptCode}
                readOnly
                className="resize-none font-mono text-xs"
                rows={14}
              />
              <p className="text-muted-foreground text-xs">
                This code automatically adjusts the iframe height based on form
                content.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
