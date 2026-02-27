"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Category =
  | "all-terrain"
  | "all-season"
  | "winter"
  | "performance"
  | "touring"
  | "highway";

type Product = {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  size: string;
  price: number;
  rating: number; // 1..5
  badge?: "NEW" | "BEST" | "VALUE";
  image: string; // public path
};

const CATEGORIES: { slug: Category; name: string; desc: string }[] = [
  { slug: "all-terrain", name: "All Terrain", desc: "Rugged grip + tough build" },
  { slug: "all-season", name: "All Season", desc: "Comfort + everyday grip" },
  { slug: "winter", name: "Winter", desc: "Max traction in cold & snow" },
  { slug: "performance", name: "Performance", desc: "Sport handling + control" },
  { slug: "touring", name: "Touring", desc: "Quiet & smooth long drives" },
  { slug: "highway", name: "Highway", desc: "Stable, durable, long life" },
];

// ✅ Using your CURRENT filenames from screenshot: yre-1.jpg ... yre-6.jpg
// If you add yre-7..yre-9 later, just extend.
const PRODUCTS: Product[] = [
  {
    slug: "compass-speededge-225-45r17",
    name: "Compass SpeedEdge",
    brand: "Compass",
    category: "performance",
    size: "225/45R17",
    price: 8799,
    rating: 4.7,
    badge: "BEST",
    image: "/tyres/tyre-1.jpg",
  },
  {
    slug: "compass-trailmaster-at-265-65r17",
    name: "Compass TrailMaster AT",
    brand: "Compass",
    category: "all-terrain",
    size: "265/65R17",
    price: 8499,
    rating: 4.6,
    badge: "BEST",
    image: "/tyres/tyre-2.jpg",
  },
  {
    slug: "compass-trailmaster-atx-275-65r18",
    name: "Compass TrailMaster AT-X",
    brand: "Compass",
    category: "all-terrain",
    size: "275/65R18",
    price: 9399,
    rating: 4.6,
    image: "/tyres/tyre-3.jpg",
  },
  {
    slug: "compass-crosstop-hs-235-60r18",
    name: "Compass CrossTop HS",
    brand: "Compass",
    category: "highway",
    size: "235/60R18",
    price: 7899,
    rating: 4.5,
    image: "/tyres/tyre-4.jpg",
  },
  {
    slug: "compass-winterforce-w-205-55r16",
    name: "Compass WinterForce W",
    brand: "Compass",
    category: "winter",
    size: "205/55R16",
    price: 6299,
    rating: 4.4,
    badge: "BEST",
    image: "/tyres/tyre-5.jpg",
  },
  {
    slug: "compass-comfortdrive-185-60r15",
    name: "Compass ComfortDrive",
    brand: "Compass",
    category: "touring",
    size: "185/60R15",
    price: 3999,
    rating: 4.3,
    badge: "VALUE",
    image: "/tyrestyre-6.jpg",
  },
];

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < full || (i === full && half);
        return (
          <span key={i} className={on ? "text-[#f7c25a]" : "text-white/15"}>
            ★
          </span>
        );
      })}
      <span className="ml-2 text-xs text-white/55">{value.toFixed(1)}</span>
    </div>
  );
}

