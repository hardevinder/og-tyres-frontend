"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;

    if (loc.includes("localhost:3000")) {
      return "http://localhost:5055/api";
    }

    return "https://api-ogtire.edubridgeerp.in/api";
  }

  return "http://localhost:5055/api";
}

const API = getApiBase();

type User = {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  active?: number | boolean;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};

type FormState = {
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
};

function clearStoredAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");

  window.dispatchEvent(new Event("auth-changed"));
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    null
  );
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user") || null;

    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeUpdatedUser(user: User) {
  if (typeof window === "undefined") return;

  if (localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  if (sessionStorage.getItem("user")) {
    sessionStorage.setItem("user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));
}

function getErrorMessage(err: any, fallback = "Something went wrong") {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err?.message && String(err.message).trim()) {
    return String(err.message).trim();
  }
  return fallback;
}

function shouldLogout(status?: number, msg?: string) {
  const text = String(msg || "").toLowerCase();

  return (
    status === 401 ||
    text.includes("unauthorized") ||
    text.includes("invalid token") ||
    text.includes("expired") ||
    text.includes("authorization header missing") ||
    text.includes("invalid authorization format")
  );
}

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const isReadyToSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.address_line1.trim().length >= 3 &&
      form.city.trim().length >= 2 &&
      form.state.trim().length >= 2 &&
      form.pincode.trim().length >= 4
    );
  }, [form]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const token = readToken();

        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await fetch(`${API}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = data?.message || "Failed to load profile";

          if (shouldLogout(res.status, msg)) {
            clearStoredAuth();
            router.replace("/login");
            return;
          }

          throw new Error(msg);
        }

        const nextUser = data?.user || null;

        if (!nextUser) {
          throw new Error("Profile data not found");
        }

        if (!active) return;

        setUser(nextUser);
        setForm({
          name: nextUser.name || "",
          phone: nextUser.phone || "",
          address_line1: nextUser.address_line1 || "",
          address_line2: nextUser.address_line2 || "",
          city: nextUser.city || "",
          state: nextUser.state || "",
          pincode: nextUser.pincode || "",
        });

        storeUpdatedUser(nextUser);
      } catch (err: any) {
        const msg = getErrorMessage(err, "Failed to load profile");
        setError(msg);

        const fallbackUser = readStoredUser();
        if (fallbackUser && active) {
          setUser(fallbackUser);
          setForm({
            name: fallbackUser.name || "",
            phone: fallbackUser.phone || "",
            address_line1: fallbackUser.address_line1 || "",
            address_line2: fallbackUser.address_line2 || "",
            city: fallbackUser.city || "",
            state: fallbackUser.state || "",
            pincode: fallbackUser.pincode || "",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = readToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || "Failed to update profile";

        if (shouldLogout(res.status, msg)) {
          clearStoredAuth();
          router.replace("/login");
          return;
        }

        throw new Error(msg);
      }

      const updatedUser = data?.user || null;

      if (updatedUser) {
        setUser(updatedUser);
        storeUpdatedUser(updatedUser);
      }

      setMessage(data?.message || "Profile updated successfully");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Edit Profile
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Update your contact details and saved address.
          </p>
        </div>

        <div className="rounded-3xl border border-[#f7c25a]/15 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-7">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/70">
              Loading profile...
            </div>
          ) : (
            <>
              {error ? (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
                  {message}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Email
                    </label>
                    <input
                      value={user?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/55 outline-none"
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Pincode
                    </label>
                    <input
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Enter pincode"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Address Line 1
                    </label>
                    <input
                      value={form.address_line1}
                      onChange={(e) =>
                        updateField("address_line1", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="House number, street, area"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      Address Line 2
                    </label>
                    <input
                      value={form.address_line2}
                      onChange={(e) =>
                        updateField("address_line2", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Apartment, landmark, optional"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      City
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/85">
                      State
                    </label>
                    <input
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#f7c25a]/40"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={!isReadyToSubmit || saving}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Back to Home
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}