"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

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

function formatDate(value: any) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  try {
    return d.toLocaleString("en-CA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toString();
  }
}

function normalizeImage(url: string) {
  const u = String(url || "").trim();
  if (!u) return "/tires/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  return `/${u}`;
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

function normalizeStatus(value: any) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function statusClasses(status: string) {
  switch (normalizeStatus(status)) {
    case "CONFIRMED":
      return "border-blue-400/30 bg-blue-500/10 text-blue-200";
    case "PROCESSING":
      return "border-yellow-400/30 bg-yellow-500/10 text-yellow-200";
    case "COMPLETED":
      return "border-green-400/30 bg-green-500/10 text-green-200";
    case "CANCELLED":
      return "border-red-400/30 bg-red-500/10 text-red-200";
    default:
      return "border-[#f7c25a]/30 bg-[#f7c25a]/10 text-[#f7c25a]";
  }
}

function statusLabel(status: string) {
  const s = normalizeStatus(status);
  if (!s) return "Pending";
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function extractItems(booking: any): any[] {
  if (Array.isArray(booking?.items)) return booking.items;
  if (typeof booking?.items === "string") {
    try {
      const parsed = JSON.parse(booking.items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function bookingSubtotal(booking: any) {
  const directTotal = safeNumber(booking?.total_price, 0);
  if (directTotal > 0) return directTotal;

  const items = extractItems(booking);

  return items.reduce((sum: number, it: any) => {
    const lineTotal = safeNumber(it?.line_total, NaN);
    if (Number.isFinite(lineTotal)) return sum + lineTotal;

    const price =
      safeNumber(it?.price, 0) ||
      safeNumber(it?.unit_price, 0) ||
      safeNumber(it?.selling_price, 0);

    const qty = Math.max(1, safeNumber(it?.qty, 1));
    return price > 0 ? sum + price * qty : sum;
  }, 0);
}

function bookingQty(booking: any) {
  if (safeNumber(booking?.item_count, 0) > 0 && !extractItems(booking).length) {
    return safeNumber(booking?.item_count, 0);
  }

  const items = extractItems(booking);
  return items.reduce(
    (sum: number, it: any) => sum + Math.max(1, safeNumber(it?.qty, 1)),
    0
  );
}

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/25 p-8 text-center">
      <div className="text-lg font-black text-white">No orders found</div>
      <div className="mt-2 text-sm text-white/70">
        You have not placed any tyre orders yet.
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
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
  );
}

export default function MyBookingsPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openId, setOpenId] = useState<number | string | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      const current =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/my-bookings";

      router.replace(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        const query =
          statusFilter !== "ALL"
            ? `?status=${encodeURIComponent(statusFilter)}`
            : "";

        const res = await fetch(`${API}/bookings/my${query}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401) {
            const current =
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/my-bookings";

            router.replace(`/login?redirect=${encodeURIComponent(current)}`);
            return;
          }

          throw new Error(data?.message || `HTTP ${res.status}`);
        }

        if (!ignore) {
          setItems(Array.isArray(data?.items) ? data.items : []);
        }
      } catch (err: any) {
        if (!ignore) {
          setItems([]);
          setError(err?.message || "Failed to load orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [checkingAuth, router, statusFilter]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, booking) => {
        acc.orders += 1;
        acc.totalQty += bookingQty(booking);
        acc.totalAmount += bookingSubtotal(booking);
        return acc;
      },
      { orders: 0, totalQty: 0, totalAmount: 0 }
    );
  }, [items]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_18%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(800px_500px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-5xl px-4 py-20 md:px-6">
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

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_18%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(800px_500px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <GoldPill>My Orders</GoldPill>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                View your tyre bookings
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                Track all your submitted tyre orders, check status, and review
                booked items anytime.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                Browse Products
              </Link>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Go to Cart
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Total Orders
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {summary.orders}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Total Quantity
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {summary.totalQty}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Known Amount
              </div>
              <div className="mt-1 text-2xl font-black text-[#f7c25a]">
                {formatCAD(summary.totalAmount)}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                  Filters
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Filter your bookings by status.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"].map(
                  (status) => {
                    const active = statusFilter === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-2xl px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition ${
                          active
                            ? "bg-[#f7c25a] text-black"
                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {status === "ALL"
                          ? "All"
                          : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="text-sm font-semibold text-white/75">
                Loading your bookings...
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-6">
              <EmptyState />
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {items.map((booking: any) => {
                const bookingId = booking?.id;
                const orderItems = extractItems(booking);
                const totalQty = bookingQty(booking);
                const subtotal = bookingSubtotal(booking);
                const isOpen = openId === bookingId;

                return (
                  <div
                    key={bookingId}
                    className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl md:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-2xl font-black text-white">
                            Order #{bookingId}
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusClasses(
                              booking?.status
                            )}`}
                          >
                            {statusLabel(booking?.status)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                              Date
                            </div>
                            <div className="mt-1 text-sm font-bold text-white">
                              {formatDate(
                                booking?.created_at ||
                                  booking?.createdAt ||
                                  booking?.updated_at ||
                                  booking?.updatedAt
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                              Products
                            </div>
                            <div className="mt-1 text-sm font-bold text-white">
                              {orderItems.length || safeNumber(booking?.item_count, 0)}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                              Total Qty
                            </div>
                            <div className="mt-1 text-sm font-bold text-white">
                              {totalQty}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                              Amount
                            </div>
                            <div className="mt-1 text-sm font-bold text-[#f7c25a]">
                              {subtotal > 0 ? formatCAD(subtotal) : "To confirm"}
                            </div>
                          </div>
                        </div>

                        {booking?.notes ? (
                          <div className="mt-4 rounded-2xl border border-[#f7c25a]/20 bg-[#f7c25a]/8 px-4 py-3 text-sm text-white/80">
                            <span className="font-bold text-[#f7c25a]">Notes:</span>{" "}
                            {booking.notes}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenId((prev) => (prev === bookingId ? null : bookingId))
                          }
                          className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                        >
                          {isOpen ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="mt-6 rounded-[26px] border border-white/10 bg-black/25 p-4 md:p-5">
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                          Ordered Items
                        </div>

                        {orderItems.length === 0 ? (
                          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                            No item details available for this order.
                          </div>
                        ) : (
                          <div className="mt-4 space-y-4">
                            {orderItems.map((it: any, idx: number) => {
                              const title = `${it?.brand ? `${it.brand} ` : ""}${it?.name || "Tyre"}`;
                              const qty = Math.max(1, safeNumber(it?.qty, 1));
                              const price =
                                safeNumber(it?.price, 0) ||
                                safeNumber(it?.unit_price, 0) ||
                                safeNumber(it?.selling_price, 0);
                              const rawLineTotal = safeNumber(it?.line_total, NaN);
                              const lineTotal = Number.isFinite(rawLineTotal)
                                ? rawLineTotal
                                : price * qty;
                              const image = normalizeImage(
                                it?.image || it?.image_url || ""
                              );

                              return (
                                <div
                                  key={`${bookingId}-${idx}-${it?.tyre_id || it?.id || idx}`}
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
                                        Qty: {qty}
                                      </span>

                                      {price > 0 ? (
                                        <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                                          {formatCAD(price)} each
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                                          Price to be confirmed
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="md:text-right">
                                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                                      Line Total
                                    </div>
                                    <div className="mt-1 text-lg font-black text-white">
                                      {price > 0 ? formatCAD(lineTotal) : "—"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}