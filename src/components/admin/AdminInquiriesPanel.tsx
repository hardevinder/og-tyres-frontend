"use client";

import React, { useEffect, useRef, useState } from "react";

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

type Inquiry = {
  id: number;
  companyName?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  createdAt: string;
};

export default function AdminInquiriesPanel() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const alertTimerRef = useRef<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current);
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

  async function fetchInquiries(pageArg?: number) {
    const usedPage = pageArg ?? page;
    setLoading(true);
    try {
      const token = readToken();
      if (!token) {
        showAlert("error", "Please login first");
        return;
      }

      const headers: any = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/admin/inquiries`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load inquiries");

      const body = await res.json().catch(() => null);
      setInquiries(body?.data ?? []);
      setTotal(body?.data?.length ?? 0);
      if (pageArg && pageArg !== page) setPage(pageArg);
    } catch (err: any) {
      showAlert("error", err.message || "Error loading inquiries");
    } finally {
      setLoading(false);
    }
  }

  async function deleteInquiry(id: number) {
    if (!confirm("Delete this inquiry permanently?")) return;

    const token = readToken();
    if (!token) return showAlert("error", "Please login first");

    setBusyId(id);
    try {
      const res = await fetch(`${API}/admin/inquiries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");

      showAlert("success", "Inquiry deleted successfully");
      setInquiries((prev) => prev.filter((x) => x.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err: any) {
      showAlert("error", err.message || "Delete failed");
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

  const filtered = q
    ? inquiries.filter(
        (i) =>
          i.fullName.toLowerCase().includes(q.toLowerCase()) ||
          (i.companyName ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (i.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (i.phone ?? "").includes(q)
      )
    : inquiries;

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-28 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, company, email or phone"
              className="px-3 py-2 border rounded"
            />
            <button
              onClick={() => {
                setPage(1);
                fetchInquiries(1);
              }}
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              Search
            </button>
            <button
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
              onClick={() => {
                setQ("");
                setPage(1);
                fetchInquiries(1);
              }}
            >
              Reset
            </button>
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
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filtered.map((i) => (
                  <tr key={i.id} className="border-t hover:bg-orange-50/40 transition">
                    <td className="px-4 py-3 align-top font-semibold text-orange-700">
                      #{i.id}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div>{i.companyName || "—"}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm">
                      <div className="font-medium">{i.fullName}</div>
                      <div className="text-gray-500">{i.email}</div>
                      {i.phone && <div className="text-gray-500">{i.phone}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-sm max-w-xs truncate">
                      {i.message || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-gray-600">
                      {prettyDate(i.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        onClick={() => deleteInquiry(i.id)}
                        disabled={busyId === i.id}
                        className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition"
                      >
                        {busyId === i.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
              disabled={(page - 1) * pageSize + inquiries.length >= total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
