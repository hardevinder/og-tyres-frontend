"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

/* ---------- TYPES ---------- */

type Tyre = {
  id: number;
  brand: string;
  model: string;
  size: string;
  width: number;
  profile: number;
  rim: number;
  season: "Summer" | "Winter" | "All-Season";
  price: number;
  mrp?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
};

/* ---------- DEMO DATA ---------- */

const DEMO_TYRES: Tyre[] = [
  {
    id: 1,
    brand: "Michelin",
    model: "Primacy 4+",
    size: "205/55 R16",
    width: 205,
    profile: 55,
    rim: 16,
    season: "Summer",
    price: 7499,
    mrp: 8299,
    rating: 4.6,
    reviews: 312,
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    brand: "Bridgestone",
    model: "Turanza T005",
    size: "195/65 R15",
    width: 195,
    profile: 65,
    rim: 15,
    season: "Summer",
    price: 5899,
    rating: 4.3,
    reviews: 198,
    inStock: true,
  },
  {
    id: 3,
    brand: "MRF",
    model: "ZLX",
    size: "185/65 R15",
    width: 185,
    profile: 65,
    rim: 15,
    season: "All-Season",
    price: 4399,
    rating: 4.1,
    reviews: 411,
    inStock: true,
  },
];

/* ---------- HELPERS ---------- */

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-[#f7c25a] text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "" : "opacity-20"}>
          ★
        </span>
      ))}
      <span className="ml-2 text-xs text-white/60">{rating.toFixed(1)}</span>
    </div>
  );
}

/* ---------- PAGE ---------- */

export default function CataloguePage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return DEMO_TYRES.filter(
      (t) =>
        t.brand.toLowerCase().includes(s) ||
        t.model.toLowerCase().includes(s) ||
        t.size.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-extrabold">
            Tyre <span className="text-[#f7c25a]">Catalogue</span>
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Find the right tyre by brand, size & performance.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* FILTER PANEL */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="font-extrabold text-lg">Search</h2>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Michelin 205/55 R16..."
              className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#f7c25a]"
            />

            <button
              onClick={() => setQ("")}
              className="mt-4 w-full rounded-2xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black hover:brightness-110"
            >
              Reset
            </button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <main className="lg:col-span-9">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur hover:bg-white/10 transition"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-white/60">{t.brand}</p>
                    <h3 className="text-lg font-extrabold">{t.model}</h3>
                    <p className="text-sm text-white/70">{t.size}</p>
                  </div>

                  {t.featured && (
                    <span className="rounded-full bg-[#f7c25a]/15 px-3 py-1 text-xs font-semibold text-[#f7c25a] border border-[#f7c25a]/30">
                      Featured
                    </span>
                  )}
                </div>

                <div className="mt-4 h-28 rounded-2xl bg-white/10 flex items-center justify-center text-white/40">
                  Tyre Image
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Stars rating={t.rating} />
                  <span className="text-xs text-white/60">
                    {t.reviews} reviews
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-[#f7c25a]">
                      {formatINR(t.price)}
                    </p>
                    {t.mrp && (
                      <p className="text-xs text-white/50 line-through">
                        {formatINR(t.mrp)}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      t.inStock
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {t.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/product/${t.id}`}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-center text-sm font-semibold hover:bg-black/60"
                  >
                    View
                  </Link>
                  <button
                    disabled={!t.inStock}
                    className={`rounded-2xl px-4 py-2 text-sm font-extrabold ${
                      t.inStock
                        ? "bg-[#f7c25a] text-black hover:brightness-110"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No tyres found. Try adjusting search.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}