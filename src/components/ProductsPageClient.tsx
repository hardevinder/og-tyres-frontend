"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

/* =========================
   API base helper
========================= */
function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5055/api";
    }
  }

  return "https://api-ogtire.edubridgeerp.in/api";
}
const API = getApiBase();
const API_ROOT = API.replace(/\/api$/, "");

/* =========================
   Types
========================= */
type ApiTyre = any;

type Product = {
  id: string;
  name: string;
  size: string;
  image: string;
  badge?: string;
  category?: string;
  brand?: string;
  hasPrice?: boolean;
};

const categories = [
  { title: "All Terrain", desc: "Rugged grip & durability", value: "all-terrain" },
  { title: "All Season", desc: "Everyday comfort & control", value: "all-season" },
  { title: "Winter", desc: "Cold traction & braking", value: "winter" },
  { title: "Performance", desc: "Sport handling & speed", value: "performance" },
  { title: "Light Truck", desc: "Heavy-duty load support", value: "light-truck" },
];

/* =========================
   Small UI helpers
========================= */
function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
      {children}
    </span>
  );
}

function catLabel(cat?: string) {
  const found = categories.find((c) => c.value === cat);
  return found?.title || "All";
}

function catDesc(cat?: string) {
  const found = categories.find((c) => c.value === cat);
  return found?.desc || "Browse our premium tire collection.";
}

/* =========================
   Data helpers
========================= */
function toId(v: any) {
  const s = String(v ?? "").trim();
  if (s) return s;
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `tyre-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSize(row: any) {
  const s =
    row?.size ||
    row?.tyre_size ||
    row?.size_text ||
    row?.variant ||
    row?.specs_json?.size ||
    "";
  return String(s || "").trim();
}

function normalizeBrand(row: any) {
  const raw = String(row?.brand ?? row?.make ?? "OG Tires").trim();
  const lower = raw.toLowerCase();

  if (lower === "og tires") return "OG Tires";
  if (lower === "og tire") return "OG Tires";
  return raw;
}

function guessCategory(row: any): Product["category"] {
  const rawSlug = String(
    row?.category_slug ||
      row?.category?.slug ||
      row?.category ||
      row?.tyre_type ||
      row?.type ||
      ""
  )
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const rawTitle = String(
    row?.category_title ||
      row?.category?.title ||
      row?.category_name ||
      row?.badge ||
      row?.tags ||
      ""
  )
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const rawName = String(row?.name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const text = `${rawSlug} ${rawTitle} ${rawName}`;

  if (
    text.includes("light truck") ||
    text.includes("lt265") ||
    text.includes("lt ")
  ) {
    return "light-truck";
  }

  if (
    text.includes("all-terrain") ||
    text.includes("all terrain") ||
    text.includes("a/t") ||
    text.includes("terrain")
  ) {
    return "all-terrain";
  }

  if (
    text.includes("all season") ||
    text.includes("all-season") ||
    text.includes("all seasons") ||
    text.includes("touring")
  ) {
    return "all-season";
  }

  if (
    text.includes("winter") ||
    text.includes("snow") ||
    text.includes("ice") ||
    text.includes("blizzard")
  ) {
    return "winter";
  }

  if (
    text.includes("performance") ||
    text.includes("sport") ||
    text.includes("sportmax") ||
    text.includes("high performance")
  ) {
    return "performance";
  }

  return undefined;
}

function guessBadge(row: any): string | undefined {
  const categoryTitle = String(
    row?.category_title || row?.category?.title || ""
  ).trim();

  const explicit =
    row?.badge ||
    row?.label ||
    row?.tag ||
    row?.tags?.[0] ||
    row?.specs_json?.badge;

  const candidate = String(explicit || "").trim();
  if (candidate) return candidate.toUpperCase().slice(0, 18);

  if (categoryTitle) return categoryTitle.toUpperCase().slice(0, 18);

  return undefined;
}

function resolveImg(url: any) {
  const u = String(url || "").trim();

  if (!u) return "/tires/tyre-1.jpg";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${API_ROOT}${u}`;

  return `${API_ROOT}/${u.replace(/^\/+/, "")}`;
}

