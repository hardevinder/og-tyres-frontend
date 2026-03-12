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

  return "http://localhost:5055/api";
}

const API = getApiBase();

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
      {children}
    </span>
  );
}

function isAdminUser(u: any) {
  const role = String(u?.role || u?.user?.role || "").toUpperCase();
  return role === "ADMIN" || role === "SUPERADMIN" || role === "OWNER";
}

/** Prevent redirect loop + open-redirect */
function sanitizeRedirect(raw: string | null) {
  const r = (raw || "").trim();

  if (!r) return "/";
  if (!r.startsWith("/")) return "/";
  const base = r.split("?")[0].split("#")[0];
  if (base === "/login" || base === "/signup" || base === "/register") return "/";

  return r;
}

function clearAuth() {
  try {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  } catch {}
}

function extractUser(data: any) {
  return data?.user || data?.data?.user || data?.data || null;
}

function extractToken(data: any) {
  return (
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken ||
    null
  );
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    const r1 = searchParams?.get("redirectTo");
    const r2 = searchParams?.get("redirect");
    return sanitizeRedirect(r1 || r2);
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new Event("auth"));
      localStorage.setItem("auth_update", String(Date.now()));
    } catch {}
  }

  async function fetchAndStoreUser(token: string, rememberChoice: boolean) {
    try {
      const meUrl = API ? `${API}/auth/me` : "/api/auth/me";
      const res = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) return null;

      const meData = await res.json();
      const userObj = meData?.user || meData?.data?.user || meData?.data || meData;

      if (userObj) {
        if (rememberChoice) {
          localStorage.setItem("user", JSON.stringify(userObj));
          sessionStorage.removeItem("user");
        } else {
          sessionStorage.setItem("user", JSON.stringify(userObj));
          localStorage.removeItem("user");
        }
        return userObj;
      }

      return null;
    } catch {
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      clearAuth();

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

      const token = extractToken(data);
      if (!token) {
        setError("No token received");
        return;
      }

      if (remember) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token);
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("token", token);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
      }

      let user = extractUser(data);

      if (user) {
        if (remember) {
          localStorage.setItem("user", JSON.stringify(user));
          sessionStorage.removeItem("user");
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
          localStorage.removeItem("user");
        }
      } else {
        user = await fetchAndStoreUser(token, remember);
      }

      notifyAuthChange();

      if (isAdminUser(user)) {
        router.replace("/admin");
        router.refresh();

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/admin";
          }
        }, 50);
        return;
      }

      const target = redirectTo || "/";

      router.replace(target);
      router.refresh();

      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = target;
        }
      }, 50);
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

                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                    Welcome back
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    Sign in to manage your catalogue & bookings.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
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

                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-20 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-3 py-1.5 text-xs font-bold text-[#f7c25a] transition hover:bg-[#f7c25a]/18"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl border border-[#f7c25a]/40 bg-black/40 px-5 py-3 text-sm font-extrabold text-[#f7c25a] backdrop-blur transition-all duration-300 hover:border-[#f7c25a] hover:shadow-[0_0_25px_rgba(247,194,90,0.35)] disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-[#f7c25a]/30 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                  <span className="relative z-10 tracking-wide">
                    {loading ? "Signing in..." : "Sign In"}
                  </span>
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
                    className="text-xs font-semibold text-white/60 transition hover:text-[#f7c25a]"
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