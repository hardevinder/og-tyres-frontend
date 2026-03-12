"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  X,
  RefreshCw,
  Search,
  Package,
  Phone,
  MapPin,
  CarFront,
  Mail,
  User,
} from "lucide-react";

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
const API_ROOT = API.replace(/\/api$/, "");

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    null
  );
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* =========================
   Types
========================= */
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DELIVERED";

type BookingItem = {
  id?: number | string;
  qty?: number;
  tyre_id: number | string;
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
  state?: string | null;
  province?: string | null;
  country?: string | null;

  address_line?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  full_address?: string | null;
  landmark?: string | null;

  pincode?: string | null;
  postal_code?: string | null;

  vehicle_make_model?: string | null;
  vehicle_year?: string | null;

  preferred_date?: string | null;
  preferred_time?: string | null;

  notes?: string | null;
  status: BookingStatus;
  created_at?: string | null;
  updated_at?: string | null;

  items?: BookingItem[];
};

const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "DELIVERED",
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "border-yellow-500/25 bg-yellow-500/10 text-yellow-100",
  CONFIRMED: "border-sky-500/25 bg-sky-500/10 text-sky-100",
  CANCELLED: "border-red-500/25 bg-red-500/10 text-red-100",
  DELIVERED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
};

/* =========================
   Helpers
========================= */
function asArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