function normalizeTyre(row: ApiTyre): Product {
  const id = toId(row?.id ?? row?.uuid ?? row?.slug ?? row?.sku);
  const name = String(row?.name ?? row?.title ?? "Tire").trim();
  const brand = normalizeBrand(row);

  const priceRaw = row?.price ?? row?.sale_price ?? row?.mrp ?? row?.amount ?? 0;
  const hasPrice = Number(priceRaw) > 0;

  const size = normalizeSize(row) || "—";
  const category = guessCategory(row);
  const badge = guessBadge(row);
  const image = resolveImg(
    row?.image_url ?? row?.image ?? row?.thumbnail_url ?? row?.img
  );

  return { id, name, brand, size, category, badge, image, hasPrice };
}

function buildContactHref(p: Product) {
  const params = new URLSearchParams();
  params.set("type", "tyre-inquiry");
  params.set("tyreId", p.id);
  params.set("product", `${p.brand ? `${p.brand} ` : ""}${p.name}`);
  params.set("size", p.size || "");
  params.set("category", p.category || "");
  return `/contact?${params.toString()}`;
}

function buildBookingHref(p: Product) {
  const params = new URLSearchParams();
  params.set("tyreId", p.id);
  params.set("product", `${p.brand ? `${p.brand} ` : ""}${p.name}`);
  params.set("size", p.size || "");
  params.set("category", p.category || "");
  params.set("image", p.image || "");
  params.set("qty", "1");
  return `/book?${params.toString()}`;
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-white">{value}</div>
    </div>
  );
}

