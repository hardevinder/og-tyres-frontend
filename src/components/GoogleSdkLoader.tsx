"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    __google_sdk_loaded?: boolean;
  }
}

export default function GoogleSdkLoader() {
  useEffect(() => {
    // Defensive: if the script already set the flag, leave it.
    if (typeof window !== "undefined" && window.google && window.google.accounts?.id) {
      window.__google_sdk_loaded = true;
    }
  }, []);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        try {
          if (typeof window !== "undefined") {
            window.__google_sdk_loaded = true;
            // eslint-disable-next-line no-console
            console.debug("Google Identity SDK loaded:", !!window.google?.accounts?.id);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Error in GoogleSdkLoader onLoad:", err);
        }
      }}
      onError={(e) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Identity SDK", e);
      }}
    />
  );
}