function firstString(...values: any[]): string | null {
  for (const value of values) {
    if (value == null) continue;

    if (typeof value === "string") {
      const s = value.trim();
      if (s) return s;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

function firstNumber(...values: any[]): number | null {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeStatus(value: any): BookingStatus {
  const s = String(value || "")
    .trim()
    .toUpperCase();

  if (s === "PENDING") return "PENDING";
  if (s === "CONFIRMED") return "CONFIRMED";
  if (s === "CANCELLED") return "CANCELLED";
  if (s === "DELIVERED") return "DELIVERED";
  return "PENDING";
}

function normalizeBookingItem(input: any): BookingItem {
  return {
    id: input?.id ?? input?.booking_item_id ?? input?.bookingItemId ?? undefined,
    qty: firstNumber(input?.qty, input?.quantity, input?.booked_qty) ?? 1,
    tyre_id:
      firstNumber(input?.tyre_id, input?.tyreId, input?.product_id, input?.id) ??
      0,
    brand: firstString(
      input?.brand,
      input?.brand_name,
      input?.tyre_brand,
      input?.product_brand
    ),
    name: firstString(
      input?.name,
      input?.title,
      input?.tyre_name,
      input?.product_name
    ),
    size: firstString(input?.size, input?.tyre_size, input?.product_size),
    image_url: firstString(
      input?.image_url,
      input?.image,
      input?.thumbnail,
      input?.photo,
      input?.tyre_image
    ),
    category_title: firstString(
      input?.category_title,
      input?.category,
      input?.category_name
    ),
    category_slug: firstString(input?.category_slug, input?.slug),
  };
}

function normalizeBooking(input: any): Booking {
  const customer = input?.customer || input?.user || {};
  const address = input?.address && typeof input.address === "object" ? input.address : {};
  const vehicle = input?.vehicle && typeof input.vehicle === "object" ? input.vehicle : {};
  const schedule = input?.schedule && typeof input.schedule === "object" ? input.schedule : {};

  const combinedVehicle =
    [firstString(vehicle?.make), firstString(vehicle?.model)]
      .filter(Boolean)
      .join(" ")
      .trim() || null;

  const itemsRaw =
    input?.items ||
    input?.booking_items ||
    input?.bookingItems ||
    input?.products ||
    input?.lines ||
    [];

  return {
    id: firstNumber(input?.id, input?.booking_id, input?.bookingId) ?? 0,
    customer_name:
      firstString(
        input?.customer_name,
        input?.name,
        input?.customerName,
        customer?.name,
        customer?.full_name
      ) || "Unknown Customer",

    phone:
      firstString(
        input?.phone,
        input?.customer_phone,
        input?.mobile,
        input?.mobile_no,
        customer?.phone,
        customer?.mobile
      ) || "-",

    email: firstString(
      input?.email,
      input?.customer_email,
      customer?.email
    ),

    city: firstString(input?.city, address?.city),
    state: firstString(input?.state, address?.state),
    province: firstString(input?.province, address?.province),
    country: firstString(input?.country, address?.country),

    address_line: firstString(input?.address_line),
    address_line1: firstString(input?.address_line1, address?.address_line1),
    address_line2: firstString(input?.address_line2, address?.address_line2),
    full_address: firstString(input?.full_address, address?.full_address),
    landmark: firstString(input?.landmark, address?.landmark),

    pincode: firstString(input?.pincode, address?.pincode),
    postal_code: firstString(
      input?.postal_code,
      input?.postalCode,
      address?.postal_code,
      address?.postalCode
    ),

    vehicle_make_model:
      firstString(
        input?.vehicle_make_model,
        input?.vehicle_model,
        input?.vehicle_name
      ) || combinedVehicle,

    vehicle_year: firstString(input?.vehicle_year, vehicle?.year),

    preferred_date: firstString(
      input?.preferred_date,
      input?.booking_date,
      schedule?.date
    ),
    preferred_time: firstString(
      input?.preferred_time,
      input?.booking_time,
      schedule?.time
    ),

    notes: firstString(input?.notes, input?.remark, input?.message),
    status: normalizeStatus(input?.status),
    created_at: firstString(input?.created_at, input?.createdAt),
    updated_at: firstString(input?.updated_at, input?.updatedAt),

    items: asArray(itemsRaw).map(normalizeBookingItem),
  };
}

function normalizeBookingListResponse(json: any): Booking[] {
  const raw =
    Array.isArray(json)
      ? json
      : Array.isArray(json?.items)
      ? json.items
      : Array.isArray(json?.bookings)
      ? json.bookings
      : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.rows)
      ? json.rows
      : [];

  return raw.map(normalizeBooking).filter((x) => Number(x.id) > 0);
}

function normalizeBookingDetailResponse(json: any): Booking | null {
  const raw = json?.booking || json?.item || json?.data || json;
  if (!raw || typeof raw !== "object") return null;
  const booking = normalizeBooking(raw);
  if (!booking.id) return null;
  return booking;
}

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
  if (!u) return "/tires/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_ROOT}${u}`;
  return `${API_ROOT}/${u}`;
}

function getShortAddress(b?: Booking | null) {
  if (!b) return "-";

  const parts = [
    b.address_line,
    b.address_line1,
    b.address_line2,
    b.landmark,
    b.city,
    b.state || b.province,
    b.pincode || b.postal_code,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : b.full_address || "-";
}

function getFullAddress(b?: Booking | null) {
  if (!b) return "-";

  const parts = [
    b.full_address,
    b.address_line,
    b.address_line1,
    b.address_line2,
    b.landmark ? `Landmark: ${b.landmark}` : null,
    b.city,
    b.state || b.province,
    b.country,
    b.pincode || b.postal_code,
  ].filter(Boolean);

  if (!parts.length) return "-";

  const unique: string[] = [];
  for (const p of parts) {
    const s = String(p).trim();
    if (!s) continue;
    if (!unique.includes(s)) unique.push(s);
  }
  return unique.join(", ");
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
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-5",
        className
      )}
    >
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export default function AdminBookingsPanel() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    open: boolean;
  } | null>(null);

  const alertTimerRef = useRef<number | null>(null);

  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Booking | null>(null);

  function showAlert(
    type: "success" | "error",
    message: string,
    timeout = 3500
  ) {
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

      const json = await apiFetch(
        `/bookings${params.toString() ? `?${params.toString()}` : ""}`
      );

      setRows(normalizeBookingListResponse(json));
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
    setSelectedLoading(true);
    try {
      const json = await apiFetch(`/bookings/${id}`);
      return normalizeBookingDetailResponse(json);
    } catch (err: any) {
      console.error(err);
      showAlert("error", err?.message || "Failed to load booking details");
      return null;
    } finally {
      setSelectedLoading(false);
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

      const updatedBooking = normalizeBookingDetailResponse(updatedRes);

      showAlert("success", "Booking status updated!");
      flashRow(id);

      if (updatedBooking?.id) {
        setRows((prev) =>
          prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
        );

        setSelected((cur) =>
          cur?.id === updatedBooking.id ? updatedBooking : cur
        );
      } else {
        setRows((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );

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
      const itemText = (b.items || [])
        .map((it) =>
          [it.brand, it.name, it.size, it.category_title, it.category_slug]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ");

      const hay = [
        b.id,
        b.customer_name,
        b.phone,
        b.email,
        b.city,
        b.state,
        b.province,
        b.country,
        b.address_line,
        b.address_line1,
        b.address_line2,
        b.full_address,
        b.landmark,
        b.pincode,
        b.postal_code,
        b.vehicle_make_model,
        b.vehicle_year,
        b.status,
        b.preferred_date,
        b.preferred_time,
        b.notes,
        itemText,
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
                alert.type === "success" &&
                  "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
                alert.type === "error" &&
                  "border-red-500/25 bg-red-500/10 text-red-100"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm">{alert.message}</div>
                <button
                  onClick={() =>
                    setAlert((a) => (a ? { ...a, open: false } : a))
                  }
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
                View booking requests, customer phone numbers, full addresses,
                booked tires, and update booking status.
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
            <SummaryCard
              label="Pending"
              value={stats.pending}
              className="border-yellow-500/15 bg-yellow-500/5"
            />
            <SummaryCard
              label="Confirmed"
              value={stats.confirmed}
              className="border-sky-500/15 bg-sky-500/5"
            />
            <SummaryCard
              label="Cancelled"
              value={stats.cancelled}
              className="border-red-500/15 bg-red-500/5"
            />
            <SummaryCard
              label="Delivered"
              value={stats.delivered}
              className="border-emerald-500/15 bg-emerald-500/5"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <div className="relative w-full sm:w-[440px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customer, phone, address, city, vehicle, item..."
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
              <table className="w-full min-w-[1400px] border-collapse text-sm">
                <thead className="bg-black/30">
                  <tr className="text-left text-white/70">
                    <th className="p-3">ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Address</th>
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
                          "border-t border-white/10 align-top transition-all",
                          changedIds.has(b.id) && "bg-[#f7c25a]/10"
                        )}
                      >
                        <td className="p-3 font-semibold text-white/90">
                          #{b.id}
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-white/90">
                            {b.customer_name}
                          </div>
                          <div className="mt-1 text-xs text-white/50">
                            {b.email || "-"}
                          </div>
                        </td>

                        <td className="p-3 text-white/80">
                          <div className="font-medium">{b.phone || "-"}</div>
                          <div className="mt-1 text-xs text-white/50">
                            {b.email || "-"}
                          </div>
                        </td>

                        <td className="p-3 text-white/70">
                          <div className="max-w-[320px] whitespace-pre-wrap break-words">
                            {getShortAddress(b)}
                          </div>
                        </td>

                        <td className="p-3 text-white/70">
                          <div>{b.vehicle_make_model || "-"}</div>
                          <div className="text-xs text-white/45">
                            {b.vehicle_year || "-"}
                          </div>
                        </td>

                        <td className="p-3 text-white/70">
                          <div>{formatPreferredDate(b.preferred_date)}</div>
                          <div className="text-xs text-white/45">
                            {formatPreferredTime(b.preferred_time)}
                          </div>
                        </td>

                        <td className="p-3">
                          <select
                            disabled={busyId === b.id}
                            value={b.status}
                            onChange={(e) =>
                              updateBookingStatus(
                                b.id,
                                e.target.value as BookingStatus
                              )
                            }
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

                        <td className="p-3 text-white/60">
                          {prettyDate(b.created_at)}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={async () => {
                              const full = await fetchBookingDetails(b.id);
                              setSelected(full || b);
                            }}
                            className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/40 bg-[#111111] px-4 py-2 text-xs font-extrabold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-[#f7c25a]/70 hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f7c25a]/30"
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

          <Dialog
            open={!!selected}
            onClose={() => setSelected(null)}
            className="relative z-[60]"
          >
            <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
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

                    {selectedLoading && (
                      <div className="mb-4 rounded-2xl border border-[#f7c25a]/20 bg-[#f7c25a]/10 px-4 py-3 text-sm text-[#f7c25a]">
                        Loading latest booking details...
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <User className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Customer
                          </span>
                        </div>

                        <div className="font-semibold text-white">
                          {selected.customer_name}
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-white/80">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-white/50" />
                            <span>{selected.phone || "-"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-white/50" />
                            <span>{selected.email || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#f7c25a]">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            Address
                          </span>
                        </div>

                        <div className="whitespace-pre-wrap break-words text-white/80">
                          {getFullAddress(selected)}
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-white/65 sm:grid-cols-2">
                          <div>City: {selected.city || "-"}</div>
                          <div>State/Province: {selected.state || selected.province || "-"}</div>
                          <div>Postal/Pincode: {selected.pincode || selected.postal_code || "-"}</div>
                          <div>Country: {selected.country || "-"}</div>
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
                        <div className="mt-1 text-white/70">
                          {selected.vehicle_year || "-"}
                        </div>
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
                          <label className="text-xs text-white/50">
                            Update status
                          </label>
                          <select
                            disabled={busyId === selected.id}
                            value={selected.status}
                            onChange={(e) =>
                              updateBookingStatus(
                                selected.id,
                                e.target.value as BookingStatus
                              )
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
                                    Category:{" "}
                                    {it.category_title || it.category_slug || "-"}
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

                      <div className="md:col-span-2 grid gap-3 text-xs text-white/40 sm:grid-cols-2">
                        <div>Created: {prettyDate(selected.created_at)}</div>
                        <div>Updated: {prettyDate(selected.updated_at)}</div>
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