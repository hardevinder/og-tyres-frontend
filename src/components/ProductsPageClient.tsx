"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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
  { title: "All", value: "all" },
  { title: "All Terrain", value: "all-terrain" },
  { title: "All Season", value: "all-season" },
  { title: "Winter", value: "winter" },
  { title: "Performance", value: "performance" },
  { title: "Light Truck", value: "light-truck" },
];

/* =========================
   Helpers
========================= */
function catLabel(cat?: string) {
  const found = categories.find((c) => c.value === cat);
  return found?.title || "All";
}

function toId(v: any) {
  const s = String(v ?? "").trim();
  if (s) return s;
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tire-${Math.random().toString(36).slice(2, 10)}`;
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

  if (lower === "og tires" || lower === "og tire") return "OG Tires";
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
  const explicit =
    row?.badge ||
    row?.label ||
    row?.tag ||
    row?.tags?.[0] ||
    row?.specs_json?.badge ||
    row?.category_title ||
    row?.category?.title;

  const candidate = String(explicit || "").trim();
  if (!candidate) return undefined;

  return candidate.toUpperCase().slice(0, 18);
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
  const size = normalizeSize(row) || "—";
  const category = guessCategory(row);
  const badge = guessBadge(row);
  const image = resolveImg(
    row?.image_url ?? row?.image ?? row?.thumbnail_url ?? row?.img
  );

  const priceRaw =
    row?.price ?? row?.sale_price ?? row?.mrp ?? row?.amount ?? 0;
  const hasPrice = Number(priceRaw) > 0;

  return {
    id,
    name,
    brand,
    size,
    category,
    badge,
    image,
    hasPrice,
  };
}

function buildContactHref(p: Product) {
  const params = new URLSearchParams();
  params.set("type", "tire-inquiry");
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

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export default function ProductsPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const catFromUrl = (sp.get("cat") || "").trim();

  const [activeCat, setActiveCat] = useState<string>(catFromUrl || "all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (catFromUrl && catFromUrl !== activeCat) {
      setActiveCat(catFromUrl);
    }
  }, [catFromUrl, activeCat]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const endpoints = [`${API}/tyres`];

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
            break;
          } catch (e) {
            lastError = e;
            console.error("Fetch failed for:", url, e);
          }
        }

        if (!data) {
          throw lastError || new Error("Failed to fetch products");
        }

        const rows = Array.isArray(data)
          ? data
          : data?.data || data?.items || [];
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

    return list;
  }, [activeCat, products]);

  function handleBookNow(p: Product) {
    const bookingHref = buildBookingHref(p);
    const token = getToken();

    if (token) {
      router.push(bookingHref);
      return;
    }

    router.push(`/login?redirect=${encodeURIComponent(bookingHref)}`);
  }

  const pageTitle =
    activeCat === "all" ? "All Tires" : `${catLabel(activeCat)} Tires`;

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f7c25a]">
              Tire Collection
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {pageTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Browse available tires by category and continue with a quote
              request or booking request.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                ← Back to Categories
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Need Help?
              </Link>
            </div>

            {err ? (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                Failed to load tires from backend. Please check API route:
                <span className="ml-1 font-semibold">{API}/tyres</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="h-56 rounded-[18px] bg-white/10" />
                <div className="mt-4 h-6 w-40 rounded bg-white/10" />
                <div className="mt-2 h-4 w-28 rounded bg-white/10" />
                <div className="mt-2 h-4 w-24 rounded bg-white/10" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-11 rounded-xl bg-white/10" />
                  <div className="h-11 rounded-xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
            <h3 className="text-2xl font-extrabold text-white">
              No tires found
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65">
              Try another category.
            </p>
            <button
              onClick={() => setActiveCat("all")}
              className="mt-6 rounded-2xl bg-[#f7c25a] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
            >
              Show All Tires
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const inquiryHref = buildContactHref(p);

              return (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#f7c25a]/25 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                      {p.badge || "TIRE"}
                    </span>

                    <span className="rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f7c25a]">
                      {p.hasPrice ? "Available" : "Price on Request"}
                    </span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[18px] border border-white/10 bg-white">
                    <div className="relative h-56 w-full">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-contain p-5 transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-extrabold text-white">
                      {p.brand ? `${p.brand} ` : ""}
                      {p.name}
                    </h3>

                    <p className="mt-2 text-sm text-white/65">Size: {p.size}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-medium text-white/75">
                        Category: {catLabel(p.category)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        href={inquiryHref}
                        className="inline-flex items-center justify-center rounded-xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                      >
                        Get Quote
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleBookNow(p)}
                        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}