export default function ProductsPage() {
  const sp = useSearchParams();
  const catFromUrl = (sp.get("cat") || "").trim();

  const [activeCat, setActiveCat] = useState<string>(catFromUrl || "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "name-asc" | "name-desc">("featured");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (catFromUrl && catFromUrl !== activeCat) setActiveCat(catFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catFromUrl]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const endpoints = [`${API}/tires`, `${API}/products`];

        let data: any = null;
        let lastError: any = null;

        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
            });

            if (!res.ok) {
              const text = await res.text().catch(() => "");
              throw new Error(
                `HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
              );
            }

            data = await res.json();
            console.log("Products API success:", url, data);
            break;
          } catch (e) {
            lastError = e;
            console.error("Fetch failed for:", url, e);
          }
        }

        if (!data) {
          throw lastError || new Error("Failed to fetch products");
        }

        const rows = Array.isArray(data) ? data : data?.data || data?.items || [];
        const list: Product[] = (rows || []).map(normalizeTyre);

        if (!alive) return;
        setProducts(list);
      } catch (e: any) {
        if (!alive) return;
        console.error("Final products load error:", e);
        setErr(e?.message || "Failed to load products");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCat !== "all") {
      list = list.filter((p) => p.category === activeCat);
    }

    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((p) => {
        const hay =
          `${p.name} ${p.size} ${p.brand || ""} ${p.badge || ""} ${p.category || ""}`.toLowerCase();
        return hay.includes(s);
      });
    }

    if (sort === "name-asc") {
      list.sort((a, b) =>
        `${a.brand || ""} ${a.name}`.localeCompare(`${b.brand || ""} ${b.name}`)
      );
    }

    if (sort === "name-desc") {
      list.sort((a, b) =>
        `${b.brand || ""} ${b.name}`.localeCompare(`${a.brand || ""} ${a.name}`)
      );
    }

    return list;
  }, [activeCat, q, sort, products]);

  const activeCategoryLabel = activeCat === "all" ? "All Categories" : catLabel(activeCat);
  const activeCategoryDesc =
    activeCat === "all"
      ? "Browse premium tires across every driving condition and vehicle need."
      : catDesc(activeCat);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_540px_at_15%_15%,rgba(247,194,90,0.20),transparent_60%),radial-gradient(900px_500px_at_82%_18%,rgba(247,194,90,0.12),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#f7c25a]/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[#f7c25a]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <GoldPill>OG Tires Premium Catalogue</GoldPill>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Explore the right{" "}
                <span className="bg-gradient-to-r from-[#f7c25a] via-[#f2d07f] to-[#d79b2b] bg-clip-text text-transparent">
                  tires for your drive
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                Browse premium tire options, compare fitment-friendly sizes, and continue with either a
                quote request or a direct booking request. Designed for a smoother buying journey.
                {loading ? " Loading from live API..." : ""}
              </p>

              {err ? (
                <div className="mt-5 max-w-2xl rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                  <div className="font-extrabold">API Error</div>
                  <div className="mt-1 opacity-90 break-all">
                    {err} — please verify backend, CORS, SSL, or route:
                    <span className="ml-1 font-semibold">{API}/tires</span>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                >
                  Get Expert Help
                </Link>

                <a
                  href="#catalogue"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                >
                  Browse Catalogue
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#f7c25a]">
                      Selected View
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">{activeCategoryLabel}</div>
                    <div className="mt-2 text-sm leading-6 text-white/70">{activeCategoryDesc}</div>
                  </div>

                  <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/10 text-2xl lg:flex">
                    🛞
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <MiniStat label="Products" value={loading ? "..." : String(filtered.length)} />
                  <MiniStat label="Action" value="Quote / Book" />
                  <MiniStat label="Support" value="Fitment Help" />
                  <MiniStat label="Experience" value="Premium UI" />
                </div>
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-md">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-lg">🔎</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by brand, size, category or badge..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Category
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {activeCat === "all" ? "All Tires" : catLabel(activeCat)}
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f7c25a]/10 px-3 py-1 text-xs font-bold text-[#f7c25a]">
                    {loading ? "..." : filtered.length}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Sort</div>
                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as "featured" | "name-asc" | "name-desc")
                    }
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                  >
                    <option className="bg-[#101010]" value="featured">
                      Featured
                    </option>
                    <option className="bg-[#101010]" value="name-asc">
                      Name: A → Z
                    </option>
                    <option className="bg-[#101010]" value="name-desc">
                      Name: Z → A
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCat("all")}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
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
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
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
        </div>
      </section>

      {/* CATALOGUE */}
      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f7c25a]">
              Catalogue
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              Premium Tire Collection
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Select the tire that fits your requirement and continue with a quote request or move
              directly to the booking form.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Need fitment help? →
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-white/10" />
                  <div className="h-6 w-28 rounded-full bg-white/10" />
                </div>
                <div className="mt-5 h-64 rounded-[24px] bg-white/10" />
                <div className="mt-5 h-6 w-40 rounded bg-white/10" />
                <div className="mt-3 h-4 w-28 rounded bg-white/10" />
                <div className="mt-2 h-4 w-24 rounded bg-white/10" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-11 rounded-2xl bg-white/10" />
                  <div className="h-11 rounded-2xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f7c25a]/20 bg-[#f7c25a]/10 text-2xl">
              🔍
            </div>
            <h3 className="mt-5 text-2xl font-black text-white">No products found</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
              Try clearing your filters or search for another tire size, brand, or category.
            </p>
            <button
              onClick={() => {
                setActiveCat("all");
                setQ("");
                setSort("featured");
              }}
              className="mt-6 rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const inquiryHref = buildContactHref(p);
              const bookingHref = buildBookingHref(p);

              return (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#f7c25a]/25 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                      {p.badge || "TYRE"}
                    </div>

                    <div className="rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f7c25a]">
                      {p.hasPrice ? "Available" : "Price on Request"}
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white to-white/95">
                    <div className="relative h-64 w-full">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain p-6 transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-black leading-tight text-white">
                      {p.brand ? `${p.brand} ` : ""}
                      {p.name}
                    </h3>

                    <div className="mt-2 text-sm font-medium text-white/75">{p.size}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-white/80">
                        Category: {catLabel(p.category)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-semibold text-white/80">
                        Booking Ready
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/65">
                      {p.hasPrice
                        ? "Available for direct quote request or booking flow."
                        : "Send an inquiry to receive the latest availability and best pricing."}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        href={inquiryHref}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                      >
                        Get Quote
                      </Link>

                      <Link
                        href={bookingHref}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(247,194,90,0.12),rgba(255,255,255,0.03))] p-8 shadow-xl backdrop-blur">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <GoldPill>Need Assistance?</GoldPill>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white">
                Not sure which tire fits your vehicle?
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                Share your vehicle details with our team and get support for fitment, availability,
                and the right tire recommendation before you place your request.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Talk to Expert
              </Link>

              <a
                href="#catalogue"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                Browse Again
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING CTA */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/75 px-4 py-3 text-sm font-extrabold text-white shadow-2xl backdrop-blur hover:bg-black/85"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7c25a] text-black">
            ✉️
          </span>
          <span>Get Quote</span>
        </Link>

        <a
          href="#catalogue"
          className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/75 px-4 py-3 text-sm font-extrabold text-white shadow-2xl backdrop-blur hover:bg-black/85"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            ↑
          </span>
          <span>Top</span>
        </a>
      </div>
    </main>
  );
}