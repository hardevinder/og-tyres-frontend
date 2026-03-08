"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

/* =========================
   API base helper
========================= */
function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000")) return "http://localhost:5055/api";
    return loc.replace(/\/+$/, "") + "/api";
  }

  return "http://localhost:5055/api";
}
const API = getApiBase();

/* =========================
   Helpers
========================= */
function safeNumber(v: any, fallback = 1) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizeImage(url: string) {
  const u = String(url || "").trim();
  if (!u) return "/tires/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  return `/${u}`;
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
      {children}
    </span>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-bold text-white/85">
        {label} {required ? <span className="text-[#f7c25a]">*</span> : null}
      </div>
      {children}
      {error ? (
        <div className="mt-2 text-xs font-semibold text-red-300">{error}</div>
      ) : null}
    </label>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    hasError?: boolean;
  }
) {
  const { hasError, className, ...rest } = props;

  return (
    <input
      {...rest}
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 ${
        hasError
          ? "border-red-400/70 bg-red-500/10 focus:border-red-400 focus:bg-red-500/10"
          : "border-white/10 bg-black/25 focus:border-[#f7c25a]/40 focus:bg-black/35"
      } ${className || ""}`}
    />
  );
}

function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    hasError?: boolean;
  }
) {
  const { hasError, className, ...rest } = props;

  return (
    <textarea
      {...rest}
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 ${
        hasError
          ? "border-red-400/70 bg-red-500/10 focus:border-red-400 focus:bg-red-500/10"
          : "border-white/10 bg-black/25 focus:border-[#f7c25a]/40 focus:bg-black/35"
      } ${className || ""}`}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    hasError?: boolean;
  }
) {
  const { hasError, className, ...rest } = props;

  return (
    <select
      {...rest}
      className={`w-full rounded-2xl border px-4 py-3 text-sm text-white outline-none transition ${
        hasError
          ? "border-red-400/70 bg-red-500/10 focus:border-red-400 focus:bg-red-500/10"
          : "border-white/10 bg-black/25 focus:border-[#f7c25a]/40 focus:bg-black/35"
      } ${className || ""}`}
    />
  );
}

