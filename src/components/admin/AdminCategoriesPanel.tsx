"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Edit2, X } from "lucide-react";

/* =========================
   API base (same as products)
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

type Category = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  active?: number | boolean;
  created_at?: string;
  updated_at?: string;
};

type Toast = {
  type: "success" | "error" | "info";
  message: string;
  open: boolean;
};

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

function normalizeArrayResponse<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.categories)) return json.categories as T[];
  return [];
}

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const token = readToken();
  const url = `${API}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
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

/* =========================
   Component
========================= */
export default function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // toast
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  function showToast(type: Toast["type"], message: string, timeout = 3500) {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ type, message, open: true });
    toastTimerRef.current = window.setTimeout(
      () => setToast((t) => (t ? { ...t, open: false } : t)),
      timeout
    );
  }

  // create form
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // edit modal
  const [editing, setEditing] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [eTitle, setETitle] = useState("");
  const [eSlug, setESlug] = useState("");
  const [eDescription, setEDescription] = useState("");

  const headerPill = useMemo(() => {
    const count = categories.length;
    return `${count} categor${count === 1 ? "y" : "ies"}`;
  }, [categories.length]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch("/categories");
      setCategories(normalizeArrayResponse<Category>(json));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Create ---------- */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) return showToast("error", "Title is required");

    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug) return showToast("error", "Slug is required");

    setCreating(true);
    try {
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || "",
        active: 1,
      };

      const createdResp = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created =
        (createdResp &&
          (createdResp.data ?? createdResp.category ?? createdResp)) ||
        null;

      if (created?.id) setCategories((s) => [created, ...s]);
      else await fetchCategories();

      setTitle("");
      setSlug("");
      setDescription("");
      showToast("success", "Category created");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setCreating(false);
    }
  }

  /* ---------- Delete ---------- */
  async function handleDelete(id: number) {
    if (!confirm("Delete category? This may fail if tyres exist under it."))
      return;

    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      setCategories((s) => s.filter((c) => c.id !== id));
      showToast("success", "Category deleted");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Delete failed");
    }
  }

  /* ---------- Edit ---------- */
  function openEditModal(c: Category) {
    setEditing(c);
    setETitle(c.title || "");
    setESlug(c.slug || "");
    setEDescription(c.description ?? "");
    setShowModal(true);
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editing) return;

    if (!eTitle.trim()) return showToast("error", "Title is required");
    const finalSlug = (eSlug || slugify(eTitle)).trim();
    if (!finalSlug) return showToast("error", "Slug is required");

    setSavingEdit(true);
    try {
      const payload: any = {
        title: eTitle.trim(),
        slug: finalSlug,
        description: eDescription?.trim() || "",
      };

      const json = await apiFetch(`/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updated = (json && (json.data ?? json.category ?? json)) || null;

      if (updated?.id)
        setCategories((s) =>
          s.map((x) => (x.id === updated.id ? updated : x))
        );
      else await fetchCategories();

      setShowModal(false);
      setEditing(null);
      showToast("success", "Saved");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.16),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative p-6 space-y-6">
          {/* Toast */}
          {toast && toast.open && (
            <div
              role="status"
              className={cn(
                "fixed right-4 top-4 z-50 w-full max-w-sm rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur",
                toast.type === "success" &&
                  "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
                toast.type === "error" &&
                  "border-red-500/25 bg-red-500/10 text-red-100",
                toast.type === "info" &&
                  "border-white/10 bg-white/5 text-white/90"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm">{toast.message}</div>
                <button
                  onClick={() => setToast((t) => (t ? { ...t, open: false } : t))}
                  className="p-1 rounded-xl hover:bg-white/10"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                OG Admin • {headerPill}
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                Categories Manager
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Create, edit, manage categories (OG Gold theme).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchCategories}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create */}
            <div className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="font-extrabold mb-3">Create category</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/70">Title</label>
                  <input
                    value={title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTitle(v);
                      // auto-fill slug only if user hasn't typed one
                      setSlug((s) => (s ? s : slugify(v)));
                    }}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    placeholder="e.g. Winter"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    placeholder="e.g. winter"
                  />
                  <div className="mt-1 text-[11px] text-white/55">
                    URL-friendly. Auto-generated from title.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    placeholder="Short details..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 rounded-2xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setSlug("");
                      setDescription("");
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="font-extrabold mb-3">Categories</h3>

              {loading ? (
                <div className="text-white/70">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="text-white/60">No categories</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-black/30">
                      <tr className="text-left text-white/70">
                        <th className="p-3">ID</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id} className="border-t border-white/10">
                          <td className="p-3 align-top text-white/90">{c.id}</td>
                          <td className="p-3 align-top font-semibold text-white/90">
                            {c.title}
                          </td>
                          <td className="p-3 align-top text-white/70">{c.slug ?? "-"}</td>
                          <td className="p-3 align-top text-white/70">
                            {c.created_at
                              ? new Date(c.created_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="p-3 align-top">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => openEditModal(c)}
                                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4 text-white/80" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="p-2 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-500/15"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-200" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Edit Modal */}
          {showModal && editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-[#f7c25a] font-bold">Edit</div>
                    <h3 className="text-lg font-extrabold">
                      Category #{editing.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                    }}
                    className="p-2 rounded-xl hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Title
                    </label>
                    <input
                      value={eTitle}
                      onChange={(e) => {
                        const v = e.target.value;
                        setETitle(v);
                        setESlug((s) => (s ? s : slugify(v)));
                      }}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Slug
                    </label>
                    <input
                      value={eSlug}
                      onChange={(e) => setESlug(slugify(e.target.value))}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Description
                    </label>
                    <textarea
                      value={eDescription}
                      onChange={(e) => setEDescription(e.target.value)}
                      rows={5}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 rounded-2xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
                    >
                      {savingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditing(null);
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}