"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import { addToCartApi } from "@/utils/cart";

type Variant = { id: number | string; name?: string; price?: number; salePrice?: number };

export default function AddToCartClient({ variants }: { variants?: Variant[] }) {
  const safeVariants = Array.isArray(variants) ? variants : [];

  // normalize ids to string to avoid mismatched types between option value and state
  const normalized = useMemo(() => safeVariants.map((v) => ({ ...v, id: String(v.id) })), [safeVariants]);
  const firstId = normalized.length ? normalized[0].id : null;

  const [variantId, setVariantId] = useState<string | null>(firstId);
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // keep variantId in sync when variants change
  useEffect(() => {
    if (!variantId && firstId) setVariantId(firstId);
    // if the current variantId no longer exists, reset to first
    if (variantId && !normalized.find((v) => v.id === variantId)) setVariantId(firstId);
  }, [firstId, normalized, variantId]);

  const selected = useMemo(() => normalized.find((v) => v.id === variantId) ?? null, [normalized, variantId]);

  const priceLabel = useMemo(() => {
    if (!selected) return "--";
    const p = selected.salePrice ?? selected.price;
    return typeof p === "number" ? `₹${p.toFixed(2)}` : "Price on request";
  }, [selected]);

  const changeQty = useCallback((n: number) => setQty((q) => Math.max(1, Math.min(99, q + n))), []);

  async function handleBuyNow() {
    if (!variantId) {
      const toast = document.createElement("div");
      toast.textContent = "Please select a variant";
      toast.className = "fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("animate-slide-out");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      return;
    }
    setLoading(true);
    try {
      await addToCartApi({ variantId: typeof variantId === "string" ? Number(variantId) : variantId, quantity: qty });
      window.dispatchEvent(new CustomEvent("cart:update"));
      const toast = document.createElement("div");
      toast.textContent = "Added — redirecting to cart...";
      toast.className = "fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("animate-slide-out");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      setTimeout(() => (window.location.href = "/cart"), 300);
    } catch (err: any) {
      console.error("buyNow error", err);
      const toast = document.createElement("div");
      toast.textContent = err?.message || "Failed to add and buy";
      toast.className = "fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("animate-slide-out");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  // keyboard support for qty input
  function handleQtyKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      changeQty(1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      changeQty(-1);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="variant-select" className="text-sm font-semibold text-gray-800">Variant</label>
          <select
            id="variant-select"
            value={variantId ?? ""}
            onChange={(e) => setVariantId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 w-full sm:w-48"
            aria-label="Choose product variant"
          >
            {normalized.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name ?? `Variant ${v.id}`} {v.salePrice ? `— ₹${Number(v.salePrice).toFixed(2)}` : v.price ? `— ₹${Number(v.price).toFixed(2)}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="qty-select" className="text-sm font-semibold text-gray-800">Quantity</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
            <button
              type="button"
              onClick={() => changeQty(-1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
            >
              −
            </button>
            <input
              id="qty-select"
              type="number"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
              onKeyDown={handleQtyKey}
              className="w-16 text-center px-3 py-2 border-none outline-none bg-white"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => changeQty(1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="text-sm font-medium text-gray-600">{priceLabel}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AddToCartButton
          variantId={variantId ? (Number.isNaN(Number(variantId)) ? variantId : Number(variantId)) : undefined}
          initialQty={qty}
          className="w-full px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
        />
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg ${loading ? "opacity-60 pointer-events-none" : "bg-amber-500 hover:bg-amber-600"} text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200`}
          aria-disabled={loading}
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}