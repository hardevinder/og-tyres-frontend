"use client";

import React, { useMemo, useState } from "react";
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

function sanitizeRedirect(raw: string | null) {
  const r = (raw || "").trim();

  if (!r) return "/";
  if (!r.startsWith("/")) return "/";

  const base = r.split("?")[0].split("#")[0];
  if (base === "/login" || base === "/signup" || base === "/register") {
    return "/";
  }

  return r;
}

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    return sanitizeRedirect(
      searchParams.get("redirect") || searchParams.get("redirectTo")
    );
  }, [searchParams]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function notifyAuthChange() {
    try {
      window.dispatchEvent(new Event("auth"));
      localStorage.setItem("auth_update", String(Date.now()));
    } catch {}
  }

  function validate() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter a valid full name");
      return false;
    }

    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!form.password || form.password.length < 4) {
      setError("Password must be at least 4 characters");
      return false;
    }

    if (!form.address_line1.trim()) {
      setError("Address line 1 is required");
      return false;
    }

    if (!form.city.trim()) {
      setError("City is required");
      return false;
    }

    if (!form.state.trim()) {
      setError("Province is required");
      return false;
    }

    if (!form.pincode.trim()) {
      setError("Postal code is required");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const registerUrl = API ? `${API}/auth/register` : "/api/auth/register";

      const res = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          address_line1: form.address_line1.trim(),
          address_line2: form.address_line2.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || `Signup failed (status ${res.status})`
        );
      }

      const token = data?.token || data?.accessToken;

      if (!token) {
        throw new Error("No token received");
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      notifyAuthChange();
      router.replace(redirectTo || "/");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
            className="w-full max-w-2xl"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <GoldPill>OG Gold Edition</GoldPill>

                  <h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                    Create your account
                  </h1>

                  <p className="mt-1 text-sm text-white/70">
                    Register to place tyre bookings and manage your details.
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
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
                        value={form.password}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password: e.target.value }))
                        }
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    value={form.address_line1}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address_line1: e.target.value }))
                    }
                    placeholder="House no, street, area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    value={form.address_line2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address_line2: e.target.value }))
                    }
                    placeholder="Landmark, apartment, optional"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      City
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      Province
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      placeholder="Province"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      value={form.pincode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pincode: e.target.value }))
                      }
                      placeholder="Postal Code"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl border border-[#f7c25a]/40 bg-black/40 px-5 py-3 text-sm font-extrabold text-[#f7c25a] backdrop-blur transition-all duration-300 hover:border-[#f7c25a] hover:shadow-[0_0_25px_rgba(247,194,90,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-[#f7c25a]/30 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                  <span className="relative z-10 tracking-wide">
                    {loading ? "Creating account..." : "Create Account"}
                  </span>
                </button>

                <div className="pt-2 text-center text-sm text-white/60">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/login?redirect=${encodeURIComponent(redirectTo || "/")}`
                      )
                    }
                    className="font-extrabold text-[#f7c25a] hover:brightness-110"
                  >
                    Sign in
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
              By creating an account you agree to our terms & privacy policy.
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}