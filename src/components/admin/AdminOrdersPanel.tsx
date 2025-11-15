"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";

function getApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (raw) {
    const noSlash = raw.replace(/\/$/, "");
    return noSlash.endsWith("/api") ? noSlash : `${noSlash}/api`;
  }
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000"))
      return loc.replace(":3000", ":7100") + "/api";
    return loc + "/api";
  }
  return "";
}

const API = getApiBase();

function readToken(): string | null {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    null
  );
}

type OrderItem = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  subtotal: string;
  shipping?: string | null;
  tax?: string | null;
  discount?: string | null;
  grandTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  pickupTime: string;
  shippingAddress?: {
    fullAddress?: string;
    line1?: string;
    line2?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  items?: {
    id: number;
    quantity: number;
    remarks?: string | null;
    variant?: {
      id: number;
      name: string;
    } | null;
  }[];
};

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-purple-100 text-purple-800",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");
  const [paymentFilter, setPaymentFilter] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());
  const alertTimerRef = useRef<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, []);

  function showAlert(type: "success" | "error", message: string, timeout = 4000) {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setAlert({ type, message });
    alertTimerRef.current = window.setTimeout(() => setAlert(null), timeout);
  }

  function flashRow(id: number, ms = 2000) {
    setChangedIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setChangedIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, ms);
  }

  async function fetchOrders(pageArg?: number) {
    const usedPage = pageArg ?? page;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(usedPage));
      params.set("pageSize", String(pageSize));
      if (q) params.set("q", q);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);

      const token = readToken();
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/admin/orders?${params.toString()}`, {
        credentials: "include",
        headers,
      });

      if (res.status === 401) {
        showAlert("error", "Unauthorized — please login");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg =
          (errBody && (errBody.error || errBody.message)) ||
          (await res.text().catch(() => "Request failed"));
        throw new Error(msg);
      }

      const body = await res.json().catch(() => null);
      setOrders(body?.data ?? []);
      setTotal(body?.meta?.total ?? 0);
      if (pageArg && pageArg !== page) setPage(pageArg);
    } catch (err: any) {
      showAlert("error", err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: number, newStatus: string) {
    const token = readToken();
    if (!token) return showAlert("error", "Please login first");

    setBusyId(id);
    try {
      const res = await fetch(`${API}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      showAlert("success", "Order status updated successfully!");
      flashRow(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err: any) {
      showAlert("error", err?.message || "Failed to update order status");
    } finally {
      setBusyId(null);
    }
  }

  function prettyDate(d: string) {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  function formatPickupTime(pickupTime: string) {
    const details: Record<string, string> = {
      Morning: "☀️ 09:00-16:00",
      Evening: "🌅 16:00-00:00",
      Night: "🌙 00:00-08:00",
      SameDay: "⚡ Same Day (+$9.99)",
    };
    return details[pickupTime] || pickupTime;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-28 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order#, email or phone"
              className="px-3 py-2 border rounded"
            />
            <button
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
              onClick={() => {
                setPage(1);
                fetchOrders(1);
              }}
            >
              Search
            </button>
            <button
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
              onClick={() => {
                setQ("");
                setStatusFilter("");
                setPaymentFilter("");
                setPage(1);
                fetchOrders(1);
              }}
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option value={s} key={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2 py-1 border rounded"
            >
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option value={s} key={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alert && (
          <div
            className={`mb-4 p-3 rounded ${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded shadow border border-orange-100">
          <table className="min-w-full">
            <thead className="bg-orange-50 text-orange-800">
              <tr className="text-left">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Order Status</th>
                <th className="px-4 py-2">Pickup Time</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className={`border-t transition-all ${
                      changedIds.has(o.id) ? "bg-orange-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3">${o.grandTotal}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${PAYMENT_STYLES[o.paymentStatus]}`}
                      >
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        disabled={busyId === o.id}
                        value={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className={`px-2 py-1 text-sm font-semibold rounded border ${STATUS_STYLES[o.orderStatus]}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">{formatPickupTime(o.pickupTime)}</td>
                    <td className="px-4 py-3">{prettyDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
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

        {/* Order Details Modal */}
        <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-2xl rounded-lg bg-white shadow-lg p-6">
              {selectedOrder && (
                <>
                  <Dialog.Title className="text-lg font-semibold text-orange-700 mb-2">
                    Order #{selectedOrder.orderNumber}
                  </Dialog.Title>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Customer:</span>{" "}
                      {selectedOrder.customerName} ({selectedOrder.customerEmail})
                    </p>
                    {selectedOrder.customerPhone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedOrder.customerPhone}
                      </p>
                    )}
                    {selectedOrder.shippingAddress && (
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {(() => {
                          const sa = selectedOrder.shippingAddress || {};

                          const line1 =
                            sa.fullAddress ||
                            sa.line1 ||
                            sa.street ||
                            [sa.city, sa.state, sa.postalCode]
                              .filter(Boolean)
                              .join(", ");

                          const line2 = sa.line2 || "";

                          return (
                            <span>
                              {line1 || "-"}
                              {line2 ? `, ${line2}` : ""}
                            </span>
                          );
                        })()}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Payment:</span>{" "}
                      {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedOrder.orderStatus}
                    </p>
                    <p>
                      <span className="font-medium">Pickup Time:</span>{" "}
                      {formatPickupTime(selectedOrder.pickupTime)}
                    </p>
                    <p>
                      <span className="font-medium">Subtotal:</span> $
                      {selectedOrder.subtotal} &nbsp; | &nbsp;
                      <span className="font-medium">Tax:</span> $
                      {selectedOrder.tax} &nbsp; | &nbsp;
                      <span className="font-medium">Total:</span> $
                      {selectedOrder.grandTotal}
                    </p>

                    <hr className="my-3" />
                    <h4 className="font-medium text-gray-800">Items:</h4>
                    <ul className="space-y-1 text-gray-700">
                      {selectedOrder.items?.map((it) => (
                        <li key={it.id} className="flex justify-between text-sm border-b py-1">
                          <span>
                            {it.variant?.name || "Item"} × {it.quantity}
                          </span>
                          <span className="text-gray-500">
                            {it.remarks ? `📝 ${it.remarks}` : "No remarks"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-orange-50 transition"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="px-3 py-1 border rounded bg-orange-50 text-orange-700">
              {page}
            </div>
            <button
              className="px-3 py-1 border rounded hover:bg-orange-50 transition"
              onClick={() => setPage((p) => p + 1)}
              disabled={(page - 1) * pageSize + orders.length >= total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
