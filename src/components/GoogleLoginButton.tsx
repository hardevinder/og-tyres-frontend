"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __google_sdk_loaded?: boolean;
  }
}

export default function GoogleLoginButton({
  onToken,
  width = 300,
}: {
  onToken?: (token: string) => void;
  width?: number;
}) {
  const btnRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(() => !!window?.google?.accounts?.id);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 12;
    const intervalMs = 300;

    const tryInit = () => {
      attempts++;
      if (!mounted) return;

      if (typeof window !== "undefined" && window.google && window.google.accounts?.id) {
        try {
          // initialize once
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: (resp: any) => {
              if (onToken && resp?.credential) onToken(resp.credential);
              else console.debug("Google ID token:", resp?.credential);
            },
          });

          if (btnRef.current) {
            window.google.accounts.id.renderButton(btnRef.current, {
              theme: "outline",
              size: "large",
              width,
            });
          }

          setReady(true);
        } catch (err) {
          console.error("Error initializing Google SDK:", err);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(tryInit, intervalMs);
      } else {
        console.error("Google SDK not loaded yet after retries.");
      }
    };

    // kick off: prefer the global flag if present
    if (window.__google_sdk_loaded || window.google?.accounts?.id) {
      tryInit();
    } else {
      setTimeout(tryInit, 200);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div ref={btnRef} id="google-login-btn" />
      {!ready && <div className="mt-2 text-sm text-gray-500">Loading Google sign-in…</div>}
    </div>
  );
}
