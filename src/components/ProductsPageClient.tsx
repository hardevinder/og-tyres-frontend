"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

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

type ApiCategory = {
  id: number | string;
  title?: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  active?: boolean | number;
};

type CategoryOption = {
  title: string;
  value: string;
};

type Product = {
  id: string;
  name: string;
  size: string;
  image: string;
  badge?: string;
  category?: string;
  brand?: string;
  hasPrice?: boolean;
  price?: number;
};

type CartItem = {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  image?: string;
  category?: string;
  price?: number;
  qty: number;
  variant?: string;
};

/* =========================
   Helpers
========================= */
function normalizeSlug(v: any) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function catLabel(cat: string | undefined, categories: CategoryOption[]) {
  if (!cat) return "All";
  const found = categories.find((c) => c.value === cat);
  return found?.title || cat;
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
  const rawSlug = normalizeSlug(
    row?.category_slug ||
      row?.category?.slug ||
      row?.category ||
      row?.tyre_type ||
      row?.type ||
      ""
  );

  if (rawSlug) return rawSlug;

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

  const text = `${rawTitle} ${rawName}`;

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
  const price = Number(priceRaw) > 0 ? Number(priceRaw) : 0;
  const hasPrice = price > 0;

  return {
    id,
    name,
    brand,
    size,
    category,
    badge,
    image,
    hasPrice,
    price,
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

function formatPrice(n: number) {
  try {
    return n.toLocaleString("en-IN");
  } catch {
    return String(n);
  }
}

function FloatingCartButton({
  cartCount,
  subtotal,
}: {
  cartCount: number;
  subtotal: number;
}) {
  if (cartCount <= 0) return null;

  return (
    <Link
      href="/cart"
      className="group fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[330px] sm:bottom-5 sm:right-5 sm:w-auto"
      aria-label="Open cart"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#f7c25a]/30 bg-black/85 px-4 py-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#f7c25a]/55 group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-3xl sm:px-5 sm:py-3.5">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(247,194,90,0.16),transparent_35%,transparent_100%)] opacity-80" />

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f7c25a]/25 bg-[#f7c25a]/12">
            <ShoppingCart className="h-5 w-5 text-[#f7c25a]" />
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#f7c25a] px-1.5 py-0.5 text-[10px] font-black text-black shadow-lg">
              {cartCount}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
              Your Cart
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="truncate text-sm font-black text-white sm:text-base">
                {subtotal > 0
                  ? `₹ ${formatPrice(subtotal)}`
                  : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                {cartCount} item{cartCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition group-hover:bg-white/10 group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const catFromUrl = normalizeSlug((sp.get("cat") || "").trim());

  const { items, subtotal, addItem } = useCart() as {
    items: CartItem[];
    subtotal: number;
    addItem: (item: CartItem) => void;
  };

  const [activeCat, setActiveCat] = useState<string>(catFromUrl || "all");
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([
    { title: "All", value: "all" },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (catFromUrl && catFromUrl !== activeCat) {
      setActiveCat(catFromUrl);
    }
  }, [catFromUrl, activeCat]);

  useEffect(() => {
    let alive = true;

    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const res = await fetch(`${API}/categories`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const rows = Array.isArray(data)
          ? data
          : data?.data || data?.items || [];

        const dynamicCategories: CategoryOption[] = rows
          .filter((row: ApiCategory) => {
            const active = row?.active;
            return active === undefined || active === true || active === 1;
          })
          .map((row: ApiCategory) => {
            const value = normalizeSlug(row?.slug || row?.title || "");
            const title = String(row?.title || row?.slug || "").trim();
            return {
              title: title || "Category",
              value,
            };
          })
          .filter((cat: CategoryOption) => cat.value);

        const unique = Array.from(
          new Map(
            [{ title: "All", value: "all" }, ...dynamicCategories].map((c) => [
              c.value,
              c,
            ])
          ).values()
        );

        if (!alive) return;
        setCategories(unique);
      } catch (e) {
        console.error("Categories load error:", e);
        if (!alive) return;
        setCategories([{ title: "All", value: "all" }]);
      } finally {
        if (!alive) return;
        setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadProducts() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${API}/tyres`, {
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

        const data = await res.json();

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

    loadProducts();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (activeCat === "all") return;

    const exists = categories.some((c) => c.value === activeCat);
    if (!exists) {
      setActiveCat("all");
    }
  }, [activeCat, categories]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCat !== "all") {
      list = list.filter((p) => normalizeSlug(p.category) === activeCat);
    }

    return list;
  }, [activeCat, products]);

  const cartCount = useMemo(() => {
    return (items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }, [items]);

  const cartSubtotal = useMemo(() => {
    const computed = (items || []).reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);
      return sum + price * qty;
    }, 0);

    return computed > 0 ? computed : Number(subtotal || 0);
  }, [items, subtotal]);

  function handleBookNow(p: Product) {
    const bookingHref = buildBookingHref(p);
    const token = getToken();

    if (token) {
      router.push(bookingHref);
      return;
    }

    router.push(`/login?redirect=${encodeURIComponent(bookingHref)}`);
  }

  function handleAddToCart(p: Product) {
    addItem({
      id: p.id,
      name: p.name,
      brand: p.brand,
      size: p.size,
      image: p.image,
      category: p.category,
      price: p.price || 0,
      qty: 1,
      variant: p.size || "",
    });

    setToast(`${p.brand ? `${p.brand} ` : ""}${p.name} added to cart`);
  }

  const pageTitle =
    activeCat === "all"
      ? "All Tires"
      : `${catLabel(activeCat, categories)} Tires`;

  return (
    <main className="min-h-screen bg-[#070707] pb-28 text-white sm:pb-24">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-green-400/30 bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-200 shadow-lg backdrop-blur">
          {toast}
        </div>
      ) : null}

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
              Browse available tires by category and continue with a quote,
              booking, or add items to cart.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                ← Back to Categories
              </Link>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-5 py-3 text-sm font-extrabold text-[#f7c25a] transition hover:bg-[#f7c25a]/15"
              >
                Cart ({cartCount})
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

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6 md:pb-20">
        <div className="mb-8 flex flex-wrap gap-3">
          {categoriesLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-28 rounded-full border border-white/10 bg-white/[0.04]"
                />
              ))
            : categories.map((cat) => {
                const active = activeCat === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCat(cat.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "border-[#f7c25a]/40 bg-[#f7c25a] text-black"
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {cat.title}
                  </button>
                );
              })}
        </div>

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
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <div className="h-11 rounded-xl bg-white/10" />
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

                    {p.hasPrice ? (
                      <p className="mt-2 text-sm font-bold text-[#f7c25a]">
                        ₹ {formatPrice(Number(p.price || 0))}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-white/50">
                        Price on request
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-medium text-white/75">
                        Category: {catLabel(p.category, categories)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="inline-flex items-center justify-center rounded-xl bg-[#f7c25a] px-4 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                      >
                        Add to Cart
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={inquiryHref}
                          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/10"
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      <FloatingCartButton cartCount={cartCount} subtotal={cartSubtotal} />
    </main>
  );
}