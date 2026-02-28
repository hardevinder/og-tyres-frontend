"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  variant?: string; // e.g. "265/65R17"
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQty: (id: string, variant: string | undefined, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "tyre_cart_v1";

function itemKey(id: string, variant?: string) {
  return `${id}__${variant || ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextType["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const k = itemKey(item.id, item.variant);
      const idx = prev.findIndex((x) => itemKey(x.id, x.variant) === k);

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem: CartContextType["removeItem"] = (id, variant) => {
    const k = itemKey(id, variant);
    setItems((prev) => prev.filter((x) => itemKey(x.id, x.variant) !== k));
  };

  const updateQty: CartContextType["updateQty"] = (id, variant, qty) => {
    const safeQty = Math.max(1, Math.floor(Number(qty || 1)));
    const k = itemKey(id, variant);

    setItems((prev) =>
      prev.map((x) => (itemKey(x.id, x.variant) === k ? { ...x, qty: safeQty } : x))
    );
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, addItem, removeItem, updateQty, clear }),
    [items, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}