export default function BookPageClient() {
  const sp = useSearchParams();

  const tyreId = sp.get("tyreId") || "";
  const product = sp.get("product") || "Selected Tyre";
  const size = sp.get("size") || "—";
  const category = sp.get("category") || "";
  const image = normalizeImage(sp.get("image") || "");
  const initialQty = safeNumber(sp.get("qty") || 1, 1);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    city: "",
    address_line: "",
    landmark: "",
    pincode: "",
    vehicle_make_model: "",
    vehicle_year: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
    qty: initialQty,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    customer_name?: string;
    phone?: string;
    qty?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const canSubmit = useMemo(() => {
    return (
      String(tyreId).trim() &&
      form.customer_name.trim().length >= 2 &&
      form.phone.trim().length >= 6 &&
      Number(form.qty) >= 1
    );
  }, [form, tyreId]);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (key === "customer_name") delete next.customer_name;
      if (key === "phone") delete next.phone;
      if (key === "qty") delete next.qty;
      return next;
    });
  }

  function validateForm() {
    const nextErrors: {
      customer_name?: string;
      phone?: string;
      qty?: string;
    } = {};

    if (!tyreId) {
      setError("Missing tyre id. Please go back and select a tyre again.");
      return false;
    }

    if (!form.customer_name.trim()) {
      nextErrors.customer_name = "Customer name is required.";
    } else if (form.customer_name.trim().length < 2) {
      nextErrors.customer_name = "Please enter a valid customer name.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (form.phone.trim().length < 6) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (!Number(form.qty) || Number(form.qty) < 1) {
      nextErrors.qty = "Quantity must be at least 1.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fill all required fields correctly.");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const payload = {
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      city: form.city.trim() || undefined,
      address_line: form.address_line.trim() || undefined,
      landmark: form.landmark.trim() || undefined,
      pincode: form.pincode.trim() || undefined,
      vehicle_make_model: form.vehicle_make_model.trim() || undefined,
      vehicle_year: form.vehicle_year.trim() || undefined,
      preferred_date: form.preferred_date || undefined,
      preferred_time: form.preferred_time.trim() || undefined,
      notes: form.notes.trim() || undefined,
      items: [
        {
          tyre_id: Number(tyreId),
          qty: Math.max(1, Number(form.qty || 1)),
        },
      ],
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      setSuccess(data?.booking || data || true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const booked = success?.id || success?.booking?.id;

    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_15%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(700px_420px_at_82%_18%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-4xl px-4 py-16 md:px-6">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl md:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f7c25a]/25 bg-[#f7c25a]/12 text-4xl">
                ✅
              </div>

              <div className="mt-6 text-center">
                <GoldPill>Booking Submitted</GoldPill>
                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Your booking request has been received
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                  Thank you for choosing OG Tires. Our team will review your
                  request and connect with you soon regarding availability,
                  confirmation, and fitment details.
                </p>

                {booked ? (
                  <div className="mt-5 inline-flex rounded-2xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-3 text-sm font-extrabold text-[#f7c25a]">
                    Booking ID: #{booked}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-black/25 p-5 md:grid-cols-[180px_1fr]">
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-3xl border border-white/10 bg-white">
                  <Image
                    src={image}
                    alt={product}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                    Selected Tyre
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {product}
                  </div>
                  <div className="mt-2 text-sm text-white/75">Size: {size}</div>
                  <div className="mt-1 text-sm text-white/75">
                    Category: {category || "General"}
                  </div>
                  <div className="mt-1 text-sm text-white/75">
                    Quantity: {form.qty}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                >
                  Book Another Tyre
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_18%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(800px_500px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-6">
              <GoldPill>Booking Request</GoldPill>

              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                Complete your tyre booking in a few easy steps
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/75 md:text-base">
                Review your selected tyre, fill in your vehicle and contact
                details, and submit your booking request. Our team will follow
                up with confirmation and assistance.
              </p>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-4">
                <div className="relative h-60 w-full overflow-hidden rounded-[24px] border border-white/10 bg-white">
                  <Image
                    src={image}
                    alt={product}
                    fill
                    className="object-contain p-6"
                  />
                </div>

                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                    Selected Tyre
                  </div>

                  <div className="mt-2 text-2xl font-black text-white">
                    {product}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Size
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {size}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Category
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {category || "General"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/8 px-4 py-3 text-sm text-[#f7c25a]">
                    Please confirm quantity and share your preferred schedule
                    for quicker follow-up.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-6">
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                  Customer Details
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                  Tell us where and how to reach you
                </h2>
              </div>

              {error ? (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {!tyreId ? (
                <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                  Tyre details are missing. Please go back to products page and
                  select a tyre first.
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Customer Name"
                    required
                    error={fieldErrors.customer_name}
                  >
                    <Input
                      value={form.customer_name}
                      onChange={(e) =>
                        update("customer_name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      hasError={!!fieldErrors.customer_name}
                    />
                  </Field>

                  <Field
                    label="Phone Number"
                    required
                    error={fieldErrors.phone}
                  >
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      hasError={!!fieldErrors.phone}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Email Address">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </Field>

                  <Field label="City">
                    <Input
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Enter your city"
                    />
                  </Field>
                </div>

                <Field label="Address Line">
                  <Input
                    value={form.address_line}
                    onChange={(e) => update("address_line", e.target.value)}
                    placeholder="House no, street, area"
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Landmark">
                    <Input
                      value={form.landmark}
                      onChange={(e) => update("landmark", e.target.value)}
                      placeholder="Near school, market, chowk..."
                    />
                  </Field>

                  <Field label="Pincode">
                    <Input
                      value={form.pincode}
                      onChange={(e) => update("pincode", e.target.value)}
                      placeholder="Enter pincode"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Vehicle Make / Model">
                    <Input
                      value={form.vehicle_make_model}
                      onChange={(e) =>
                        update("vehicle_make_model", e.target.value)
                      }
                      placeholder="e.g. Mahindra Thar"
                    />
                  </Field>

                  <Field label="Vehicle Year">
                    <Input
                      value={form.vehicle_year}
                      onChange={(e) => update("vehicle_year", e.target.value)}
                      placeholder="e.g. 2022"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Quantity" required error={fieldErrors.qty}>
                    <Input
                      type="number"
                      min={1}
                      value={form.qty}
                      onChange={(e) =>
                        update(
                          "qty",
                          Math.max(1, Number(e.target.value || 1))
                        )
                      }
                      hasError={!!fieldErrors.qty}
                    />
                  </Field>

                  <Field label="Preferred Date">
                    <Input
                      type="date"
                      min={todayStr()}
                      value={form.preferred_date}
                      onChange={(e) =>
                        update("preferred_date", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Preferred Time">
                    <Select
                      value={form.preferred_time}
                      onChange={(e) =>
                        update("preferred_time", e.target.value)
                      }
                    >
                      <option value="">Select preferred time</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Additional Notes">
                  <TextArea
                    rows={5}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any special requirement, installation request, urgent timing, exact fitment concern..."
                  />
                </Field>

                <div className="rounded-[28px] border border-white/10 bg-black/25 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                    Booking Summary
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Product
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {product}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Qty
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {form.qty}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !tyreId}
                    className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Booking..." : "Book Now"}
                  </button>

                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}