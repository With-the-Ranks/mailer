"use client";

import { useEffect } from "react";

interface EmbedResizeScriptProps {
  formSlug: string;
}

export function EmbedResizeScript({ formSlug }: EmbedResizeScriptProps) {
  useEffect(() => {
    // Get parent origin from referrer for secure postMessage
    const getParentOrigin = (): string | null => {
      try {
        if (document.referrer) {
          const url = new URL(document.referrer);
          return url.origin;
        }
      } catch {
        // ignore
      }
      return null;
    };

    let lastHeight = 0;

    // Function to send height to parent window
    const sendHeight = () => {
      if (window.parent && window.parent !== window) {
        const height = document.documentElement.scrollHeight;

        // Only send if height actually changed
        if (height === lastHeight) {
          return;
        }
        lastHeight = height;

        const parentOrigin = getParentOrigin();
        if (parentOrigin) {
          window.parent.postMessage(
            {
              formSlug,
              height,
              type: "resize",
            },
            parentOrigin,
          );
        }
      }
    };

    // Send initial height
    sendHeight();

    // Send height on window resize
    window.addEventListener("resize", sendHeight);

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("resize", sendHeight);
      resizeObserver.disconnect();
    };
  }, [formSlug]);

  return null;
}
