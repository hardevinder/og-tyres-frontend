  "use client";

  import Link from "next/link";

const topPicks = [
  { name: "Compass SpeedEdge", size: "225/45R17", price: 8799, image: "/tyres/tyre-1.jpg", badge: "BEST" },
  { name: "Compass TrailMaster AT", size: "265/65R17", price: 8499, image: "/tyres/tyre-2.jpg", badge: "BEST" },
  { name: "Compass WinterForce W", size: "205/55R16", price: 6299, image: "/tyres/tyre-5.jpg", badge: "WINTER" },
];

  const categories = [
    { title: "All Terrain", desc: "Rugged grip & durability", href: "/products?cat=all-terrain" },
    { title: "All Season", desc: "Everyday comfort & control", href: "/products?cat=all-season" },
    { title: "Winter", desc: "Cold traction & braking", href: "/products?cat=winter" },
    { title: "Performance", desc: "Sport handling & speed", href: "/products?cat=performance" },
  ];

  function GoldPill({ children }: { children: React.ReactNode }) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
        {children}
      </span>
    );
  }

  export default function HomePage() {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        {/* HERO (no navbar here) */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="relative mx-auto max-w-6xl px-4 py-14">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <GoldPill>OG Gold Edition</GoldPill>

                <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
                  Drive with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7c25a] to-[#d79b2b]">
                    confidence
                  </span>
                  .
                </h1>

                <p className="mt-4 max-w-xl text-sm md:text-base text-white/70">
                  Premium tyres & rims for comfort, grip, and performance. Explore our catalogue — backend & inventory coming next.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110"
                  >
                    Browse Tyres
                  </Link>

                  <Link
                    href="/contact"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                  >
                    Get Fitment Help
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Premium Brands</div>
                    <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">10+</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Tyre Sizes</div>
                    <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">50+</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Fast Support</div>
                    <div className="mt-1 text-2xl font-extrabold text-[#f7c25a]">24/7</div>
                  </div>
                </div>
              </div>

              {/* RIGHT PREVIEW CARD */}
              <div className="md:col-span-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold">Top Pick</div>
                      <div className="text-xs text-white/60">Best seller this week</div>
                    </div>
                    <span className="rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                      Limited
                    </span>
                  </div>

                  {/* ✅ White image panel for visibility */}
                  <div className="mt-4 rounded-2xl bg-white border border-white/30 h-64 flex items-center justify-center overflow-hidden">
                    <img src="/tyres/tyre-2.jpg" alt="Top tyre" className="h-full w-full object-contain p-6" />
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-white/60">Compass</div>
                    <div className="text-lg font-extrabold">TrailMaster AT</div>
                    <div className="text-sm text-white/70">265/65R17</div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="rounded-full bg-[#f7c25a] px-3 py-1 text-xs font-extrabold text-black">
                        ₹8,499
                      </div>
                      <Link href="/products" className="text-sm font-semibold text-[#f7c25a] hover:underline">
                        View catalogue →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Free Advice</div>
                    <div className="mt-1 font-extrabold">Fitment Support</div>
                    <div className="mt-2 text-xs text-white/60">We help you pick the right size.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Trusted</div>
                    <div className="mt-1 font-extrabold">Quality First</div>
                    <div className="mt-2 text-xs text-white/60">Premium tyres, better value.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">Shop by Category</h2>
              <p className="mt-1 text-sm text-white/70">Find the right tyre for your road.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#f7c25a] hover:underline">
              Explore all →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="text-xs text-white/60">Category</div>
                <div className="mt-2 text-lg font-extrabold">{c.title}</div>
                <div className="mt-1 text-sm text-white/70">{c.desc}</div>
                <div className="mt-4 inline-flex text-sm font-semibold text-[#f7c25a]">Browse →</div>
              </Link>
            ))}
          </div>
        </section>

        {/* TOP PICKS */}
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">Top Picks</h2>
              <p className="mt-1 text-sm text-white/70">Popular tyres (static demo)</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#f7c25a] hover:underline">
              Shop now →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {topPicks.map((p) => (
              <div key={p.name} className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">{p.badge}</div>
                  <div className="rounded-full bg-[#f7c25a] px-3 py-1 text-xs font-extrabold text-black">
                    ₹{p.price.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* ✅ White image panel */}
                <div className="mt-4 rounded-2xl bg-white border border-white/30 h-56 flex items-center justify-center overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain p-6" />
                </div>

                <div className="mt-4">
                  <div className="text-lg font-extrabold">{p.name}</div>
                  <div className="text-sm text-white/70">{p.size}</div>
                  <div className="mt-4">
                    <Link
                      href="/products"
                      className="inline-flex rounded-2xl bg-[#f7c25a] px-4 py-2 text-sm font-extrabold text-black hover:brightness-110"
                    >
                      View in catalogue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA STRIP (no footer here) */}
        <section className="border-t border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-extrabold">Need help choosing the right tyre size?</h3>
                <p className="mt-2 text-sm text-white/70">
                  Send your vehicle details and we’ll suggest the best option.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/contact"
                  className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110"
                >
                  Contact Us
                </Link>
                <Link
                  href="/products"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }