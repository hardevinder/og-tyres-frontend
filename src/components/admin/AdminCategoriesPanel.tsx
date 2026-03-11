"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Info,
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

/* =========================
   Types
========================= */
type Category = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  active?: number | boolean;
  created_at?: string;
  updated_at?: string;
};

type Toast = {
  type: "success" | "error" | "info";
  message: string;
  open: boolean;
};

/* =========================
   Helpers
========================= */
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

function getFilePreview(file: File | null) {
  if (!file) return null;
  return URL.createObjectURL(file);
}

function buildImageUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const apiBase = API.replace(/\/api\/?$/, "");
  return `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
}

function flattenErrors(input: any): string[] {
  if (!input) return [];

  if (typeof input === "string") {
    return input.trim() ? [input.trim()] : [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenErrors(item));
  }

  if (typeof input === "object") {
    const collected: string[] = [];

    if (typeof input.message === "string") collected.push(input.message);
    if (typeof input.error === "string") collected.push(input.error);
    if (typeof input.details === "string") collected.push(input.details);
    if (typeof input.msg === "string") collected.push(input.msg);

    if (Array.isArray(input.errors)) {
      collected.push(...flattenErrors(input.errors));
    }

    if (Array.isArray(input.details)) {
      collected.push(...flattenErrors(input.details));
    }

    if (input.validation && Array.isArray(input.validation)) {
      collected.push(
        ...input.validation.flatMap((v: any) => {
          if (typeof v === "string") return [v];
          const parts: string[] = [];
          if (v?.message) parts.push(String(v.message));
          else if (v?.instancePath || v?.keyword) {
            const label = [v.instancePath, v.message].filter(Boolean).join(" ");
            if (label) parts.push(label.trim());
          }
          return parts;
        })
      );
    }

    if (input.data) {
      collected.push(...flattenErrors(input.data));
    }

    if (input.fieldErrors && typeof input.fieldErrors === "object") {
      Object.entries(input.fieldErrors).forEach(([field, val]) => {
        const messages = flattenErrors(val).map((m) => `${field}: ${m}`);
        collected.push(...messages);
      });
    }

    return collected.filter(Boolean);
  }

  return [];
}

function uniqueMessages(messages: string[]) {
  return [...new Set(messages.map((m) => m.trim()).filter(Boolean))];
}

function getErrorMessage(data: any, status?: number) {
  if (!data) {
    return status ? `Request failed (${status})` : "Something went wrong";
  }

  if (typeof data === "string") {
    return data.trim() || (status ? `Request failed (${status})` : "Something went wrong");
  }

  const messages = uniqueMessages(flattenErrors(data));

  if (messages.length > 0) {
    return messages.join(" | ");
  }

  return status ? `Request failed (${status})` : "Something went wrong";
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
    const msg = getErrorMessage(data, res.status);
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

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);

  const [editing, setEditing] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [eTitle, setETitle] = useState("");
  const [eSlug, setESlug] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const createFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const headerPill = useMemo(() => {
    const count = categories.length;
    return `${count} categor${count === 1 ? "y" : "ies"}`;
  }, [categories.length]);

  function showToast(type: Toast["type"], message: string, timeout = 4000) {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast({ type, message, open: true });

    toastTimerRef.current = window.setTimeout(() => {
      setToast((t) => (t ? { ...t, open: false } : t));
    }, timeout);
  }

  useEffect(() => {
    fetchCategories();

    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (createImagePreview) URL.revokeObjectURL(createImagePreview);
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    };
  }, [createImagePreview, editImagePreview]);

  async function fetchCategories() {
    setLoading(true);
    setError(null);

    try {
      const json = await apiFetch("/categories");
      setCategories(normalizeArrayResponse<Category>(json));
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Failed to load categories";
      setError(msg);
      setCategories([]);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function uploadCategoryImageById(categoryId: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const json = await apiFetch(`/categories/${categoryId}/image`, {
      method: "POST",
      body: fd,
    });

    return (json && (json.category ?? json.data ?? json)) || null;
  }

  function resetCreateForm() {
    setTitle("");
    setSlug("");
    setDescription("");
    setCreateImageFile(null);

    if (createImagePreview) {
      URL.revokeObjectURL(createImagePreview);
    }
    setCreateImagePreview(null);

    if (createFileInputRef.current) {
      createFileInputRef.current.value = "";
    }
  }

  function closeEditModal() {
    setShowModal(false);
    setEditing(null);
    setEFieldDefaults();
  }

  function setEFieldDefaults() {
    setETitle("");
    setESlug("");
    setEDescription("");
    setEditImageFile(null);

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(null);

    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  }

  /* ---------- Create ---------- */
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!title.trim()) {
      return showToast("error", "Title is required");
    }

    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug) {
      return showToast("error", "Slug is required");
    }

    setCreating(true);

    try {
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || "",
        active: true,
      };

      const createdResp = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      let created =
        (createdResp &&
          (createdResp.data ?? createdResp.category ?? createdResp)) ||
        null;

      if (created?.id && createImageFile) {
        const uploaded = await uploadCategoryImageById(created.id, createImageFile);
        if (uploaded?.id) created = uploaded;
      }

      if (created?.id) {
        setCategories((s) => [created, ...s.filter((x) => x.id !== created.id)]);
      } else {
        await fetchCategories();
      }

      resetCreateForm();
      showToast(
        "success",
        createImageFile ? "Category and image uploaded successfully" : "Category created successfully"
      );
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  /* ---------- Delete ---------- */
  async function handleDelete(id: number) {
    if (!confirm("Delete category? This may fail if tires exist under it.")) {
      return;
    }

    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      setCategories((s) => s.filter((c) => c.id !== id));
      showToast("success", "Category deleted successfully");
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
    setEditImageFile(null);

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(null);

    setShowModal(true);
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editing) return;

    if (!eTitle.trim()) {
      return showToast("error", "Title is required");
    }

    const finalSlug = (eSlug || slugify(eTitle)).trim();
    if (!finalSlug) {
      return showToast("error", "Slug is required");
    }

    setSavingEdit(true);

    try {
      const payload = {
        title: eTitle.trim(),
        slug: finalSlug,
        description: eDescription?.trim() || "",
      };

      const json = await apiFetch(`/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      let updated = (json && (json.data ?? json.category ?? json)) || null;

      if (editImageFile) {
        const uploaded = await uploadCategoryImageById(editing.id, editImageFile);
        if (uploaded?.id) updated = uploaded;
      }

      if (updated?.id) {
        setCategories((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        await fetchCategories();
      }

      closeEditModal();
      showToast(
        "success",
        editImageFile ? "Category and image updated successfully" : "Category updated successfully"
      );
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  }

  function renderImageBox(src?: string | null, alt = "Category image") {
    const finalSrc = buildImageUrl(src);

    if (!finalSrc) {
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/50">
          <ImageIcon className="h-6 w-6" />
        </div>
      );
    }

    return (
      <img
        src={finalSrc}
        alt={alt}
        className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="relative space-y-6 p-6">
          {/* Toast / Popup */}
          {toast && toast.open && (
            <div
              role="alert"
              className={cn(
                "fixed right-4 top-4 z-50 w-full max-w-md rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur",
                toast.type === "success" &&
                  "border-emerald-400/30 bg-emerald-500/15 text-white",
                toast.type === "error" &&
                  "border-red-500/35 bg-red-500/15 text-white",
                toast.type === "info" &&
                  "border-white/20 bg-white/10 text-white"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-1",
                    toast.type === "error" && "bg-red-500/20",
                    toast.type === "success" && "bg-emerald-500/20",
                    toast.type === "info" && "bg-white/10"
                  )}
                >
                  {toast.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : toast.type === "info" ? (
                    <Info className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {toast.type === "error"
                      ? "Error"
                      : toast.type === "success"
                      ? "Success"
                      : "Info"}
                  </div>
                  <div className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-5 text-white/90">
                    {toast.message}
                  </div>
                </div>

                <button
                  onClick={() => setToast((t) => (t ? { ...t, open: false } : t))}
                  className="rounded-xl p-1 text-white hover:bg-white/10"
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
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                OG Admin • {headerPill}
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Categories Manager
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Create, edit, manage, and upload category photos.
              </p>
            </div>

            <button
              onClick={fetchCategories}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-white">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Create */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:col-span-1">
              <h3 className="mb-4 text-lg font-extrabold text-white">Create Category</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/80">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTitle(v);
                      setSlug((s) => (s ? s : slugify(v)));
                    }}
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/50 focus:ring-2 focus:ring-white/10"
                    placeholder="e.g. Winter"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">
                    Slug
                  </label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/50 focus:ring-2 focus:ring-white/10"
                    placeholder="e.g. winter"
                  />
                  <div className="mt-1 text-[11px] text-white/55">
                    URL-friendly. Auto-generated from title.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/50 focus:ring-2 focus:ring-white/10"
                    placeholder="Short details..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/80">
                    Category Photo
                  </label>

                  <input
                    ref={createFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCreateImageFile(file);

                      if (createImagePreview) {
                        URL.revokeObjectURL(createImagePreview);
                      }
                      setCreateImagePreview(file ? getFilePreview(file) : null);
                    }}
                  />

                  <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/20 bg-black/30 p-4">
                    <div className="flex items-center gap-4">
                      {createImagePreview ? (
                        <img
                          src={createImagePreview}
                          alt="Preview"
                          className="h-20 w-20 rounded-2xl border border-white/15 object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/50">
                          <ImageIcon className="h-7 w-7" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {createImageFile ? createImageFile.name : "No image selected"}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          JPG, PNG, WEBP supported
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => createFileInputRef.current?.click()}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCreateImageFile(null);
                          if (createImagePreview) URL.revokeObjectURL(createImagePreview);
                          setCreateImagePreview(null);
                          if (createFileInputRef.current) createFileInputRef.current.value = "";
                        }}
                        className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm font-extrabold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_8px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>

                  <button
                    type="button"
                    onClick={resetCreateForm}
                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:col-span-2">
              <h3 className="mb-4 text-lg font-extrabold text-white">Categories</h3>

              {loading ? (
                <div className="text-white/75">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="text-white/60">No categories found</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-black/35">
                      <tr className="text-left text-white/80">
                        <th className="p-3">Image</th>
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
                          <td className="p-3 align-top">
                            {renderImageBox(c.image_url, c.title || "Category")}
                          </td>

                          <td className="p-3 align-top text-white">{c.id}</td>

                          <td className="p-3 align-top font-semibold text-white">
                            <div>{c.title}</div>
                            {c.description ? (
                              <div className="mt-1 text-xs font-normal text-white/60">
                                {c.description}
                              </div>
                            ) : null}
                          </td>

                          <td className="p-3 align-top text-white/75">
                            {c.slug || "-"}
                          </td>

                          <td className="p-3 align-top text-white/75">
                            {c.created_at
                              ? new Date(c.created_at).toLocaleString()
                              : "-"}
                          </td>

                          <td className="p-3 align-top">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(c)}
                                className="rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/15"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4 text-white" />
                              </button>

                              <button
                                onClick={() => handleDelete(c.id)}
                                className="rounded-xl border border-red-500/25 bg-red-500/10 p-2 text-white hover:bg-red-500/15"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white/70">Edit</div>
                    <h3 className="text-lg font-extrabold text-white">
                      Category #{editing.id}
                    </h3>
                  </div>

                  <button
                    onClick={closeEditModal}
                    className="rounded-xl p-2 text-white hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/80">
                      Title
                    </label>
                    <input
                      value={eTitle}
                      onChange={(e) => {
                        const v = e.target.value;
                        setETitle(v);
                        setESlug((s) => (s ? s : slugify(v)));
                      }}
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80">
                      Slug
                    </label>
                    <input
                      value={eSlug}
                      onChange={(e) => setESlug(slugify(e.target.value))}
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/80">
                      Description
                    </label>
                    <textarea
                      value={eDescription}
                      onChange={(e) => setEDescription(e.target.value)}
                      rows={5}
                      className="mt-1 w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/80">
                      Category Photo
                    </label>

                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditImageFile(file);

                        if (editImagePreview) {
                          URL.revokeObjectURL(editImagePreview);
                        }
                        setEditImagePreview(file ? getFilePreview(file) : null);
                      }}
                    />

                    <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3">
                          {editImagePreview ? (
                            <img
                              src={editImagePreview}
                              alt="New preview"
                              className="h-20 w-20 rounded-2xl border border-white/15 object-cover"
                            />
                          ) : editing.image_url ? (
                            <img
                              src={buildImageUrl(editing.image_url)}
                              alt={editing.title}
                              className="h-20 w-20 rounded-2xl border border-white/15 object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/50">
                              <ImageIcon className="h-7 w-7" />
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-semibold text-white">
                              {editImageFile
                                ? editImageFile.name
                                : editing.image_url
                                ? "Current uploaded image"
                                : "No image uploaded"}
                            </div>
                            <div className="mt-1 text-xs text-white/55">
                              Choose a file to replace image
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:ml-auto">
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
                          >
                            <Upload className="h-4 w-4" />
                            Choose Photo
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditImageFile(null);
                              if (editImagePreview) URL.revokeObjectURL(editImagePreview);
                              setEditImagePreview(null);
                              if (editFileInputRef.current) editFileInputRef.current.value = "";
                            }}
                            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm font-extrabold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_8px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingEdit ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
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