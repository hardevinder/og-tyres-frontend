// components/AdminProductsPanel.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

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

type Tyre = {
  id: number;
  category_id: number;
  brand: string;
  name: string;
  size: string;
  sku?: string | null;
  image_url?: string | null;
  specs_json?: any;
  stock_qty?: number | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Category = { id: number; title: string; slug?: string };
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

// Normalize list shapes like backend
function normalizeArrayResponse<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.tires)) return json.tires as T[];
  if (Array.isArray(json.categories)) return json.categories as T[];
  return [];
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

function safeJsonParse(input: string) {
  const t = (input || "").trim();
  if (!t) return undefined;
  try {
    return JSON.parse(t);
  } catch {
    throw new Error(
      'Specs JSON is invalid. Please enter valid JSON (e.g. {"speed":"H"}).'
    );
  }
}

/** ✅ upload image helper (FormData key = "file") */
async function uploadTyreImage(tyreId: number, file: File) {
  const token = readToken();
  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await fetch(`${API}/tires/${tyreId}/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });

  const txt = await res.text();
  let data: any = null;
  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = txt;
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Upload failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export default function AdminProductsPanel() {
  const [tires, setTires] = useState<Tyre[]>([]);
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

  // create form state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newStockQty, setNewStockQty] = useState<string>("");
  const [newSpecsJson, setNewSpecsJson] = useState<string>("");
  const [newCategoryId, setNewCategoryId] = useState<string | number | "">("");
  const [newActive, setNewActive] = useState(true);

  // ✅ image upload (create)
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const newImageRef = useRef<HTMLInputElement | null>(null);

  // edit modal state
  const [editingTyre, setEditingTyre] = useState<Tyre | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // edit fields
  const [eName, setEName] = useState("");
  const [eBrand, setEBrand] = useState("");
  const [eSize, setESize] = useState("");
  const [eSku, setESku] = useState("");
  const [eStockQty, setEStockQty] = useState<string>("");
  const [eSpecsJson, setESpecsJson] = useState<string>("");
  const [eCategoryId, setECategoryId] = useState<string | number | "">("");
  const [eActive, setEActive] = useState<boolean>(true);

  // ✅ image upload (edit)
  const [eNewImageFile, setENewImageFile] = useState<File | null>(null);
  const [eRemoveImage, setERemoveImage] = useState(false);
  const editImageRef = useRef<HTMLInputElement | null>(null);

  // image preview modal
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const headerPill = useMemo(() => {
    const count = tires.length;
    return `${count} tyre${count === 1 ? "" : "s"}`;
  }, [tires.length]);

  useEffect(() => {
    fetchTires();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    try {
      const json = await apiFetch("/categories");
      setCategories(normalizeArrayResponse<Category>(json));
    } catch (err: any) {
      console.error("fetchCategories", err);
      setCategories([]);
    }
  }

  async function fetchTires() {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch("/tires");
      setTires(normalizeArrayResponse<Tyre>(json));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load");
      setTires([]);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Create tyre ----------
  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!newCategoryId) return showToast("error", "Category is required");
    if (!newBrand.trim()) return showToast("error", "Brand is required");
    if (!newName.trim()) return showToast("error", "Name is required");
    if (!newSize.trim()) return showToast("error", "Size is required");

    setCreating(true);
    try {
      const specs = safeJsonParse(newSpecsJson);

      const payload: any = {
        category_id: Number(newCategoryId),
        brand: newBrand.trim(),
        name: newName.trim(),
        size: newSize.trim(),
        sku: newSku.trim() ? newSku.trim() : undefined,
        specs_json: specs,
        stock_qty: newStockQty.trim() === "" ? undefined : Number(newStockQty),
        active: newActive,
      };

      const createdResp = await apiFetch("/tires", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created =
        (createdResp && (createdResp.data ?? createdResp.tyre ?? createdResp)) ||
        null;

      // ✅ If created, upload image (if selected)
      let finalTyre: Tyre | null = created?.id ? created : null;

      if (created?.id && newImageFile) {
        try {
          const up = await uploadTyreImage(created.id, newImageFile);
          const imageUrl = up?.image_url ?? up?.tyre?.image_url ?? null;
          finalTyre = { ...created, image_url: imageUrl ?? created.image_url };
        } catch (upErr: any) {
          showToast("error", upErr?.message || "Image upload failed");
        }
      }

      if (finalTyre?.id) {
        setTires((s) => [finalTyre!, ...s]);
      } else {
        await fetchTires();
      }

      showToast("success", "Tyre created");

      // reset
      setNewName("");
      setNewBrand("");
      setNewSize("");
      setNewSku("");
      setNewStockQty("");
      setNewSpecsJson("");
      setNewCategoryId("");
      setNewActive(true);

      setNewImageFile(null);
      if (newImageRef.current) newImageRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setCreating(false);
    }
  }

  // ---------- Delete ----------
  async function handleDelete(id: number) {
    if (!confirm("Delete tyre?")) return;
    try {
      await apiFetch(`/tires/${id}`, { method: "DELETE" });
      setTires((s) => s.filter((t) => t.id !== id));
      showToast("success", "Tyre deleted");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Delete failed");
    }
  }

  // ---------- Edit modal ----------
  function openEditModal(t: Tyre) {
    setEditingTyre(t);
    setEName(t.name || "");
    setEBrand(t.brand || "");
    setESize(t.size || "");
    setESku(t.sku ?? "");
    setEStockQty(t.stock_qty == null ? "" : String(t.stock_qty));
    setESpecsJson(t.specs_json ? JSON.stringify(t.specs_json, null, 2) : "");
    setECategoryId(t.category_id ?? "");
    setEActive(t.active ?? true);

    // image edit states
    setENewImageFile(null);
    setERemoveImage(false);
    if (editImageRef.current) editImageRef.current.value = "";

    setShowModal(true);
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editingTyre) return;

    if (!eCategoryId) return showToast("error", "Category is required");
    if (!eBrand.trim()) return showToast("error", "Brand is required");
    if (!eName.trim()) return showToast("error", "Name is required");
    if (!eSize.trim()) return showToast("error", "Size is required");

    setEditSaving(true);
    try {
      const specs = safeJsonParse(eSpecsJson);

      // ✅ 1) Update tyre fields (JSON)
      const payload: any = {
        category_id: Number(eCategoryId),
        brand: eBrand.trim(),
        name: eName.trim(),
        size: eSize.trim(),
        sku: eSku.trim() ? eSku.trim() : undefined,
        specs_json: specs,
        stock_qty: eStockQty.trim() === "" ? undefined : Number(eStockQty),
        active: eActive,
      };

      // optional: remove image (sets image_url null)
      if (eRemoveImage) payload.image_url = null;

      const json = await apiFetch(`/tires/${editingTyre.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      let updated = (json && (json.data ?? json.tyre ?? json)) || null;

      // ✅ 2) If user selected a new image file, upload it
      if (eNewImageFile) {
        try {
          const up = await uploadTyreImage(editingTyre.id, eNewImageFile);
          const imageUrl = up?.image_url ?? up?.tyre?.image_url ?? null;
          updated = updated
            ? { ...updated, image_url: imageUrl ?? updated.image_url }
            : updated;
        } catch (upErr: any) {
          showToast("error", upErr?.message || "Image upload failed");
        }
      }

      if (updated?.id) {
        setTires((s) => s.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        await fetchTires();
      }

      setShowModal(false);
      setEditingTyre(null);
      showToast("success", "Saved");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setEditSaving(false);
    }
  }

  // ---------- Image preview helpers ----------
  function openImagePreview(url: string) {
    setImagePreviewUrl(url);
  }
  function closeImagePreview() {
    setImagePreviewUrl(null);
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
                  onClick={() =>
                    setToast((t) => (t ? { ...t, open: false } : t))
                  }
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
                Tires Manager
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Create, edit, manage tires (OG Gold theme).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchTires();
                  fetchCategories();
                }}
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
            {/* Create form */}
            <div className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="font-extrabold mb-3">Create tyre</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Category
                    </label>
                    <select
                      value={String(newCategoryId)}
                      onChange={(e) =>
                        setNewCategoryId(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    >
                      {/* ✅ FIX: option bg + text */}
                      <option
                        value=""
                        className="bg-[#0b0b0b] text-white"
                      >
                        — Select —
                      </option>
                      {categories.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="bg-[#0b0b0b] text-white"
                        >
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-black/40 accent-[#f7c25a]"
                        checked={newActive}
                        onChange={(e) => setNewActive(e.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">
                    Brand
                  </label>
                  <input
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">
                    Name
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Size
                    </label>
                    <input
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      placeholder="e.g. 185/65 R15"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      SKU (optional)
                    </label>
                    <input
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Stock qty (optional)
                    </label>
                    <input
                      value={newStockQty}
                      onChange={(e) => setNewStockQty(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                      placeholder="e.g. 12"
                    />
                  </div>

                  {/* ✅ Upload image instead of URL */}
                  <div>
                    <label className="text-xs font-semibold text-white/70">
                      Image (upload)
                    </label>
                    <input
                      ref={newImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewImageFile(e.target.files?.[0] || null)
                      }
                      className="mt-2 block w-full text-xs text-white/70"
                    />
                    {newImageFile ? (
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <UploadCloud className="h-4 w-4 text-white/60" />
                        <div className="text-xs">
                          <div className="font-semibold">{newImageFile.name}</div>
                          <div className="text-white/40">
                            {Math.round(newImageFile.size / 1024)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewImageFile(null);
                            if (newImageRef.current)
                              newImageRef.current.value = "";
                          }}
                          className="ml-auto p-2 rounded-xl hover:bg-white/10 text-red-300"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-white/35">
                        Optional. You can upload after create too.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70">
                    Specs JSON (optional)
                  </label>
                  <textarea
                    value={newSpecsJson}
                    onChange={(e) => setNewSpecsJson(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60 focus:ring-2 focus:ring-[#f7c25a]/20"
                    placeholder='e.g. {"speed":"H","load":"91"}'
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
                      setNewName("");
                      setNewBrand("");
                      setNewSize("");
                      setNewSku("");
                      setNewStockQty("");
                      setNewSpecsJson("");
                      setNewCategoryId("");
                      setNewActive(true);

                      setNewImageFile(null);
                      if (newImageRef.current) newImageRef.current.value = "";
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Tires list */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <h3 className="font-extrabold mb-3">Tires</h3>

              {loading ? (
                <div className="text-white/70">Loading...</div>
              ) : tires.length === 0 ? (
                <div className="text-white/60">No tires</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-black/30">
                      <tr className="text-left text-white/70">
                        <th className="p-3">ID</th>
                        <th className="p-3">Image</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Active</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tires.map((t) => {
                        const catName =
                          categories.find((c) => c.id === Number(t.category_id))?.title ?? "-";
                        const img = t.image_url
                          ? resolveImageUrl(t.image_url)
                          : null;

                        return (
                          <tr key={t.id} className="border-t border-white/10">
                            <td className="p-3 align-top text-white/90">
                              {t.id}
                            </td>
                            <td className="p-3 align-top">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img}
                                  alt={t.name}
                                  className="h-12 w-12 object-cover rounded-xl cursor-pointer border border-white/10"
                                  onClick={() => openImagePreview(img)}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl border border-white/10 bg-black/30 flex items-center justify-center text-[10px] text-white/50">
                                  No image
                                </div>
                              )}
                            </td>
                            <td className="p-3 align-top font-semibold text-white/90">
                              {t.brand}
                            </td>
                            <td className="p-3 align-top font-semibold">
                              {t.name}
                            </td>
                            <td className="p-3 align-top text-white/80">
                              {t.size}
                            </td>
                            <td className="p-3 align-top text-white/80">
                              {catName}
                            </td>
                            <td className="p-3 align-top text-[#f7c25a] font-bold">
                              {t.stock_qty ?? "-"}
                            </td>
                            <td className="p-3 align-top">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2 py-1 text-[11px] font-bold",
                                  t.active
                                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                    : "border-white/10 bg-white/5 text-white/60"
                                )}
                              >
                                {t.active ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="p-3 align-top">
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => openEditModal(t)}
                                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4 text-white/80" />
                                </button>
                                <button
                                  onClick={() => handleDelete(t.id)}
                                  className="p-2 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-500/15"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-200" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Edit modal */}
          {showModal && editingTyre && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-[#f7c25a] font-bold">Edit</div>
                    <h3 className="text-lg font-extrabold">
                      Tyre #{editingTyre.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTyre(null);
                    }}
                    className="p-2 rounded-xl hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Category
                      </label>
                      <select
                        value={String(eCategoryId)}
                        onChange={(ev) =>
                          setECategoryId(
                            ev.target.value === "" ? "" : Number(ev.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      >
                        {/* ✅ FIX: option bg + text */}
                        <option
                          value=""
                          className="bg-[#0b0b0b] text-white"
                        >
                          — Select —
                        </option>
                        {categories.map((c) => (
                          <option
                            key={c.id}
                            value={c.id}
                            className="bg-[#0b0b0b] text-white"
                          >
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-black/40 accent-[#f7c25a]"
                          checked={eActive}
                          onChange={(ev) => setEActive(ev.target.checked)}
                        />
                        Active
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Brand
                      </label>
                      <input
                        value={eBrand}
                        onChange={(e) => setEBrand(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Name
                      </label>
                      <input
                        value={eName}
                        onChange={(e) => setEName(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Size
                      </label>
                      <input
                        value={eSize}
                        onChange={(e) => setESize(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        SKU (optional)
                      </label>
                      <input
                        value={eSku}
                        onChange={(e) => setESku(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Stock qty (optional)
                      </label>
                      <input
                        value={eStockQty}
                        onChange={(e) => setEStockQty(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>

                    {/* ✅ Upload new image */}
                    <div>
                      <label className="text-xs font-semibold text-white/70">
                        Upload new image
                      </label>
                      <input
                        ref={editImageRef}
                        type="file"
                        accept="image/*"
                        onChange={(ev) =>
                          setENewImageFile(ev.target.files?.[0] || null)
                        }
                        className="mt-2 block w-full text-xs text-white/70"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 text-xs text-white/70">
                          <input
                            type="checkbox"
                            className="accent-[#f7c25a]"
                            checked={eRemoveImage}
                            onChange={(ev) => setERemoveImage(ev.target.checked)}
                          />
                          Remove current image
                        </label>
                        {editingTyre.image_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              openImagePreview(
                                resolveImageUrl(editingTyre.image_url!)
                              )
                            }
                            className="text-xs font-bold text-[#f7c25a] hover:brightness-110"
                          >
                            Preview current
                          </button>
                        ) : (
                          <span className="text-xs text-white/35">
                            No current image
                          </span>
                        )}
                      </div>

                      {eNewImageFile && (
                        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                          <ImageIcon className="h-4 w-4 text-white/60" />
                          <div className="text-xs">
                            <div className="font-semibold">
                              {eNewImageFile.name}
                            </div>
                            <div className="text-white/40">
                              {Math.round(eNewImageFile.size / 1024)} KB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setENewImageFile(null);
                              if (editImageRef.current)
                                editImageRef.current.value = "";
                            }}
                            className="ml-auto p-2 rounded-xl hover:bg-white/10 text-red-300"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-white/70">
                        Specs JSON (optional)
                      </label>
                      <textarea
                        value={eSpecsJson}
                        onChange={(e) => setESpecsJson(e.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#f7c25a]/60"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="flex-1 rounded-2xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110 disabled:opacity-60"
                    >
                      {editSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTyre(null);
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

          {/* Image preview modal */}
          {imagePreviewUrl && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
              <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-white/40">Preview</div>
                  <button
                    onClick={closeImagePreview}
                    className="p-2 rounded-xl hover:bg-white/10"
                  >
                    <X className="h-5 w-5 text-white/80" />
                  </button>
                </div>
                <div className="w-full h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}