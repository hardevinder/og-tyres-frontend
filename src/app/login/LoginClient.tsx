"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

/* --- helpers --- */
function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000")) {
      return "http://localhost:5055/api";
    }
    return loc.replace(/\/+$/, "") + "/api";
  }

  return "";
}

const API = getApiBase();

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
      {children}
    </span>
  );
}

/** ✅ Prevent redirect loop + open-redirect */
function sanitizeRedirect(raw: string | null) {
  const r = (raw || "").trim();

  // default: admin
  if (!r) return "/admin";

  // allow only internal paths
  if (!r.startsWith("/")) return "/admin";

  // avoid redirecting back to login/signup
  const base = r.split("?")[0].split("#")[0];
  if (base === "/login" || base === "/signup") return "/admin";

  return r;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ default redirect is /admin
  const redirectTo = useMemo(
    () => sanitizeRedirect(searchParams?.get("redirectTo")),
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function fetchAndStoreUser(token: string) {
    try {
      const meUrl = API ? `${API}/auth/me` : "/api/auth/me";
      const res = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const meData = await res.json();
      const userObj = meData?.user || meData?.data || meData;
      if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
    } catch {
      // ignore
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data?.error || data?.message || `Login failed (status ${res.status})`
        );
        return;
      }

      const token = data?.token || data?.accessToken;
      if (!token) {
        setError("No token received");
        return;
      }

      if (remember) localStorage.setItem("accessToken", token);
      else sessionStorage.setItem("accessToken", token);

      // store user (backend returns user)
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        await fetchAndStoreUser(token);
      }

      notifyAuthChange();

      // ✅ redirect to admin (or safe redirectTo)
      router.replace(redirectTo || "/admin");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <GoldPill>OG Gold Edition</GoldPill>
                  <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-white/70">
                    Sign in to manage your catalogue & bookings.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                    <div className="relative h-10 w-10">
                      <Image
                        src="/brand/og-logo.png"
                        alt="OG Tires & Rims"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80">
                    Password
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-black/40 accent-[#f7c25a]"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>

                  <span className="text-xs text-white/40">{/* removed */}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="pt-2 text-center text-sm text-white/60">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    className="font-extrabold text-[#f7c25a] hover:brightness-110"
                  >
                    Register
                  </button>
                </div>

                <div className="pt-3 text-center">
                  <Link
                    href="/"
                    className="text-xs font-semibold text-white/60 hover:text-[#f7c25a] transition"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-5 text-center text-xs text-white/35">
              By signing in you agree to our terms & privacy policy.
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}