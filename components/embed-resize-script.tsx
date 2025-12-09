"use client";

import { useEffect } from "react";

interface EmbedResizeScriptProps {
  formSlug: string;
}

export function EmbedResizeScript({ formSlug }: EmbedResizeScriptProps) {
  useEffect(() => {
    // Function to send height to parent window
    const sendHeight = () => {
      if (window.parent && window.parent !== window) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage(
          {
            formSlug,
            height,
            type: "resize",
          },
          "*",
        );
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

    // Send height periodically in case of dynamic content
    const interval = setInterval(sendHeight, 500);

    return () => {
      window.removeEventListener("resize", sendHeight);
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [formSlug]);

  return null;
}
