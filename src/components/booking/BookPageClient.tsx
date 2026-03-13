"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatCAD(n: number) {
  const value = safeNumber(n, 0);

  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function normalizeImage(url: string) {
  const u = String(url || "").trim();
  if (!u) return "/tires/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  return `/${u}`;
}

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function categoryLabel(cat?: string) {
  const value = String(cat || "").trim().toLowerCase();

  if (value === "all-terrain") return "All Terrain";
  if (value === "all-season") return "All Season";
  if (value === "winter") return "Winter";
  if (value === "performance") return "Performance";
  if (value === "light-truck") return "Light Truck";

  return value ? value : "General";
}

function normalizeItemId(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
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

function FloatingCartButton({ totalQty }: { totalQty: number }) {
  return (
    <Link
      href="/cart"
      className="group fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[320px] sm:bottom-5 sm:right-5 sm:w-auto"
      aria-label="Open cart"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#f7c25a]/30 bg-black/85 px-4 py-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#f7c25a]/55 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-3xl sm:px-5 sm:py-3.5">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(247,194,90,0.16),transparent_35%,transparent_100%)] opacity-80" />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/12">
            <ShoppingCart className="h-5 w-5 text-[#f7c25a]" />
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#f7c25a] px-1.5 py-0.5 text-[10px] font-black text-black shadow-lg">
              {totalQty}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
              Your Cart
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="truncate text-sm font-black text-white sm:text-base">
                {totalQty} item{totalQty > 1 ? "s" : ""}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                Review Cart
              </span>
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition group-hover:bg-white/10 group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BookPageClient() {
  const router = useRouter();
  const { items, clear } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [form, setForm] = useState({
    notes: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    notes?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [submittedItems, setSubmittedItems] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      const current =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/book";

      router.replace(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    setIsLoggedIn(true);
    setCheckingAuth(false);
  }, [router]);

  const totalQty = useMemo(() => {
    return items.reduce(
      (sum: number, it: any) => sum + Math.max(1, safeNumber(it?.qty, 1)),
      0
    );
  }, [items]);

  const cartSubtotal = useMemo(() => {
    return items.reduce((sum: number, it: any) => {
      const qty = Math.max(1, safeNumber(it?.qty, 1));
      const price = safeNumber(it?.price, 0);
      return sum + price * qty;
    }, 0);
  }, [items]);

  const validPayloadItems = useMemo(() => {
    return items
      .map((it: any) => {
        const tyreId = normalizeItemId(it?.id ?? it?.tyre_id ?? it?.product_id);
        const qty = Math.max(1, safeNumber(it?.qty, 1));

        if (!tyreId) return null;

        return {
          tyre_id: tyreId,
          qty,
        };
      })
      .filter(Boolean) as Array<{ tyre_id: number; qty: number }>;
  }, [items]);

  const canSubmit = useMemo(() => {
    return isLoggedIn && items.length > 0 && validPayloadItems.length > 0;
  }, [isLoggedIn, items.length, validPayloadItems.length]);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (key === "notes") delete next.notes;
      return next;
    });
  }

  function validateForm() {
    setFieldErrors({});

    if (!getToken()) {
      setError("Please login first to continue.");
      return false;
    }

    if (!items.length) {
      setError("Your cart is empty. Please add tyres before placing the order.");
      return false;
    }

    if (!validPayloadItems.length) {
      setError("Some cart items are invalid. Please remove them and try again.");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const token = getToken();

    const payload = {
      notes: form.notes.trim() || undefined,
      items: validPayloadItems,
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          const current =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/book";
          router.replace(`/login?redirect=${encodeURIComponent(current)}`);
          return;
        }

        if (res.status === 400 || res.status === 403 || res.status === 404) {
          throw new Error(data?.message || "Unable to place order right now.");
        }

        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      setSubmittedItems(items);
      setSuccess(data?.booking || data || true);
      clear();
      setForm({ notes: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_18%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(800px_500px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-4xl px-4 py-20 md:px-6">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="text-sm font-semibold text-white/75">
                Redirecting to login...
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    const booked = success?.id || success?.booking?.id;
    const successItems =
      Array.isArray(success?.items) && success.items.length
        ? success.items
        : submittedItems.length
          ? submittedItems
          : items;

    const successQty = successItems.reduce(
      (sum: number, it: any) => sum + Math.max(1, safeNumber(it?.qty, 1)),
      0
    );

    const successTotal =
      safeNumber(success?.total_price, 0) ||
      successItems.reduce((sum: number, it: any) => {
        const qty = Math.max(1, safeNumber(it?.qty, 1));
        const lineTotal = safeNumber(it?.line_total, NaN);
        if (Number.isFinite(lineTotal)) return sum + lineTotal;
        return sum + safeNumber(it?.price, 0) * qty;
      }, 0);

    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_15%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(700px_420px_at_82%_18%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-6">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl md:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f7c25a]/25 bg-[#f7c25a]/12 text-4xl">
                ✅
              </div>

              <div className="mt-6 text-center">
                <GoldPill>Order Submitted</GoldPill>
                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Your order request has been received
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                  Thank you for choosing OG Tires. Our team will review your
                  request and connect with you shortly regarding confirmation and
                  delivery details.
                </p>

                {booked ? (
                  <div className="mt-5 inline-flex rounded-2xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-3 text-sm font-extrabold text-[#f7c25a]">
                    Order ID: #{booked}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Products
                  </div>
                  <div className="mt-1 text-lg font-black text-white">
                    {successItems.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Total Qty
                  </div>
                  <div className="mt-1 text-lg font-black text-white">
                    {successQty}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Order Total
                  </div>
                  <div className="mt-1 text-lg font-black text-[#f7c25a]">
                    {formatCAD(successTotal)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Status
                  </div>
                  <div className="mt-1 text-lg font-black text-[#f7c25a]">
                    {String(success?.status || "PENDING").replace(/^./, (m) =>
                      m.toUpperCase()
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/25 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                  Ordered Items
                </div>

                <div className="mt-4 space-y-4">
                  {successItems.map((it: any, idx: number) => {
                    const title = `${it?.brand ? `${it.brand} ` : ""}${it?.name || "Tyre"}`;
                    const qty = Math.max(1, safeNumber(it?.qty, 1));
                    const image = normalizeImage(
                      it?.image || it?.image_url || ""
                    );
                    const price = safeNumber(it?.price, 0);
                    const rawLineTotal = safeNumber(it?.line_total, NaN);
                    const lineTotal = Number.isFinite(rawLineTotal)
                      ? rawLineTotal
                      : price * qty;

                    return (
                      <div
                        key={`${it?.id || idx}-${it?.variant || it?.size || idx}`}
                        className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[88px_1fr_auto]"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-contain p-2"
                          />
                        </div>

                        <div>
                          <div className="text-base font-black text-white">
                            {title}
                          </div>
                          <div className="mt-1 text-sm text-white/70">
                            Size: {it?.size || "—"}
                          </div>
                          <div className="mt-1 text-sm text-white/70">
                            Category:{" "}
                            {categoryLabel(
                              it?.category ||
                                it?.category_slug ||
                                it?.category_title
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/75">
                              Unit Price: {formatCAD(price)}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                              Line Total: {formatCAD(lineTotal)}
                            </span>
                          </div>
                        </div>

                        <div className="md:text-right">
                          <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                            Qty
                          </div>
                          <div className="mt-1 text-lg font-black text-white">
                            {qty}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                >
                  Order More Tyres
                </Link>

                <Link
                  href="/my-bookings"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                >
                  View My Bookings
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
    <>
      <main className="min-h-screen bg-[#050505] pb-28 text-white sm:pb-24">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_18%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(800px_500px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-6">
                <GoldPill>Cart Checkout</GoldPill>

                <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Review your cart and place your tyre order
                </h1>

                <p className="mt-4 text-sm leading-7 text-white/75 md:text-base">
                  Your booking will include all tyres currently available in your
                  cart.
                </p>

                <div className="mt-4 rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/8 px-4 py-3 text-sm text-[#f7c25a]">
                  Prices shown below are in Canadian Dollars and will be
                  confirmed again by our team after order review.
                </div>

                {items.length === 0 ? (
                  <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-6">
                    <div className="text-lg font-black text-white">
                      Your cart is empty
                    </div>
                    <div className="mt-2 text-sm text-white/75">
                      Add tyres to the cart first, then return here to place your
                      order.
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                      >
                        Browse Products
                      </Link>

                      <Link
                        href="/cart"
                        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                      >
                        Go to Cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {items.map((it: any, idx: number) => {
                      const title = `${it?.brand ? `${it.brand} ` : ""}${it?.name || "Tyre"}`;
                      const qty = Math.max(1, safeNumber(it?.qty, 1));
                      const image = normalizeImage(
                        it?.image || it?.image_url || ""
                      );
                      const price = safeNumber(it?.price, 0);
                      const lineTotal = price * qty;

                      return (
                        <div
                          key={`${it?.id || idx}-${it?.variant || it?.size || ""}`}
                          className="rounded-[28px] border border-white/10 bg-black/25 p-4"
                        >
                          <div className="grid gap-4 md:grid-cols-[110px_1fr_auto]">
                            <div className="relative h-24 w-24 overflow-hidden rounded-[22px] border border-white/10 bg-white md:h-24 md:w-24">
                              <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-contain p-3"
                              />
                            </div>

                            <div>
                              <div className="text-lg font-black text-white">
                                {title}
                              </div>

                              <div className="mt-1 text-sm text-white/75">
                                Size: {it?.size || "—"}
                              </div>

                              <div className="mt-1 text-sm text-white/75">
                                Category:{" "}
                                {categoryLabel(
                                  it?.category ||
                                    it?.category_slug ||
                                    it?.category_title
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/75">
                                  Qty: {qty}
                                </span>

                                <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                                  Unit: {formatCAD(price)}
                                </span>

                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/75">
                                  Total: {formatCAD(lineTotal)}
                                </span>
                              </div>
                            </div>

                            <div className="md:text-right">
                              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                                Status
                              </div>
                              <div className="mt-1 text-lg font-black text-white">
                                Ready
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-6">
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                    Order Details
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                    Confirm and place order
                  </h2>
                </div>

                {error ? (
                  <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                {items.length === 0 ? (
                  <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                    Your cart is empty. Please add tyres before placing the
                    order.
                  </div>
                ) : null}

                {items.length > 0 && validPayloadItems.length !== items.length ? (
                  <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                    Some cart items look invalid and may not be submitted.
                    Please review your cart if order does not go through.
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Field label="Additional Notes">
                    <TextArea
                      rows={5}
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Any special delivery note or requirement..."
                      hasError={!!fieldErrors.notes}
                    />
                  </Field>

                  <div className="rounded-[28px] border border-white/10 bg-black/25 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                      Order Summary
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-white/80">
                        <span>Total Products</span>
                        <span className="font-bold text-white">
                          {items.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-white/80">
                        <span>Total Quantity</span>
                        <span className="font-bold text-white">{totalQty}</span>
                      </div>

                      <div className="flex items-center justify-between text-white/80">
                        <span>Subtotal</span>
                        <span className="font-bold text-white">
                          {formatCAD(cartSubtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-white/70">
                        <span>Shipping</span>
                        <span className="text-white/80">Calculated later</span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/8 px-4 py-3 text-sm text-[#f7c25a]">
                      Your contact and address details will be taken
                      automatically from your account profile.
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-white/65">
                      Want to change quantities or remove items? Please update
                      them in your cart before placing the order.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !canSubmit}
                      className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Placing Order..." : "Place Order"}
                    </button>

                    <Link
                      href="/cart"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                    >
                      Back to Cart
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {!success && items.length > 0 ? (
        <FloatingCartButton totalQty={totalQty} />
      ) : null}
    </>
  );
}