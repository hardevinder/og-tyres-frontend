"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  badge?: string;
  category?: string; // "all-terrain" | "all-season" | "winter" | "performance"
  brand?: string;
};

const categories = [
  { title: "All Terrain", desc: "Rugged grip & durability", value: "all-terrain", href: "/products?cat=all-terrain" },
  { title: "All Season", desc: "Everyday comfort & control", value: "all-season", href: "/products?cat=all-season" },
  { title: "Winter", desc: "Cold traction & braking", value: "winter", href: "/products?cat=winter" },
  { title: "Performance", desc: "Sport handling & speed", value: "performance", href: "/products?cat=performance" },
];

const products: Product[] = [
  {
    id: "compass-speededge-225-45r17",
    name: "Compass SpeedEdge",
    size: "225/45R17",
    price: 8799,
    image: "/tyres/tyre-1.jpg",
    badge: "BEST",
    category: "performance",
    brand: "Compass",
  },
  {
    id: "compass-trailmaster-at-265-65r17",
    name: "Compass TrailMaster AT",
    size: "265/65R17",
    price: 8499,
    image: "/tyres/tyre-2.jpg",
    badge: "BEST",
    category: "all-terrain",
    brand: "Compass",
  },
  {
    id: "compass-winterforce-w-205-55r16",
    name: "Compass WinterForce W",
    size: "205/55R16",
    price: 6299,
    image: "/tyres/tyre-5.jpg",
    badge: "WINTER",
    category: "winter",
    brand: "Compass",
  },
  {
    id: "compass-cityride-as-195-65r15",
    name: "Compass CityRide AS",
    size: "195/65R15",
    price: 5599,
    image: "/tyres/tyre-3.jpg",
    badge: "VALUE",
    category: "all-season",
    brand: "Compass",
  },
  {
    id: "compass-ridgegrip-at-245-70r16",
    name: "Compass RidgeGrip AT",
    size: "245/70R16",
    price: 7999,
    image: "/tyres/tyre-4.jpg",
    badge: "AT",
    category: "all-terrain",
    brand: "Compass",
  },
  {
    id: "compass-proline-ps-215-55r17",
    name: "Compass ProLine PS",
    size: "215/55R17",
    price: 7399,
    image: "/tyres/tyre-6.jpg",
    badge: "SPORT",
    category: "performance",
    brand: "Compass",
  },
];

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
      {children}
    </span>
  );
}

function formatINR(n: number) {
  try {
    return n.toLocaleString("en-IN");
  } catch {
    return String(n);
  }
}

function catLabel(cat?: string) {
  const found = categories.find((c) => c.value === cat);
  return found?.title || "All";
}

export default function ProductsPage() {
  const sp = useSearchParams();
  const catFromUrl = (sp.get("cat") || "").trim();

  const { addItem, count } = useCart();

  const [activeCat, setActiveCat] = useState<string>(catFromUrl || "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const filtered = useMemo(() => {
    let list = [...products];

    // category filter
    if (activeCat !== "all") {
      list = list.filter((p) => p.category === activeCat);
    }

    // search
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((p) => {
        const hay = `${p.name} ${p.size} ${p.brand || ""} ${p.badge || ""}`.toLowerCase();
        return hay.includes(s);
      });
    }

    // sort
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [activeCat, q, sort]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <GoldPill>OG Gold Catalogue</GoldPill>
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
                Shop{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7c25a] to-[#d79b2b]">
                  Tyres
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-white/80">
                Filter by category, search by size, and add tyres to your cart. (Static demo products)
              </p>
            </div>

            <Link
              href="/cart"
              className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <span>Cart</span>
              <span className="rounded-full bg-[#f7c25a] px-2 py-0.5 text-xs font-extrabold text-black">
                {count}
              </span>
            </Link>
          </div>

          {/* Controls */}
          <div className="mt-8 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-white/80">Search:</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g. 265/65R17, Winter, Compass..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm text-white/80">
                  Category: <span className="font-extrabold text-white">{catLabel(activeCat === "all" ? "" : activeCat)}</span>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                activeCat === "all"
                  ? "border-[#f7c25a]/40 bg-[#f7c25a]/15 text-[#f7c25a]"
                  : "border-white/12 bg-white/5 text-white/90 hover:bg-white/10"
              }`}
            >
              All
            </button>

            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCat(c.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  activeCat === c.value
                    ? "border-[#f7c25a]/40 bg-[#f7c25a]/15 text-[#f7c25a]"
                    : "border-white/12 bg-white/5 text-white/90 hover:bg-white/10"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/80">
            Showing <span className="font-extrabold text-white">{filtered.length}</span> products
          </div>

          <Link href="/contact" className="text-sm font-semibold text-[#f7c25a] hover:underline">
            Need fitment help? →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">{p.badge || "TYRE"}</div>
                <div className="rounded-full bg-[#f7c25a] px-3 py-1 text-xs font-extrabold text-black">
                  ₹{formatINR(p.price)}
                </div>
              </div>

              {/* White image panel */}
              <div className="mt-4 rounded-2xl bg-white border border-white/30 h-56 flex items-center justify-center overflow-hidden">
                <div className="relative h-full w-full">
                  <Image src={p.image} alt={p.name} fill className="object-contain p-6" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg font-extrabold text-white">{p.name}</div>
                <div className="text-sm text-white/80">{p.size}</div>
                <div className="mt-1 text-xs text-white/70">
                  Category: <span className="text-white/90 font-semibold">{catLabel(p.category)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      addItem({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        image: p.image,
                        variant: p.size,
                      })
                    }
                    className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10"
                  >
                    Add to cart
                  </button>

                  <Link
                    href="/cart"
                    className="inline-flex rounded-2xl bg-[#f7c25a] px-4 py-2 text-sm font-extrabold text-black hover:brightness-110"
                  >
                    Buy now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-lg font-extrabold text-white">No products found</div>
            <div className="mt-2 text-sm text-white/80">
              Try clearing filters or searching a different size.
            </div>
            <button
              onClick={() => {
                setActiveCat("all");
                setQ("");
                setSort("featured");
              }}
              className="mt-5 rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}