"use client";

import React, { useEffect, useState } from "react";

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

/**
 * Available territories for Canada shipping
 */
const TERRITORIES: { code: string; name: string; prefix: string }[] = [
  { code: "VAN", name: "Vancouver", prefix: "V" }, // BC starts with V
  { code: "YUK", name: "Yukon", prefix: "Y" }, // Yukon starts with Y
];

type ShippingRule = {
  id: number;
  name?: string | null;
  postalPrefix?: string | null;
  charge: string | null;
  minOrderValue: string | null;
  priority: number;
  isActive: boolean;
  createdAt?: string;
};

function readToken(): string | null {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || null;
}

function buildAuthHeaders(contentType = "application/json") {
  const token = readToken();
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function AdminShippingRulesPanel() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [territory, setTerritory] = useState<string | "">("");
  const [charge, setCharge] = useState<string>("0.00");
  const [minOrderValue, setMinOrderValue] = useState<string>("");
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [editing, setEditing] = useState<ShippingRule | null>(null);
  const [eName, seteName] = useState("");
  const [eTerritory, seteTerritory] = useState<string | "">("");
  const [eCharge, seteCharge] = useState<string>("0.00");
  const [eMinOrderValue, seteMinOrderValue] = useState<string>("");
  const [ePriority, setePriority] = useState<number>(0);
  const [eIsActive, seteIsActive] = useState<boolean>(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchRules();
  }, [page]);

  async function fetchRules() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/admin/shipping-rules?limit=${limit}&page=${page}`, {
        credentials: "include",
        headers: buildAuthHeaders(""),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setRules(Array.isArray(json?.data) ? json.data : []);
    } catch (err: any) {
      console.error("fetchRules error:", err);
      setError(String(err?.message || err));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setName("");
    setTerritory("");
    setCharge("0.00");
    setMinOrderValue("");
    setPriority(0);
    setIsActive(true);
  }

  function openEdit(rule: ShippingRule) {
    setEditing(rule);
    seteName(rule.name ?? "");
    seteCharge(rule.charge ?? "0.00");
    seteMinOrderValue(rule.minOrderValue ?? "");
    setePriority(rule.priority ?? 0);
    seteIsActive(!!rule.isActive);
    // Try to match prefix to a territory
    const match = TERRITORIES.find((t) => rule.postalPrefix?.startsWith(t.prefix));
    seteTerritory(match?.code ?? "");
  }

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!territory || String(charge).trim() === "") return alert("Please select a territory and provide charge");
    setCreating(true);
    try {
      const territoryInfo = TERRITORIES.find((t) => t.code === territory);
      const payload: any = {
        name: name || null,
        postalPrefix: territoryInfo?.prefix || null,
        charge: String(charge),
        minOrderValue: minOrderValue === "" ? null : String(minOrderValue),
        priority,
        isActive,
      };
      const res = await fetch(`${API}/admin/shipping-rules`, {
        method: "POST",
        credentials: "include",
        headers: buildAuthHeaders("application/json"),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error || "Create failed");
        return;
      }
      const created = json?.data || null;
      if (created && created.id) setRules((s) => [created, ...s].slice(0, limit));
      else await fetchRules();
      resetCreateForm();
      alert("Shipping rule created");
    } catch (err) {
      console.error("handleCreate error:", err);
      alert("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete shipping rule?")) return;
    try {
      const res = await fetch(`${API}/admin/shipping-rules/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildAuthHeaders(""),
      });
      if (res.status !== 204 && !res.ok) throw new Error(`Status ${res.status}`);
      setRules((s) => s.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("handleDelete error:", err);
      alert("Delete failed: " + String(err?.message || err));
    }
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editing || !eTerritory || String(eCharge).trim() === "") return alert("Please select a territory and provide charge");
    setSavingEdit(true);
    try {
      const territoryInfo = TERRITORIES.find((t) => t.code === eTerritory);
      const payload: any = {
        name: eName || null,
        postalPrefix: territoryInfo?.prefix || null,
        charge: String(eCharge),
        minOrderValue: eMinOrderValue === "" ? null : String(eMinOrderValue),
        priority: Number(ePriority),
        isActive: Boolean(eIsActive),
      };
      const res = await fetch(`${API}/admin/shipping-rules/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        headers: buildAuthHeaders("application/json"),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error || "Update failed");
        return;
      }
      const updated = json?.data || null;
      if (updated && updated.id) setRules((s) => s.map((r) => (r.id === updated.id ? updated : r)));
      else await fetchRules();
      setEditing(null);
      alert("Saved");
    } catch (err) {
      console.error("handleSaveEdit error:", err);
      alert("Network error");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Admin Shipping Rules</h2>
        <button onClick={() => fetchRules()} className="px-3 py-1 border rounded" disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">Error: {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Create shipping rule</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Name (optional)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div>
              <label className="text-sm block mb-1">Territory</label>
              <select value={territory} onChange={(e) => setTerritory(e.target.value)} className="w-full border rounded p-2">
                <option value="">-- Select Territory --</option>
                {TERRITORIES.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Backend uses postal prefix ({TERRITORIES.map((t) => t.prefix).join(", ")}) for Canada.
              </p>
            </div>

            <div>
              <label className="text-sm block mb-1">Charge (CAD)</label>
              <input value={charge} onChange={(e) => setCharge(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div>
              <label className="text-sm block mb-1">Min order value for free shipping (optional)</label>
              <input value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} className="w-full border rounded p-2" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm block mb-1">Priority</label>
                <input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full border rounded p-2" />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button disabled={creating} type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded">
                {creating ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={resetCreateForm} className="px-3 py-2 border rounded">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Rules list */}
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Shipping Rules</h3>

          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="text-gray-600">No shipping rules</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Territory</th>
                    <th className="p-2">Prefix</th>
                    <th className="p-2">Charge (CAD)</th>
                    <th className="p-2">Min Order</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Active</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">{r.name ?? "-"}</td>
                      <td className="p-2">
                        {TERRITORIES.find((t) => r.postalPrefix?.startsWith(t.prefix))?.name ?? "-"}
                      </td>
                      <td className="p-2">{r.postalPrefix ?? "-"}</td>
                      <td className="p-2">{r.charge ?? "-"}</td>
                      <td className="p-2">{r.minOrderValue ?? "-"}</td>
                      <td className="p-2">{r.priority}</td>
                      <td className="p-2">{r.isActive ? "Yes" : "No"}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)} className="px-2 py-1 border rounded text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="px-2 py-1 border rounded text-sm text-red-600">
                            Delete
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
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Edit shipping rule #{editing.id}</h3>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-gray-100">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Name (optional)</label>
                <input value={eName} onChange={(ev) => seteName(ev.target.value)} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="text-sm block mb-1">Territory</label>
                <select value={eTerritory} onChange={(ev) => seteTerritory(ev.target.value)} className="w-full border rounded p-2">
                  <option value="">-- Select Territory --</option>
                  {TERRITORIES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm block mb-1">Charge (CAD)</label>
                <input value={eCharge} onChange={(ev) => seteCharge(ev.target.value)} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="text-sm block mb-1">Min order value for free shipping (optional)</label>
                <input value={eMinOrderValue} onChange={(ev) => seteMinOrderValue(ev.target.value)} className="w-full border rounded p-2" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm block mb-1">Priority</label>
                  <input type="number" value={ePriority} onChange={(ev) => setePriority(Number(ev.target.value))} className="w-full border rounded p-2" />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={eIsActive} onChange={(ev) => seteIsActive(ev.target.checked)} />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button disabled={savingEdit} type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded">
                  {savingEdit ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 border rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
