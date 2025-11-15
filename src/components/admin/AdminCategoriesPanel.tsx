"use client";

import React, { useEffect, useRef, useState } from "react";

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

type Category = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  createdAt?: string;
};

export default function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // edit
  const [editing, setEditing] = useState<Category | null>(null);
  const [eName, seteName] = useState("");
  const [eDescription, seteDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  function readToken(): string | null {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/categories`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json().catch(() => null);
      const arr = Array.isArray(json?.categories) ? json.categories : Array.isArray(json) ? json : [];
      setCategories(arr);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function slugify(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!name || !name.trim()) return alert("Name required");
    setCreating(true);
    try {
      const payload = { name: name.trim(), description: description || "" };
      const token = readToken();
      const res = await fetch(`${API}/admin/categories`, {
        method: "POST",
        headers: token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn("create category failed", json);
        alert(json?.error || json?.message || "Create failed");
        return;
      }
      const created = json?.category || json?.data || null;
      if (created && created.id) setCategories((s) => [created, ...s]);
      else await fetchCategories();

      setName("");
      setDescription("");
      alert("Category created");
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete category? This will fail if products exist under it.")) return;
    try {
      const token = readToken();
      const res = await fetch(`${API}/admin/categories/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn("delete failed", json);
        alert(json?.error || json?.message || "Delete failed");
        return;
      }
      setCategories((s) => s.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  function openEdit(c: Category) {
    setEditing(c);
    seteName(c.name || "");
    seteDescription(c.description ?? "");
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editing) return;
    if (!eName || !eName.trim()) return alert("Name required");
    setSavingEdit(true);
    try {
      // keep slug logic similar to backend: if name changed, we can send slug or let backend keep existing
      const token = readToken();
      const payload: any = { name: eName.trim(), description: eDescription ?? "" };
      // optional: send slug regenerated from name but preserve id-suffix handling on backend
      payload.slug = `${slugify(eName)}-${editing.id}`;

      const res = await fetch(`${API}/admin/categories/${editing.id}`, {
        method: "PUT",
        headers: token
          ? {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        console.warn("update failed", json);
        alert(json?.error || json?.message || "Update failed");
        return;
      }
      const updated = json?.category || json?.data || null;
      if (updated && updated.id) setCategories((s) => s.map((c) => (c.id === updated.id ? updated : c)));
      else await fetchCategories();

      setEditing(null);
      alert("Saved");
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Admin Categories</h2>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Create category</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="text-sm block mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-3 py-2 rounded">{creating ? "Creating..." : "Create"}</button>
              <button type="button" onClick={() => { setName(""); setDescription(""); }} className="px-3 py-2 border rounded">Reset</button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Categories</h3>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-gray-600">No categories</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Slug</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2 align-top">{c.id}</td>
                      <td className="p-2 align-top">{c.name}</td>
                      <td className="p-2 align-top">{c.slug ?? "-"}</td>
                      <td className="p-2 align-top">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                      <td className="p-2 align-top">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="px-2 py-1 border rounded text-sm">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="px-2 py-1 border rounded text-sm text-red-600">Delete</button>
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

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Edit category #{editing.id}</h3>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-gray-100">Close</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Name</label>
                <input value={eName} onChange={(ev) => seteName(ev.target.value)} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-sm block mb-1">Description</label>
                <textarea value={eDescription} onChange={(ev) => seteDescription(ev.target.value)} className="w-full border rounded p-2" />
              </div>

              <div className="flex gap-2">
                <button disabled={savingEdit} type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded">{savingEdit ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
