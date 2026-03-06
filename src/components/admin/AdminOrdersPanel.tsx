"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, RefreshCw, Search, Package, Phone, MapPin, CarFront } from "lucide-react";

/* =========================
   API base
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

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* =========================
   Types
========================= */
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DELIVERED";

type BookingItem = {
  id?: number;
  qty?: number;
  tyre_id: number;
  brand?: string | null;
  name?: string | null;
  size?: string | null;
  image_url?: string | null;
  category_title?: string | null;
  category_slug?: string | null;
};

type Booking = {
  id: number;
  customer_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address_line?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  vehicle_make_model?: string | null;
  vehicle_year?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
  status: BookingStatus;
  created_at?: string | null;
  items?: BookingItem[];
};

const BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "DELIVERED"];

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "border-yellow-500/25 bg-yellow-500/10 text-yellow-100",
  CONFIRMED: "border-sky-500/25 bg-sky-500/10 text-sky-100",
  CANCELLED: "border-red-500/25 bg-red-500/10 text-red-100",
  DELIVERED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
};

async function apiFetch(path: string, init: RequestInit = {}) {
  const token = readToken();
  const url = `${API}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  const txt = await res.text();
  let data: any = null;
  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = txt;
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function prettyDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function formatPreferredDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function formatPreferredTime(v?: string | null) {
  if (!v) return "-";
  return v;
}

function resolveImage(url?: string | null) {
  const u = String(url || "").trim();
  if (!u) return "/tyres/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API.replace(/\/api$/, "")}${u}`;
  return `${API.replace(/\/api$/, "")}/${u}`;
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-white/5 p-5", className)}>
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export default function AdminBookingsPanel() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string; open: boolean } | null>(null);
  const alertTimerRef = useRef<number | null>(null);

  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Booking | null>(null);

  function showAlert(type: "success" | "error", message: string, timeout = 3500) {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setAlert({ type, message, open: true });
    alertTimerRef.current = window.setTimeout(() => {
      setAlert((a) => (a ? { ...a, open: false } : a));
    }, timeout);
  }

  function flashRow(id: number, ms = 1600) {
    setChangedIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setChangedIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, ms);
  }

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const json = await apiFetch(`/bookings${params.toString() ? `?${params.toString()}` : ""}`);
      const list: Booking[] = Array.isArray(json?.items) ? json.items : [];

      setRows(list);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 401) {
        showAlert("error", "Unauthorized — please login");
        window.location.href = "/login";
        return;
      }
      showAlert("error", err?.message || "Failed to load bookings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookingDetails(id: number) {
    try {
      const json = await apiFetch(`/bookings/${id}`);
      return (json?.booking || null) as Booking | null;
    } catch (err: any) {
      console.error(err);
      showAlert("error", err?.message || "Failed to load booking details");
      return null;
    }
  }

  async function updateBookingStatus(id: number, status: BookingStatus) {
    const token = readToken();
    if (!token) {
      showAlert("error", "Please login first");
      return;
    }

    setBusyId(id);
    try {
      const updatedRes = await apiFetch(`/bookings/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      const updatedBooking: Booking | null = updatedRes?.booking || null;

      showAlert("success", "Booking status updated!");
      flashRow(id);

      if (updatedBooking?.id) {
        setRows((prev) => prev.map((b) => (b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b)));
        setSelected((cur) => (cur?.id === updatedBooking.id ? updatedBooking : cur));
      } else {
        setRows((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        setSelected((cur) => (cur?.id === id ? { ...cur, status } : cur));
      }
    } catch (err: any) {
      console.error(err);
      showAlert("error", err?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;

    return rows.filter((b) => {
      const hay = [
        b.id,
        b.customer_name,
        b.phone,
        b.email,
        b.city,
        b.address_line,
        b.landmark,
        b.pincode,
        b.vehicle_make_model,
        b.vehicle_year,
        b.status,
        b.preferred_date,
        b.preferred_time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(t);
    });
  }, [rows, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((x) => x.status === "PENDING").length,
      confirmed: rows.filter((x) => x.status === "CONFIRMED").length,
      cancelled: rows.filter((x) => x.status === "CANCELLED").length,
      delivered: rows.filter((x) => x.status === "DELIVERED").length,
    };
  }, [rows]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.16),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative space-y-6 p-6">
          {alert && alert.open && (
            <div
              className={cn(
                "fixed right-4 top-4 z-50 w-full max-w-sm rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur",
                alert.type === "success" && "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
                alert.type === "error" && "border-red-500/25 bg-red-500/10 text-red-100"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm">{alert.message}</div>
                <button
                  onClick={() => setAlert((a) => (a ? { ...a, open: false } : a))}
                  className="rounded-xl p-1 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                OG Admin • {stats.total} booking{stats.total === 1 ? "" : "s"}
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                Bookings Manager
              </h2>
              <p className="mt-1 text-sm text-white/70">
                View booking requests, inspect booked tyres, and update order status.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total" value={stats.total} />
            <SummaryCard label="Pending" value={stats.pending} className="border-yellow-500/15 bg-yellow-500/5" />
            <SummaryCard label="Confirmed" value={stats.confirmed} className="border-sky-500/15 bg-sky-500/5" />
            <SummaryCard label="Cancelled" value={stats.cancelled} className="border-red-500/15 bg-red-500/5" />
            <SummaryCard label="Delivered" value={stats.delivered} className="border-emerald-500/15 bg-emerald-500/5" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <div className="relative w-full sm:w-[380px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customer, phone, city, vehicle..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                  />
                </div>

                <button
                  onClick={() => {
                    setQ("");
                    setStatusFilter("");
                    setPage(1);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Reset
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as BookingStatus | "");
                  setPage(1);
                }}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
              >
                <option value="">All statuses</option>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
            <h3 className="mb-4 text-lg font-extrabold">Bookings</h3>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-black/30">
                  <tr className="text-left text-white/70">
                    <th className="p-3">ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Preferred</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-white/60">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : pageSlice.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-white/60">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((b) => (
                      <tr
                        key={b.id}
                        className={cn(
                          "border-t border-white/10 transition-all",
                          changedIds.has(b.id) && "bg-[#f7c25a]/10"
                        )}
                      >
                        <td className="p-3 align-top font-semibold text-white/90">#{b.id}</td>

                        <td className="p-3 align-top">
                          <div className="font-semibold text-white/90">{b.customer_name}</div>
                          <div className="mt-1 text-xs text-white/50">{b.email || "-"}</div>
                        </td>

                        <td className="p-3 align-top text-white/80">{b.phone}</td>

                        <td className="p-3 align-top text-white/70">{b.city || "-"}</td>

                        <td className="p-3 align-top text-white/70">
                          <div>{b.vehicle_make_model || "-"}</div>
                          <div className="text-xs text-white/45">{b.vehicle_year || "-"}</div>
                        </td>

                        <td className="p-3 align-top text-white/70">
                          <div>{formatPreferredDate(b.preferred_date)}</div>
                          <div className="text-xs text-white/45">
                            {formatPreferredTime(b.preferred_time)}
                          </div>
                        </td>

                        <td className="p-3 align-top">
                          <select
                            disabled={busyId === b.id}
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                            className={cn(
                              "rounded-2xl border bg-black/30 px-3 py-2 text-xs font-extrabold outline-none",
                              STATUS_STYLES[b.status]
                            )}
                          >
                            {BOOKING_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3 align-top text-white/60">{prettyDate(b.created_at)}</td>

                        <td className="p-3 align-top">
                          <button
                            onClick={async () => {
                              const full = await fetchBookingDetails(b.id);
                              setSelected(full || b);
                            }}
                            className="rounded-2xl bg-[#f7c25a] px-4 py-2 text-xs font-extrabold text-black hover:brightness-110"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-white/60">
                {total === 0
                  ? "Showing 0 of 0"
                  : `Showing ${(safePage - 1) * pageSize + 1} - ${Math.min(
                      safePage * pageSize,
                      total
                    )} of ${total}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  Prev
                </button>

                <div className="rounded-2xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-2 text-sm font-bold text-[#f7c25a]">
                  {safePage}/{totalPages}
                </div>

                <button
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-[60]">
            <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                {selected && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                          Booking Details
                        </div>
                        <Dialog.Title className="mt-1 text-2xl font-extrabold">
                          Booking #{selected.id}
                        </Dialog.Title>
                      </div>

                      <button
                        onClick={() => setSelected(null)}
                        className="rounded-xl p-2 hover:bg-white/10"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5 text-white/80" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <Phone className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Customer
                          </span>
                        </div>
                        <div className="font-semibold text-white">{selected.customer_name}</div>
                        <div className="mt-1 text-white/75">{selected.phone}</div>
                        <div className="mt-1 text-white/60">{selected.email || "-"}</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Address
                          </span>
                        </div>
                        <div className="text-white/80">{selected.city || "-"}</div>
                        <div className="mt-1 text-white/70">{selected.address_line || "-"}</div>
                        <div className="mt-1 text-white/60">
                          {selected.landmark || "-"} {selected.pincode ? `• ${selected.pincode}` : ""}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <CarFront className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Vehicle
                          </span>
                        </div>
                        <div className="font-semibold text-white">
                          {selected.vehicle_make_model || "-"}
                        </div>
                        <div className="mt-1 text-white/70">{selected.vehicle_year || "-"}</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <Package className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Status & Schedule
                          </span>
                        </div>

                        <div
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                            STATUS_STYLES[selected.status]
                          )}
                        >
                          {selected.status}
                        </div>

                        <div className="mt-3 text-white/75">
                          Date: {formatPreferredDate(selected.preferred_date)}
                        </div>
                        <div className="mt-1 text-white/60">
                          Time: {formatPreferredTime(selected.preferred_time)}
                        </div>

                        <div className="mt-4">
                          <label className="text-xs text-white/50">Update status</label>
                          <select
                            disabled={busyId === selected.id}
                            value={selected.status}
                            onChange={(e) =>
                              updateBookingStatus(selected.id, e.target.value as BookingStatus)
                            }
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                          >
                            {BOOKING_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f7c25a]">
                          Notes
                        </div>
                        <div className="whitespace-pre-wrap text-white/80">
                          {selected.notes || "-"}
                        </div>
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#f7c25a]">
                          Booked Items
                        </div>

                        {selected.items?.length ? (
                          <div className="space-y-3">
                            {selected.items.map((it, idx) => (
                              <div
                                key={`${it.tyre_id}-${idx}`}
                                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[88px_1fr_auto]"
                              >
                                <div className="relative h-[88px] w-[88px] overflow-hidden rounded-2xl border border-white/10 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={resolveImage(it.image_url)}
                                    alt={it.name || `Tyre ${it.tyre_id}`}
                                    className="h-full w-full object-contain p-2"
                                  />
                                </div>

                                <div>
                                  <div className="text-lg font-bold text-white">
                                    {it.brand ? `${it.brand} ` : ""}
                                    {it.name || `Tyre #${it.tyre_id}`}
                                  </div>
                                  <div className="mt-1 text-sm text-white/70">
                                    Size: {it.size || "-"}
                                  </div>
                                  <div className="mt-1 text-sm text-white/60">
                                    Category: {it.category_title || it.category_slug || "-"}
                                  </div>
                                  <div className="mt-1 text-xs text-white/45">
                                    Tyre ID: {it.tyre_id}
                                  </div>
                                </div>

                                <div className="flex items-start justify-end">
                                  <div className="rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-4 py-2 text-sm font-extrabold text-[#f7c25a]">
                                    Qty: {it.qty ?? 1}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-white/60">No items found</div>
                        )}
                      </div>

                      <div className="md:col-span-2 text-xs text-white/40">
                        Created: {prettyDate(selected.created_at)}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => setSelected(null)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}