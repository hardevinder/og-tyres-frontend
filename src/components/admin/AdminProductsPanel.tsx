// components/AdminProductsPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Trash2, Edit2, X, Image as ImageIcon, Plus, Eye } from "lucide-react";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000")) return loc.replace(":3000", ":5000") + "/api";
    return loc + "/api";
  }
  return "";
}
const API = getApiBase();

type Variant = {
  id?: number;
  name?: string;
  sku?: string;
  price?: string | number | null;
  salePrice?: string | number | null;
  mrp?: string | number | null;
  stock?: number | null;
  weightGrams?: number | null;
};
type Product = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  summary?: string | null;
  brand?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  isActive?: boolean;
  categoryId?: number | null;
  category?: { id: number; name: string; slug?: string } | null;
  images?: Array<{ id?: number; url: string; alt?: string | null; position?: number }>;
  variants?: Variant[];
  createdAt?: string;
};
type Category = { id: number; name: string; slug?: string };

type Toast = { type: "success" | "error" | "info"; message: string; open: boolean };

export default function AdminProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // toast
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  function showToast(type: Toast["type"], message: string, timeout = 4000) {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ type, message, open: true });
    toastTimerRef.current = window.setTimeout(() => setToast((t) => (t ? { ...t, open: false } : t)), timeout);
  }

  // create form state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string | number | "">("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newMetaTitle, setNewMetaTitle] = useState("");
  const [newMetaDesc, setNewMetaDesc] = useState("");
  const [newVariants, setNewVariants] = useState<any[]>([]);
  const [newUploadFiles, setNewUploadFiles] = useState<File[]>([]);
  const newFileRef = useRef<HTMLInputElement | null>(null);

  // edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // edit form mirrors product fields
  const [eName, seteName] = useState("");
  const [eSlug, seteSlug] = useState("");
  const [eDescription, seteDescription] = useState("");
  const [eSummary, seteSummary] = useState("");
  const [eBrand, seteBrand] = useState("");
  const [eCategoryId, seteCategoryId] = useState<string | number | "">("");
  const [eIsActive, seteIsActive] = useState<boolean>(true);
  const [eMetaTitle, seteMetaTitle] = useState("");
  const [eMetaDesc, seteMetaDesc] = useState("");
  const [eVariants, seteVariants] = useState<any[]>([]);
  const [eExistingImages, seteExistingImages] = useState<Array<{ id?: number; url: string; alt?: string | null; remove?: boolean }>>([]);
  const [eNewUploadFiles, seteNewUploadFiles] = useState<File[]>([]);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  // image preview modal
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  function readToken(): string | null {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
  }

  // Normalize list shapes like backend and ensure product.categoryId exists
  function normalizeArrayResponse<T = any>(json: any): T[] {
    if (!json) return [];
    if (Array.isArray(json)) return json as T[];
    if (Array.isArray(json.data)) return json.data as T[];
    if (Array.isArray(json.products)) return json.products as T[];
    if (Array.isArray(json.categories)) return json.categories as T[];
    return [];
  }

  function normalizeProductsList(arr: any[]): Product[] {
    return arr.map((p) => ({
      ...p,
      categoryId: p?.category?.id ?? (p?.categoryId ?? null),
      // ensure variants array exists
      variants: Array.isArray(p?.variants) ? p.variants : [],
    }));
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${API}/categories`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json().catch(() => null);
      const arr = normalizeArrayResponse<Category>(json);
      setCategories(arr);
    } catch (err: any) {
      console.error("fetchCategories", err);
      setCategories([]);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/products`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json().catch(() => null);
      const arr = normalizeArrayResponse<Product>(json);
      setProducts(normalizeProductsList(arr));
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // ---------- variant normalization & validation ----------
  function normalizeVariantsForSend(arr: any[]) {
    if (!Array.isArray(arr)) return undefined;
    const mapped = arr.map((v) => ({
      name: String(v.name ?? "").trim(),
      sku: v.sku ? String(v.sku).trim() : undefined,
      price: v.price === "" || v.price == null ? undefined : Number(v.price),
      mrp: v.mrp === "" || v.mrp == null ? undefined : Number(v.mrp),
      salePrice: v.salePrice === "" || v.salePrice == null ? undefined : Number(v.salePrice),
      stock: v.stock === "" || v.stock == null ? undefined : Number(v.stock),
      weightGrams: v.weightGrams === "" || v.weightGrams == null ? undefined : Number(v.weightGrams),
    }));
    for (let i = 0; i < mapped.length; i++) {
      if (!mapped[i].name) throw new Error(`Variant ${i + 1} missing name`);
      if (mapped[i].price === undefined || Number.isNaN(mapped[i].price)) throw new Error(`Variant ${i + 1} missing numeric price`);
    }
    return mapped;
  }

  // ---------- Create product ----------
  function onNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files;
    if (!f) return;
    const files = Array.from(f);
    setNewUploadFiles((s) => [...s, ...files]);
    if (newFileRef.current) newFileRef.current.value = "";
  }

  function removeNewUploadFile(idx: number) {
    setNewUploadFiles((s) => s.filter((_, i) => i !== idx));
  }

  function addNewVariant() {
    setNewVariants((s) => [...s, { name: "", sku: "", price: "", mrp: "", salePrice: "", stock: "", weightGrams: "" }]);
  }
  function updateNewVariant(i: number, key: string, value: any) {
    setNewVariants((s) => s.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  }
  function removeNewVariant(i: number) {
    setNewVariants((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newName) {
      showToast("error", "Name is required");
      return;
    }

    setCreating(true);
    try {
      const slug = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
      const token = readToken();

      // prepare normalized variants (client side validation)
      let normalizedVariants: any[] | undefined;
      try {
        normalizedVariants = newVariants && newVariants.length ? normalizeVariantsForSend(newVariants) : undefined;
      } catch (normErr: any) {
        // show validation error and abort
        showToast("error", normErr?.message || "Invalid variants");
        setCreating(false);
        return;
      }

      // ----------- Always create product via JSON first -----------
      const payload: any = {
        name: newName,
        slug: slug || `${Date.now()}`,
        description: newDescription || newSummary || newName,
        summary: newSummary || undefined,
        brand: newBrand || undefined,
        categoryId: newCategoryId || undefined,
        isActive: newIsActive,
        metaTitle: newMetaTitle || undefined,
        metaDesc: newMetaDesc || undefined,
        variants: normalizedVariants,
      };

      const resCreate = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const jsonCreate = await resCreate.json().catch(() => null);
      if (!resCreate.ok) {
        console.warn("create error", jsonCreate);
        showToast("error", jsonCreate?.error || jsonCreate?.message || "Create failed");
        setCreating(false);
        return;
      }

      const created = (jsonCreate && (jsonCreate.data ?? jsonCreate.product ?? jsonCreate)) || null;
      if (!created || !created.id) {
        // unexpected response shape — refresh product list to be safe
        await fetchProducts();
        showToast("success", "Product created");
      } else {
        // If there are images, upload them in a second request using updateProduct (PUT)
        if (newUploadFiles && newUploadFiles.length) {
          try {
            const fd = new FormData();
            // include minimal identifying fields (some servers expect name/slug)
            fd.append("name", newName || created.name || "");
            fd.append("slug", created.slug ?? String(created.id));
            // append images only
            newUploadFiles.forEach((f) => fd.append("images", f, f.name));

            const resAttach = await fetch(`${API}/products/${created.id}`, {
              method: "PUT",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined, // DO NOT set Content-Type manually
              body: fd,
            });

            const jsonAttach = await resAttach.json().catch(() => null);
            if (!resAttach.ok) {
              console.warn("attach-images error", jsonAttach);
              showToast("error", jsonAttach?.error || jsonAttach?.message || "Attach images failed");
              // still add created product to UI by refetching
              await fetchProducts();
            } else {
              const updated = (jsonAttach && (jsonAttach.data ?? jsonAttach.product ?? jsonAttach)) || null;
              if (updated && updated.id) {
                const norm = normalizeProductsList([updated])[0];
                setProducts((s) => [norm, ...s.filter((p) => p.id !== norm.id)]);
              } else {
                await fetchProducts();
              }
            }
          } catch (attachErr) {
            console.error("image attach error", attachErr);
            showToast("error", "Image upload failed after creation");
            await fetchProducts();
          }
        } else {
          // No files — simply insert created product into list
          const norm = normalizeProductsList([created])[0];
          setProducts((s) => [norm, ...s]);
        }
        showToast("success", "Product created");
      }

      // reset form
      setNewName("");
      setNewSummary("");
      setNewDescription("");
      setNewBrand("");
      setNewUploadFiles([]);
      setNewVariants([]);
      setNewCategoryId("");
      setNewIsActive(true);
      setNewMetaTitle("");
      setNewMetaDesc("");
      if (newFileRef.current) newFileRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setCreating(false);
    }
  }

  // ---------- Delete ----------
  async function handleDelete(id: number) {
    if (!confirm("Delete product? This will remove images and variants if allowed.")) return;
    try {
      const token = readToken();
      const res = await fetch(`${API}/products/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn("delete failed", json);
        showToast("error", json?.error || json?.message || "Delete failed");
        return;
      }
      setProducts((s) => s.filter((p) => p.id !== id));
      showToast("success", "Product deleted");
    } catch (err) {
      console.error(err);
      showToast("error", "Network error");
    }
  }

  // ---------- Edit modal ----------
  function openEditModal(product: Product) {
    setEditingProduct(product);
    seteName(product.name || "");
    seteSlug(product.slug || "");
    seteDescription(product.description || "");
    seteSummary(product.summary ?? "");
    seteBrand(product.brand ?? "");
    seteCategoryId(product.category?.id ?? product.categoryId ?? "");
    seteIsActive(product.isActive ?? true);
    seteMetaTitle(product.metaTitle ?? "");
    seteMetaDesc(product.metaDesc ?? "");
    seteVariants((product.variants || []).map((v: any) => ({ ...v })));
    seteExistingImages((product.images || []).map((img) => ({ id: img.id, url: img.url, alt: img.alt ?? null })));
    seteNewUploadFiles([]);
    if (editFileRef.current) editFileRef.current.value = "";
    setShowModal(true);
  }

  function onEditFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files;
    if (!f) return;
    const files = Array.from(f);
    seteNewUploadFiles((s) => [...s, ...files]);
    if (editFileRef.current) editFileRef.current.value = "";
  }

  function removeEditNewFile(idx: number) {
    seteNewUploadFiles((s) => s.filter((_, i) => i !== idx));
  }

  function toggleRemoveImage(id?: number) {
    seteExistingImages((s) => s.map((img) => (img.id === id ? { ...img, remove: !img.remove } : img)));
  }

  function addEditVariant() {
    seteVariants((s) => [...s, { name: "", sku: "", price: "", mrp: "", salePrice: "", stock: "", weightGrams: "" }]);
  }
  function updateEditVariant(i: number, key: string, value: any) {
    seteVariants((s) => s.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  }
  function removeEditVariant(i: number) {
    seteVariants((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      const token = readToken();
      const slug = eSlug || eName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
      const kept = eExistingImages.filter((im) => !im.remove).map((im) => ({ id: im.id, url: im.url, alt: im.alt }));
      const removedIds = eExistingImages.filter((im) => im.remove && im.id).map((im) => im.id);

      // normalized variants & validation
      const normalizedVariants = eVariants && eVariants.length ? normalizeVariantsForSend(eVariants) : undefined;

      if (eNewUploadFiles.length === 0) {
        // send JSON
        const payload: any = {
          name: eName,
          slug,
          description: eDescription || eSummary || eName,
          summary: eSummary || undefined,
          brand: eBrand || undefined,
          categoryId: eCategoryId || undefined,
          isActive: eIsActive,
          metaTitle: eMetaTitle || undefined,
          metaDesc: eMetaDesc || undefined,
          variants: normalizedVariants,
          existingImages: kept.length ? kept : undefined,
          removeImageIds: removedIds.length ? removedIds : undefined,
        };

        const res = await fetch(`${API}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          console.warn("update failed", json);
          showToast("error", json?.error || json?.message || "Update failed");
          return;
        }
        const updated = (json && (json.data ?? json.product ?? json)) || null;
        if (updated && updated.id) {
          setProducts((s) => s.map((p) => (p.id === updated.id ? normalizeProductsList([updated])[0] : p)));
        } else {
          await fetchProducts();
        }
      } else {
        // FormData flow
        const fd = new FormData();
        fd.append("name", eName);
        fd.append("slug", slug);
        fd.append("description", eDescription || eSummary || eName);
        fd.append("summary", eSummary ?? "");
        fd.append("brand", eBrand ?? "");
        if (eCategoryId) fd.append("categoryId", String(eCategoryId));
        fd.append("isActive", String(eIsActive));
        if (eMetaTitle) fd.append("metaTitle", eMetaTitle);
        if (eMetaDesc) fd.append("metaDesc", eMetaDesc);

        if (eVariants && eVariants.length) fd.append("variants", JSON.stringify(eVariants));

        if (kept.length) fd.append("existingImages", JSON.stringify(kept));
        if (removedIds.length) fd.append("removeImageIds", JSON.stringify(removedIds));

        eNewUploadFiles.forEach((f) => fd.append("images", f, f.name));

        const res = await fetch(`${API}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          console.warn("update failed", json);
          showToast("error", json?.error || json?.message || "Update failed");
          return;
        }

        const updated = (json && (json.data ?? json.product ?? json)) || null;
        if (updated && updated.id) {
          setProducts((s) => s.map((p) => (p.id === updated.id ? normalizeProductsList([updated])[0] : p)));
        } else {
          await fetchProducts();
        }
      }

      setShowModal(false);
      setEditingProduct(null);
      showToast("success", "Product saved");
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Network error");
    } finally {
      setEditSaving(false);
    }
  }

// Helper to display a friendly price
  function displayPrice(v?: Variant) {
    const p = v?.salePrice ?? v?.price ?? v?.mrp ?? null;
    if (p == null || p === "") return "-";
    const num = typeof p === "string" ? parseFloat(p) : Number(p);
    if (!Number.isFinite(num)) return String(p);
    return `$${num.toFixed(2)}`;
  }

  // ---------- Image preview helpers ----------
  function openImagePreview(url: string) {
    setImagePreviewUrl(url);
  }
  function closeImagePreview() {
    setImagePreviewUrl(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && toast.open && (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 w-full max-w-xs rounded shadow p-3 border ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200" : toast.type === "error" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 text-sm text-gray-800">{toast.message}</div>
            <button onClick={() => setToast((t) => (t ? { ...t, open: false } : t))} className="p-1 rounded hover:bg-gray-100" aria-label="Dismiss">
              <X />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Admin Products</h2>
        <div className="flex gap-2">
          <button onClick={() => { fetchProducts(); fetchCategories(); }} className="px-3 py-1 border rounded hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="lg:col-span-1 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Create product</h3>
            <div className="flex items-center gap-2">
              <button onClick={addNewVariant} className="inline-flex items-center gap-1 text-sm bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">
                <Plus size={14} /> Add variant
              </button>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div>
              <label className="text-sm block mb-1">Summary</label>
              <input value={newSummary} onChange={(e) => setNewSummary(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div>
              <label className="text-sm block mb-1">Description</label>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm block mb-1">Brand</label>
                <input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Category</label>
                <select value={String(newCategoryId)} onChange={(e) => setNewCategoryId(e.target.value === "" ? "" : Number(e.target.value))} className="w-full border rounded p-2">
                  <option value="">— Select category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} />
                <span className="text-sm">isActive</span>
              </label>
              <div className="flex-1" />
              <div className="text-xs text-gray-500">Meta</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm block mb-1">Meta title</label>
                <input value={newMetaTitle} onChange={(e) => setNewMetaTitle(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Meta desc</label>
                <input value={newMetaDesc} onChange={(e) => setNewMetaDesc(e.target.value)} className="w-full border rounded p-2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm block mb-1">Variants (optional)</label>
                <button type="button" onClick={addNewVariant} className="text-sm inline-flex items-center gap-1 text-blue-600">
                  <Plus size={14} /> Add variant
                </button>
              </div>
              <div className="space-y-2">
                {newVariants.length === 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    No variants yet — click <span className="font-medium">Add variant</span> to create one.
                  </div>
                )}
                {newVariants.map((v, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 items-center">
                    <input placeholder="name" value={v.name} onChange={(e) => updateNewVariant(i, "name", e.target.value)} className="border rounded p-1" />
                    <input placeholder="price" value={v.price} onChange={(e) => updateNewVariant(i, "price", e.target.value)} className="border rounded p-1" />
                    <input placeholder="sku" value={v.sku} onChange={(e) => updateNewVariant(i, "sku", e.target.value)} className="border rounded p-1" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => removeNewVariant(i)} className="px-2 py-1 border rounded text-xs">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm block mb-1">Images (upload)</label>
              <div className="flex items-center gap-2">
                <input ref={newFileRef} type="file" accept="image/*" multiple onChange={onNewFiles} />
                {/* <div className="text-xs text-gray-500">Add files to upload; otherwise variants are sent as JSON.</div> */}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {newUploadFiles.map((f, i) => (
                  <div key={i} className="border rounded p-1 text-xs flex items-center gap-2">
                    <div className="w-16 h-12 overflow-hidden rounded bg-gray-50 flex items-center justify-center">
                      <ImageIcon className="text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button type="button" onClick={() => removeNewUploadFile(i)} className="p-1 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-3 py-2 rounded">
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewName("");
                  setNewSummary("");
                  setNewDescription("");
                  setNewBrand("");
                  setNewUploadFiles([]);
                  setNewVariants([]);
                  setNewCategoryId("");
                  setNewIsActive(true);
                  setNewMetaTitle("");
                  setNewMetaDesc("");
                  if (newFileRef.current) newFileRef.current.value = "";
                }}
                className="px-3 py-2 border rounded"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Products list */}
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Products</h3>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-gray-600">No products</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Active</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const catName = categories.find((c) => c.id === p.categoryId)?.name ?? p.category?.name ?? "-";
                    // compute default display price: prefer first variant salePrice -> price -> mrp
                    const firstVariant = (p.variants && p.variants.length ? p.variants[0] : undefined) as Variant | undefined;
                    const priceDisplay = firstVariant ? displayPrice(firstVariant) : "-";

                    return (
                      <React.Fragment key={p.id}>
                        <tr className="border-t">
                          <td className="p-2 align-top">{p.id}</td>
                          <td className="p-2 align-top">
                            {p.images && p.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveImageUrl(p.images[0].url)}
                                alt={p.name}
                                className="h-12 w-12 object-cover rounded cursor-pointer"
                                onClick={() => openImagePreview(resolveImageUrl(p.images![0].url))}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xs">No image</div>
                            )}
                          </td>
                          <td className="p-2 align-top">{p.name}</td>
                          <td className="p-2 align-top">{catName}</td>
                          <td className="p-2 align-top">{priceDisplay}</td>
                          <td className="p-2 align-top">{p.isActive ? "Yes" : "No"}</td>
                          <td className="p-2 align-top">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
                          <td className="p-2 align-top">
                            <div className="flex gap-2 items-center">
                              <button onClick={() => openEditModal(p)} aria-label={`Edit ${p.name}`} className="p-2 border rounded hover:bg-gray-50" title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.name}`} className="p-2 border rounded hover:bg-gray-50 text-red-600" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Variants sub-row */}
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="p-2">
                            {p.variants && p.variants.length > 0 ? (
                              <div className="space-y-2">
                                {p.variants.map((v, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="text-xs text-gray-500">#{v.id ?? idx + 1}</div>
                                      <div className="font-medium">{v.name ?? "Variant"}</div>
                                      {v.sku ? <div className="text-xs text-gray-500">({v.sku})</div> : null}
                                    </div>
                                    <div className="text-sm text-gray-700">{displayPrice(v)}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">No variants</div>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Edit product #{editingProduct.id}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">Name</label>
                  <input value={eName} onChange={(e) => seteName(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">Slug</label>
                  <input value={eSlug} onChange={(e) => seteSlug(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm block mb-1">Description</label>
                  <textarea value={eDescription} onChange={(e) => seteDescription(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">Summary</label>
                  <input value={eSummary} onChange={(e) => seteSummary(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">Brand</label>
                  <input value={eBrand} onChange={(e) => seteBrand(e.target.value)} className="w-full border rounded p-2" />
                </div>

                {/* Edit: Category dropdown */}
                <div>
                  <label className="text-sm block mb-1">Category</label>
                  <select value={String(eCategoryId)} onChange={(ev) => seteCategoryId(ev.target.value === "" ? "" : Number(ev.target.value))} className="w-full border rounded p-2">
                    <option value="">— Select category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={eIsActive} onChange={(ev) => seteIsActive(ev.target.checked)} />
                    <span className="text-sm">isActive</span>
                  </label>
                </div>
                <div>
                  <label className="text-sm block mb-1">Meta title</label>
                  <input value={eMetaTitle} onChange={(e) => seteMetaTitle(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="text-sm block mb-1">Meta desc</label>
                  <input value={eMetaDesc} onChange={(e) => seteMetaDesc(e.target.value)} className="w-full border rounded p-2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm block">Variants (will replace existing)</label>
                  <button type="button" onClick={addEditVariant} className="text-sm text-blue-600 flex items-center gap-1">
                    <Plus size={14} /> Add variant
                  </button>
                </div>
                <div className="space-y-2">
                  {eVariants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                      <input placeholder="name" value={v.name ?? ""} onChange={(ev) => updateEditVariant(i, "name", ev.target.value)} className="border rounded p-1" />
                      <input placeholder="sku" value={v.sku ?? ""} onChange={(ev) => updateEditVariant(i, "sku", ev.target.value)} className="border rounded p-1" />
                      <input placeholder="price" value={v.price ?? ""} onChange={(ev) => updateEditVariant(i, "price", ev.target.value)} className="border rounded p-1" />
                      <button type="button" onClick={() => removeEditVariant(i)} className="px-2 py-1 border rounded">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1">Existing images (toggle to remove / click to preview)</label>
                <div className="flex gap-2 flex-wrap">
                  {eExistingImages.map((img) => (
                    <div key={String(img.id) + img.url} className={`border rounded p-1 text-xs ${img.remove ? "opacity-40" : ""}`}>
                      <div className="w-28 h-20 overflow-hidden rounded cursor-pointer" onClick={() => openImagePreview(resolveImageUrl(img.url))}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(img.url)} alt={img.alt || ""} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <label className="inline-flex items-center gap-1">
                          <input type="checkbox" checked={!!img.remove} onChange={() => toggleRemoveImage(img.id)} /> Remove
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1">Upload new images</label>
                <input ref={editFileRef} type="file" accept="image/*" multiple onChange={onEditFiles} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {eNewUploadFiles.map((f, i) => (
                    <div key={i} className="text-xs border p-1 rounded flex items-center gap-2">
                      <div className="w-16 h-12 overflow-hidden rounded bg-gray-50 flex items-center justify-center">
                        <ImageIcon />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <button type="button" onClick={() => removeEditNewFile(i)} className="p-1 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={editSaving} className="bg-emerald-600 text-white px-3 py-2 rounded">
                  {editSaving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {imagePreviewUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded shadow-lg p-4 max-w-3xl w-full">
            <div className="flex items-center justify-between mb-3">
              <div />
              <button onClick={closeImagePreview} className="p-1 rounded hover:bg-gray-100">
                <X />
              </button>
            </div>
            <div className="w-full h-[60vh] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
