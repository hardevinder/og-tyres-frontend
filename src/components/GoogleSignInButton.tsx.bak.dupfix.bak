"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""); // e.g. http://localhost:5000/api
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

type Props = {
  buttonId?: string; // optional element id
  onSuccess?: (user: any, accessToken: string) => void; // optional callback
  onError?: (err: any) => void;
};

export default function GoogleSignInButton({ buttonId = "gsi-button", onSuccess, onError }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    // Load script if not available
    const existing = document.getElementById("google-identity-js");
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.id = "google-identity-js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
      s.onload = initButton;
      return () => { /* cleanup appended script left as-is for caching */ };
    } else {
      initButton();
    }

    function initButton() {
      // @ts-ignore - google is injected by the script
      if (typeof window !== "undefined" && (window as any).google && containerRef.current) {
        try {
          // @ts-ignore
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: "popup", // popup is simpler inside SPA
          });

          // render the standard Google button into our container
          // @ts-ignore
          (window as any).google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
          });

          // optional: automatically prompt One Tap (commented out)
          // (window as any).google.accounts.id.prompt();
        } catch (e) {
          console.error("gsi init error", e);
        }
      }
    }

    // callback receives { credential: 'ID_TOKEN' }
    async function handleCredentialResponse(response: any) {
      const idToken = response?.credential;
      if (!idToken) {
        onError?.(new Error("No credential returned from Google"));
        return;
      }

      try {
        // Post id_token to backend, get your app's accessToken
        const url = API ? `${API}/auth/google-login` : "/api/auth/google-login";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Login failed (${res.status})`);
        }

        const appToken = data?.accessToken;
        const user = data?.user;

        // store token (remember to choose storage strategy)
        if (appToken) localStorage.setItem("accessToken", appToken);

        onSuccess?.(user, appToken);
        // redirect (adjust as needed)
        router.push("/");
      } catch (err) {
        console.error("google-login error", err);
        onError?.(err);
      }
    }
  }, [onError, onSuccess, router]);

  return (
    <div>
      {/* container for Google's button */}
      <div id={buttonId} ref={containerRef} />
      {/* fallback for older browsers or to trigger Google popup manually if needed */}
      <noscript>
        <button
          onClick={() => {
            alert("Please enable JavaScript to sign in with Google.");
          }}
          className="mt-2 w-full border py-2 rounded"
        >
          Continue with Google
        </button>
      </noscript>
    </div>
  );
}
