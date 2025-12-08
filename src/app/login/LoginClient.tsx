"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link"; // ✅ NEW

/* --- helpers --- */
function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    // 🔥 Match your Fastify backend on 7121 (same as checkout)
    if (loc.includes("localhost:3000")) {
      return loc.replace(":3000", ":7121") + "/api";
    }
    return loc + "/api";
  }

  return "";
}

const API = getApiBase();
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: any;
    __google_sdk_loaded?: boolean;
    __gsi_initialized?: boolean;
  }
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleContainerRef = useRef<HTMLDivElement | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRendered, setGoogleRendered] = useState(false);

  const validate = () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  function notifyAuthChange() {
    try {
      window.dispatchEvent(new Event("auth"));
      localStorage.setItem("auth_update", String(Date.now()));
    } catch {
      // ignore
    }
  }

  // 🔹 Helper: fetch /auth/me and store user in localStorage
  async function fetchAndStoreUser(token: string) {
    try {
      const meUrl = API ? `${API}/auth/me` : "/api/auth/me";
      const res = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("Failed to fetch /auth/me", res.status);
        return;
      }

      const meData = await res.json();
      // handle different shapes: {user}, {data}, or plain object
      const userObj = meData?.user || meData?.data || meData;
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(userObj));
      }
    } catch (err) {
      console.warn("Error fetching /auth/me", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const loginUrl = API ? `${API}/auth/login` : "/api/auth/login";
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error ||
            data?.message ||
            `Login failed (status ${res.status})`
        );
        setLoading(false);
        return;
      }

      const token = data?.accessToken;
      if (!token) {
        setError("No access token received");
        setLoading(false);
        return;
      }

      if (remember) {
        localStorage.setItem("accessToken", token);
      } else {
        sessionStorage.setItem("accessToken", token);
      }

      // 🔹 Fetch current user and store in localStorage
      await fetchAndStoreUser(token);

      notifyAuthChange();
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  async function ensureGsiInitialized(): Promise<boolean> {
    if (!GOOGLE_CLIENT_ID) {
      setError(
        "Google client ID is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID)."
      );
      return false;
    }
    if (
      typeof window !== "undefined" &&
      window.__gsi_initialized &&
      window.google?.accounts?.id
    ) {
      return true;
    }
    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      return false;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.__gsi_initialized = true;
      return true;
    } catch (err) {
      console.error("ensureGsiInitialized error:", err);
      return false;
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (
      typeof window !== "undefined" &&
      (window.__google_sdk_loaded || window.google?.accounts?.id)
    ) {
      window.__google_sdk_loaded = true;
      return;
    }

    if (!document.getElementById("gsi-client-script")) {
      const script = document.createElement("script");
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.__google_sdk_loaded = true;
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services script");
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID not set; skipping Google sign-in initialization."
      );
      return;
    }

    let mounted = true;
    let attempts = 0;
    const maxAttempts = 30;
    const intervalMs = 250;

    const initLoop = async () => {
      if (!mounted) return;

      const sdkReady = !!(
        window.__google_sdk_loaded ||
        (window.google && window.google.accounts?.id)
      );
      if (!sdkReady) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(initLoop, intervalMs);
        } else {
          console.error("Google SDK did not load in time.");
        }
        return;
      }

      try {
        const ok = await ensureGsiInitialized();
        if (!ok) {
          setGoogleRendered(false);
          return;
        }

        if (
          googleContainerRef.current &&
          window.google?.accounts?.id?.renderButton
        ) {
          try {
            // Clear any previous render
            googleContainerRef.current.innerHTML = "";
            const containerWidth = googleContainerRef.current.clientWidth;
            const buttonWidth = Math.min(containerWidth || 300, 400);
            window.google.accounts.id.renderButton(
              googleContainerRef.current,
              {
                theme: "outline",
                size: "large",
                width: `${buttonWidth}`,
              }
            );
            setGoogleRendered(true);
          } catch (err) {
            console.warn("Google renderButton failed:", err);
            setGoogleRendered(false);
          }
        } else {
          setGoogleRendered(false);
        }
      } catch (err) {
        console.error("GSI initLoop error:", err);
        setGoogleRendered(false);
      }
    };

    initLoop();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle resize for dynamic re-rendering on orientation change or window resize
  useEffect(() => {
    if (!googleRendered) return;

    const handleResize = () => {
      if (
        !googleContainerRef.current ||
        !window.google?.accounts?.id?.renderButton
      ) {
        return;
      }

      const container = googleContainerRef.current;
      container.innerHTML = "";
      const containerWidth = container.clientWidth;
      const buttonWidth = Math.min(containerWidth || 300, 400);
      try {
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: `${buttonWidth}`,
        });
      } catch (err) {
        console.warn("Google renderButton failed on resize:", err);
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial call in case of immediate resize, but unlikely
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [googleRendered]);

  async function handleCredentialResponse(response: any) {
    const idToken = response?.credential;
    if (!idToken) {
      setError("Google did not return a credential");
      return;
    }
    setError(null);
    setGoogleLoading(true);

    try {
      const url = API ? `${API}/auth/google-login` : "/api/auth/google-login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error ||
            data?.message ||
            `Google login failed (${res.status})`
        );
        setGoogleLoading(false);
        return;
      }

      const appToken = data?.accessToken;
      if (!appToken) {
        setError("No access token received from server");
        setGoogleLoading(false);
        return;
      }

      localStorage.setItem("accessToken", appToken);

      // 🔹 Fetch current user and store in localStorage
      await fetchAndStoreUser(appToken);

      notifyAuthChange();
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Network error during Google login");
    } finally {
      setGoogleLoading(false);
    }
  }

  const manualGoogleClick = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      if (!GOOGLE_CLIENT_ID) {
        setError(
          "Google client ID is not configured. Ask the admin to set NEXT_PUBLIC_GOOGLE_CLIENT_ID."
        );
        return;
      }

      const sdkLoaded = !!(
        window.__google_sdk_loaded || window.google?.accounts?.id
      );
      if (!sdkLoaded) {
        setError("Google SDK not loaded yet. Please try again in a moment.");
        return;
      }

      const initialized = await ensureGsiInitialized();
      if (!initialized) {
        setError("Failed to initialize Google sign-in. See console for details.");
        return;
      }

      if (window.google?.accounts?.id?.prompt) {
        window.google.accounts.id.prompt();
      } else {
        setError("Google 'prompt' is not available in this environment.");
      }
    } catch (e: any) {
      console.error("manualGoogleClick error:", e);
      setError(e?.message || "Google prompt failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <header className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="Site logo"
            className="mx-auto h-12 w-auto mb-3"
          />
          <h1 className="text-2xl font-semibold text-[#506600]">
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg p-2 focus:ring-[#506600] focus:border-[#506600]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg p-2 focus:ring-[#506600] focus:border-[#506600]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-[#506600] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <div className="mt-6">
          {/* ✅ Container gives full width on all devices */}
          <div
            ref={googleContainerRef}
            className="w-full min-h-[50px]"
            style={{ overflow: "visible" }}
          />
          {!googleRendered && (
            <div className="mt-3">
              <button
                onClick={manualGoogleClick}
                disabled={googleLoading}
                className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
                type="button"
                aria-label="Continue with Google"
              >
                <svg
                  role="img"
                  aria-hidden="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 46 46"
                  className="h-5 w-5"
                >
                  <path
                    fill="#4285F4"
                    d="M23 10.5c2.9 0 5.1 1.2 6.3 2.2l4.6-4.6C32.4 5 28.9 3.5 23 3.5 14 3.5 6.9 8.6 3.8 15.9l5.4 4.2C11.9 14.6 16.8 10.5 23 10.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M41.5 23c0-1.6-.1-2.8-.4-4H23v7.6h10.6c-.5 2.6-2 4.8-4.4 6.2l6.8 5.2C39.7 34.4 41.5 29.9 41.5 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M9.2 28.1A13.9 13.9 0 0 1 8 23c0-1.1.2-2.2.5-3.2L3.1 15.6A22.9 22.9 0 0 0 1 23c0 3.1.8 6 2.2 8.6l6-3.5z"
                  />
                  <path
                    fill="#EA4335"
                    d="M23 41.5c6.2 0 11.4-2.1 15.2-5.7l-6.8-5.2c-1.9 1.3-4.3 2.1-8.4 2.1-6.2 0-11.1-4.1-13.7-9.7l-6 3.6C6.9 37.4 14 41.5 23 41.5z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold text-orange-600 hover:text-orange-700 underline-offset-2 hover:underline transition"
          >
            Register
          </button>
        </div>
      </motion.div>
    </div>
  );
}