"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const topPicks = [
  {
    name: "Compass SpeedEdge",
    size: "225/45R17",
    image: "/tires/tyre-1.jpg",
    badge: "BEST SELLER",
  },
  {
    name: "Compass TrailMaster AT",
    size: "265/65R17",
    image: "/tires/tyre-2.jpg",
    badge: "TOP PICK",
  },
  {
    name: "Compass WinterForce W",
    size: "205/55R16",
    image: "/tires/tyre-5.jpg",
    badge: "WINTER READY",
  },
];

const categories = [
  {
    title: "All Terrain",
    desc: "Built for durability, traction, and dependable performance across demanding roads and rugged terrain.",
    href: "/products?cat=all-terrain",
  },
  {
    title: "All Season",
    desc: "A versatile choice offering balanced comfort, grip, and control for everyday driving conditions.",
    href: "/products?cat=all-season",
  },
  {
    title: "Winter",
    desc: "Engineered for colder conditions with enhanced traction, braking confidence, and road stability.",
    href: "/products?cat=winter",
  },
  {
    title: "Performance",
    desc: "Designed for sharper handling, responsive steering, and a refined high-performance driving feel.",
    href: "/products?cat=performance",
  },
];

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f7c25a] shadow-[0_0_20px_rgba(247,194,90,0.08)]">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  actionHref,
  actionText,
}: {
  eyebrow?: string;
  title: string;
  desc: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#f7c25a]/80">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/65 md:text-[15px]">
          {desc}
        </p>
      </div>

      {actionHref && actionText ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#f7c25a] transition hover:text-[#ffd978]"
        >
          {actionText}
          <span>→</span>
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* GLOBAL BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,194,90,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(215,155,43,0.10),transparent_28%),radial-gradient(circle_at_bottom_center,rgba(247,194,90,0.08),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      {/* HERO */}
      <section className="relative isolate border-b border-[#f7c25a]/10">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(800px_400px_at_12%_18%,rgba(247,194,90,0.16),transparent_60%),radial-gradient(700px_360px_at_82%_12%,rgba(247,194,90,0.10),transparent_60%)]" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* LEFT */}
            <div className="relative z-30 lg:col-span-7">
              <GoldPill>OG Tires Premium Collection</GoldPill>

              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.05]">
                Premium tires and rims crafted for{" "}
                <span className="bg-gradient-to-r from-[#f7c25a] via-[#ffd978] to-[#c98a1e] bg-clip-text text-transparent">
                  confident performance
                </span>
                .
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                Welcome to OG Tires & Rims — a premium destination for drivers
                who value quality, safety, and refined road presence. Our
                catalogue is curated to help you discover the right balance of
                comfort, grip, durability, and style for every journey.
              </p>

              <div className="relative z-40 mt-8 flex flex-wrap gap-3">
           <button
              type="button"
              onClick={() => router.push("/products")}
              className="relative z-50 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#d79b2b] via-[#f7c25a] to-[#c98a1e] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(247,194,90,0.35)] ring-1 ring-[#f7c25a]/40 transition hover:scale-[1.02] hover:brightness-110"
            >
              Browse Collection
            </button>

                <Link
                  href="/contact"
                  className="relative z-50 inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#f7c25a]/40 hover:bg-white/[0.07]"
                >
                  Get Expert Guidance
                </Link>
              </div>

              {/* TRUST / STATS */}
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-[#f7c25a]/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    Premium Range
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-[#f7c25a]">
                    10+
                  </div>
                  <div className="mt-2 text-sm text-white/58">
                    Curated options from trusted tire categories.
                  </div>
                </div>

                <div className="rounded-3xl border border-[#f7c25a]/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    Fitment Choices
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-[#f7c25a]">
                    50+
                  </div>
                  <div className="mt-2 text-sm text-white/58">
                    Multiple sizes to suit a wide range of vehicles.
                  </div>
                </div>

                <div className="rounded-3xl border border-[#f7c25a]/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    Trusted Guidance
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-[#f7c25a]">
                    Expert
                  </div>
                  <div className="mt-2 text-sm text-white/58">
                    Reliable recommendations for better buying decisions.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SHOWCASE */}
            <div className="relative z-20 lg:col-span-5">
              <div className="relative overflow-hidden rounded-[30px] border border-[#f7c25a]/14 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,194,90,0.14),transparent_45%)]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                      Featured Product
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-white">
                      TrailMaster AT
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      265/65R17
                    </div>
                  </div>

                  <span className="rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7c25a]">
                    Featured
                  </span>
                </div>

                <div className="relative mt-6 overflow-hidden rounded-[26px] border border-[#f7c25a]/14 bg-white">
                  <div className="flex h-72 items-center justify-center p-6 md:h-80">
                    <img
                      src="/tires/tyre-2.jpg"
                      alt="Top tyre"
                      className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.22)]"
                    />
                  </div>
                </div>

                <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                      Ride Quality
                    </div>
                    <div className="mt-2 text-base font-bold text-white">
                      Smooth & Stable
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/58">
                      Designed to deliver confident handling with a refined road
                      feel.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                      Road Confidence
                    </div>
                    <div className="mt-2 text-base font-bold text-white">
                      Strong & Reliable
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/58">
                      A dependable option for drivers who value grip and
                      durability.
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 flex justify-end">
                  <Link
                    href="/products"
                    className="text-sm font-semibold text-[#f7c25a] transition hover:text-[#ffd978]"
                  >
                    Explore Catalogue →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Explore Range"
          title="Shop by Category"
          desc="Browse a refined tire collection designed for daily comfort, dependable mileage, rugged road conditions, and performance-focused driving."
          actionHref="/products"
          actionText="Explore all categories"
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group relative overflow-hidden rounded-[28px] border border-[#f7c25a]/12 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#f7c25a]/28 hover:shadow-[0_20px_40px_rgba(0,0,0,0.32)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,194,90,0.12),transparent_35%)] opacity-0 transition duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a]/80">
                  Category
                </div>
                <div className="mt-3 text-xl font-extrabold text-white">
                  {c.title}
                </div>
                <div className="mt-3 text-sm leading-7 text-white/65">
                  {c.desc}
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f7c25a] transition group-hover:text-[#ffd978]">
                  Browse Category <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="border-y border-[#f7c25a]/10 bg-gradient-to-b from-[#0a0a0a] to-[#080808]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeading
            eyebrow="Why OG tires"
            title="Built for trust, quality, and a premium buying experience"
            desc="Every section of our catalogue is designed to help customers explore with confidence, compare with clarity, and choose products that suit their driving needs."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#f7c25a]/12 bg-white/[0.04] p-6">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                Premium Presentation
              </div>
              <p className="mt-4 text-sm leading-7 text-white/65">
                A clean and elevated catalogue experience that reflects the
                quality of the products you offer.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#f7c25a]/12 bg-white/[0.04] p-6">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                Better Product Discovery
              </div>
              <p className="mt-4 text-sm leading-7 text-white/65">
                Customers can browse by category and quickly narrow down the
                options that best match their vehicle and use case.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#f7c25a]/12 bg-white/[0.04] p-6">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                Professional Brand Image
              </div>
              <p className="mt-4 text-sm leading-7 text-white/65">
                A luxury dark-and-gold identity gives OG Tires & Rims a stronger,
                more premium, and more memorable digital presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP PICKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Featured Selection"
          title="Top Picks"
          desc="Explore highlighted products chosen for their road presence, performance appeal, and dependable fitment across a range of driving styles."
          actionHref="/products"
          actionText="Shop all products"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {topPicks.map((p) => (
            <div
              key={p.name}
              className="group overflow-hidden rounded-[30px] border border-[#f7c25a]/12 bg-gradient-to-b from-[#111111] to-[#090909] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-[#f7c25a]/25"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                  {p.badge}
                </div>

                <div className="rounded-full border border-[#f7c25a]/25 bg-[#f7c25a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f7c25a]">
                  Enquiry
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-[#f7c25a]/14 bg-white">
                <div className="flex h-60 items-center justify-center p-6">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.04]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xl font-extrabold text-white">
                  {p.name}
                </div>
                <div className="mt-1 text-sm text-white/62">{p.size}</div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-4 py-2.5 text-sm font-extrabold text-black shadow-[0_10px_24px_rgba(247,194,90,0.20)] transition hover:brightness-110"
                  >
                    View Catalogue
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/18 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                  >
                    Request Best Price
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#f7c25a]/10 bg-[linear-gradient(180deg,rgba(247,194,90,0.04),rgba(0,0,0,0))]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="relative overflow-hidden rounded-[34px] border border-[#f7c25a]/14 bg-gradient-to-r from-[#121212] via-[#0d0d0d] to-[#101010] p-8 shadow-[0_22px_60px_rgba(0,0,0,0.38)] md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(247,194,90,0.16),transparent_32%)]" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f7c25a]/80">
                  Need Assistance
                </div>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                  Looking for the right tire for your vehicle?
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/65 md:text-base">
                  Share your vehicle details with our team and receive guidance
                  on fitment, category selection, and the most suitable option
                  for your driving needs.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-6 py-3.5 text-sm font-extrabold text-black shadow-[0_12px_28px_rgba(247,194,90,0.22)] transition hover:brightness-110"
                >
                  Contact Us
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#f7c25a]/18 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}