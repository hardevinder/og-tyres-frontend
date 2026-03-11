"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000")) return "http://localhost:5055/api";
    return loc.replace(/\/+$/, "") + "/api";
  }

  return "http://localhost:5055/api";
}

const API = getApiBase();

type Category = {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  active?: boolean | number;
};

function normalizeArrayResponse<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.categories)) return json.categories as T[];
  return [];
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const txt = await res.text();
  let data: any = null;

  try {
    data = txt ? JSON.parse(txt) : null;
  } catch {
    data = txt;
  }

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed (${res.status})`
    );
  }

  return data;
}

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

export default function HomePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoadingCategories(true);
    setCategoriesError(null);

    try {
      const json = await apiFetch("/categories");
      const rows = normalizeArrayResponse<Category>(json);

      const activeRows = rows
        .filter((c) => c && c.active !== false && c.active !== 0)
        .slice(0, 3);

      setCategories(activeRows);
    } catch (err: any) {
      console.error("fetchCategories", err);
      setCategoriesError(err?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  function handleViewAllTires(categorySlug?: string) {
    const href = `/products${
      categorySlug ? `?cat=${encodeURIComponent(categorySlug)}` : ""
    }`;

    const token = getToken();

    if (token) {
      router.push(href);
      return;
    }

    router.push(`/login?redirect=${encodeURIComponent(href)}`);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,194,90,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(247,194,90,0.08),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* categories section */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1500px] px-4 py-14 md:px-6 md:py-20">
          <div className="mb-12 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f7c25a]/80">
              Shop by Category
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Explore Tire Categories
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
              Browse categories directly from our live collection and open the
              full category page to view available tires.
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid max-w-[1320px] grid-cols-1 gap-8 mx-auto md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[30px] border border-[#f7c25a]/12 bg-gradient-to-b from-[#111111] to-[#090909] animate-pulse"
                >
                  <div className="h-[320px] bg-white/5" />
                  <div className="space-y-3 p-7">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-8 w-44 rounded bg-white/10" />
                    <div className="h-4 w-full rounded bg-white/10" />
                    <div className="h-4 w-5/6 rounded bg-white/10" />
                    <div className="flex gap-3 pt-2">
                      <div className="h-11 w-36 rounded-2xl bg-white/10" />
                      <div className="h-11 w-32 rounded-2xl bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-100">
              {categoriesError}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/65">
              No categories found.
            </div>
          ) : (
            <div className="grid max-w-[1320px] grid-cols-1 gap-8 mx-auto md:grid-cols-2 xl:grid-cols-3 justify-center">
              {categories.map((category) => {
                const image = category.image_url
                  ? resolveImageUrl(category.image_url)
                  : null;

                return (
                  <section
                    key={category.id}
                    className="group overflow-hidden rounded-[30px] border border-[#f7c25a]/12 bg-gradient-to-b from-[#111111] to-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 hover:border-[#f7c25a]/25"
                  >
                    <div className="relative h-[320px] overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={category.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#f8f8f8] text-sm font-semibold text-black/50">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                      <div className="absolute left-6 top-6 inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a] backdrop-blur">
                        Category
                      </div>
                    </div>

                    <div className="p-7 text-center">
                      <h3 className="text-2xl font-extrabold text-white md:text-3xl">
                        {category.title}
                      </h3>

                      <p className="mt-3 min-h-[72px] text-sm leading-7 text-white/65 md:text-base">
                        {category.description || "Explore this tire category."}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleViewAllTires(category.slug)}
                          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-6 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
                        >
                          View All Tires
                        </button>

                        <Link
                          href="/contact"
                          className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/18 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                        >
                          Ask About This
                        </Link>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* hero */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f7c25a]">
              OG Tires Collection
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
              Find the right{" "}
              <span className="bg-gradient-to-r from-[#f7c25a] via-[#ffd978] to-[#c98a1e] bg-clip-text text-transparent">
                tires
              </span>{" "}
              by category
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Browse tire categories, preview collections, and open the full
              category page to see all available tires.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleViewAllTires()}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#d79b2b] via-[#f7c25a] to-[#c98a1e] px-6 py-3.5 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Browse All Tires
              </button>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#f7c25a]/40 hover:bg-white/[0.08]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* simple final cta */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="rounded-[30px] border border-[#f7c25a]/14 bg-gradient-to-r from-[#121212] via-[#0e0e0e] to-[#101010] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f7c25a]/80">
              Need Help
            </div>

            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              Need help choosing the right tires?
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Contact our team for product guidance, tire sizes, and category
              recommendations.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+11234567890"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-6 py-3.5 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Call +1 60471 23870
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#f7c25a]/40 hover:bg-white/[0.08]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}