function Badge({ b }: { b: NonNullable<Product["badge"]> }) {
  const map =
    b === "BEST"
      ? {
          bg: "bg-[#f7c25a]/15",
          tx: "text-[#f7c25a]",
          br: "border-[#f7c25a]/35",
          label: "Best Seller",
        }
      : b === "NEW"
      ? {
          bg: "bg-emerald-500/15",
          tx: "text-emerald-200",
          br: "border-emerald-400/30",
          label: "New",
        }
      : {
          bg: "bg-white/10",
          tx: "text-white/80",
          br: "border-white/15",
          label: "Best Value",
        };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border ${map.bg} ${map.tx} ${map.br}`}
    >
      {map.label}
    </span>
  );
}

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "">("");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc" | "name">(
    "popular"
  );
  const [toast, setToast] = useState<string>("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = PRODUCTS.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.size.toLowerCase().includes(s)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.rating - a.rating; // popular
    });

    return list;
  }, [q, cat, sort]);

  const stats = useMemo(() => {
    const brands = new Set(PRODUCTS.map((p) => p.brand)).size;
    const sizes = new Set(PRODUCTS.map((p) => p.size)).size;
    const avg = PRODUCTS.reduce((s, p) => s + p.rating, 0) / PRODUCTS.length;
    return { brands, sizes, avg: Number.isFinite(avg) ? avg : 0 };
  }, []);

  const featured = useMemo(() => {
    return [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, []);

  const addDemo = (p: Product) => {
    setToast(`Added "${p.name}" (demo)`);
    window.clearTimeout((addDemo as any)._t);
    (addDemo as any)._t = window.setTimeout(() => setToast(""), 1600);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
    
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_25%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(850px_450px_at_85%_15%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-3 py-1 text-xs text-[#f7c25a]">
                <span className="h-2 w-2 rounded-full bg-[#f7c25a]" />
                OG Gold Edition Catalogue
              </div>

              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                Premium tyres for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7c25a] to-[#d79b2b]">
                  grip, comfort & speed
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Temporary static catalogue for launch. Backend + inventory integration later.
              </p>

              {/* controls */}
              <div className="mt-6 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder='Search by size / brand e.g. "205/55R16", "Compass"...'
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
                  />
                </div>

                <select
                  value={cat}
                  onChange={(e) => setCat((e.target.value || "") as any)}
                  className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                >
                  <option value="popular">Sort: Popular</option>
                  <option value="price_asc">Sort: Price (Low)</option>
                  <option value="price_desc">Sort: Price (High)</option>
                  <option value="name">Sort: Name (A–Z)</option>
                </select>
              </div>

              {/* chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setCat("")}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    cat === ""
                      ? "border-[#f7c25a]/35 bg-[#f7c25a]/15 text-[#f7c25a]"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCat(c.slug)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      cat === c.slug
                        ? "border-[#f7c25a]/35 bg-[#f7c25a]/15 text-[#f7c25a]"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                    title={c.desc}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* stats */}
            <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-1 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Brands</div>
                <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">
                  {stats.brands}+
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Sizes</div>
                <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">
                  {stats.sizes}+
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Avg Rating</div>
                <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">
                  {stats.avg.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Top Picks</h2>
            <p className="mt-1 text-sm text-white/70">Best rated tyres (demo)</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.map((p) => (
            <div
              key={p.slug}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-4">
                {/* ✅ WHITE IMAGE PANEL */}
                <div className="h-24 w-24 rounded-2xl bg-white border border-white/30 overflow-hidden flex items-center justify-center">
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2" />
                </div>

                <div className="flex-1">
                  <div className="text-xs text-white/60">
                    {p.brand} • {CATEGORIES.find((c) => c.slug === p.category)?.name}
                  </div>
                  <div className="mt-1 text-lg font-extrabold">{p.name}</div>
                  <div className="mt-1 text-sm text-white/70">{p.size}</div>
                  <div className="mt-2">
                    <Stars value={p.rating} />
                  </div>
                </div>

                <div className="text-right">
                  <div className="rounded-full bg-[#f7c25a] text-black px-3 py-1 text-xs font-extrabold">
                    ₹{p.price.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-2">{p.badge ? <Badge b={p.badge} /> : null}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/product/${p.slug}`}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-center text-sm font-semibold hover:bg-black/30"
                >
                  View
                </Link>
                <button
                  onClick={() => addDemo(p)}
                  className="rounded-2xl bg-[#f7c25a] text-black px-4 py-2 text-sm font-extrabold hover:brightness-110"
                >
                  Add (demo)
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">
            Catalogue{" "}
            <span className="text-white/60 text-sm font-semibold">
              ({filtered.length} items)
            </span>
          </h3>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.slug}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              {/* ✅ WHITE IMAGE PANEL (BIG) */}
              <div className="relative h-56 w-full rounded-2xl bg-white border border-white/30 overflow-hidden flex items-center justify-center">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain p-6" />
                <div className="absolute top-3 left-3">{p.badge ? <Badge b={p.badge} /> : null}</div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/60">{p.brand}</div>
                  <div className="mt-1 text-lg font-extrabold leading-tight">{p.name}</div>
                  <div className="mt-1 text-sm text-white/70">{p.size}</div>
                </div>

                <div className="text-right">
                  <div className="rounded-full bg-[#f7c25a] text-black px-3 py-1 text-xs font-extrabold">
                    ₹{p.price.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-2">
                    <Stars value={p.rating} />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/60">
                Category:{" "}
                <span className="font-semibold text-white/85">
                  {CATEGORIES.find((c) => c.slug === p.category)?.name}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/product/${p.slug}`}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-center text-sm font-semibold hover:bg-black/30"
                >
                  View details
                </Link>
                <button
                  onClick={() => addDemo(p)}
                  className="rounded-2xl bg-[#f7c25a] text-black px-4 py-2 text-sm font-extrabold hover:brightness-110"
                >
                  Add (demo)
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="text-lg font-extrabold">No tyres found</div>
            <div className="mt-2 text-sm text-white/70">
              Try changing category or search keywords.
            </div>
          </div>
        )}
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#f7c25a] text-black px-4 py-2 text-sm font-extrabold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}