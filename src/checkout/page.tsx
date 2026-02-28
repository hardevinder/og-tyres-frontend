"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-6 opacity-80">Cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg border px-4 py-2">
          Browse tyres
        </Link>
      </div>
    );
  }

  const placeOrder = () => {
    alert("Order placed (demo). Next step: connect backend + payment.");
    clear();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/10 p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div className="mt-6 grid gap-4">
          {(["name", "phone", "address", "city", "pincode"] as const).map((k) => (
            <input
              key={k}
              placeholder={k.toUpperCase()}
              value={form[k]}
              onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
              className="h-11 rounded-lg border border-white/10 bg-transparent px-3"
            />
          ))}
        </div>

        <button
          onClick={placeOrder}
          className="mt-6 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 hover:bg-white/15"
        >
          Place Order (Demo)
        </button>
      </div>

      <div className="rounded-xl border border-white/10 p-6 h-fit">
        <div className="text-lg font-semibold">Order Summary</div>

        <div className="mt-4 space-y-2 text-sm">
          {items.map((it) => (
            <div key={`${it.id}-${it.variant || ""}`} className="flex justify-between opacity-90">
              <span>
                {it.name} {it.variant ? `(${it.variant})` : ""} × {it.qty}
              </span>
              <span>₹ {it.price * it.qty}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹ {subtotal}</span>
        </div>
      </div>
    </div>
  );
}