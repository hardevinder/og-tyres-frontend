"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#f7c25a]/15 bg-[#050505] text-white">

      {/* GOLD BACKGROUND EFFECT */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(247,194,90,0.12),transparent_30%),radial-gradient(circle_at_right_bottom,rgba(247,194,90,0.08),transparent_30%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* BRAND */}
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#f7c25a] to-[#d79b2b] px-3 py-2 text-black font-extrabold tracking-widest shadow-lg">
              OG
            </div>

            <div>
              <div className="text-sm font-extrabold tracking-wide text-white">
                OG TIRES & RIMS
              </div>
              <div className="text-xs text-[#f7c25a]/80 uppercase tracking-widest">
                Premium Tires Catalogue
              </div>
            </div>
          </Link>

          <p className="text-sm mt-5 leading-7 text-white/60 max-w-sm">
            Discover premium tires and rims designed for durability,
            performance, and comfort. Explore our catalogue and find the
            perfect tire for every road.
          </p>

          <div className="mt-6 rounded-xl border border-[#f7c25a]/20 bg-white/[0.03] px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-[#f7c25a] font-semibold">
              Premium Experience
            </div>
            <div className="text-sm text-white/60 mt-1">
              A luxury tire catalogue experience.
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="text-lg font-bold text-white">Quick Links</h4>

          <div className="w-14 h-[2px] bg-[#f7c25a] mt-3 mb-5" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">

            <div className="space-y-3">

              <Link
                href="/products"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Products
              </Link>

              <Link
                href="/catalogues"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Catalogues
              </Link>

              <Link
                href="/contact"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Contact
              </Link>

            </div>

            <div className="space-y-3">

              <Link
                href="/cart"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Cart
              </Link>

              <Link
                href="/products?category=all-season"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                All Season
              </Link>

              <Link
                href="/products?category=winter"
                className="block text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Winter
              </Link>

            </div>

          </div>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="text-lg font-bold text-white">Support</h4>

          <div className="w-14 h-[2px] bg-[#f7c25a] mt-3 mb-5" />

          <ul className="text-sm space-y-3 text-white/70">

            <li>
              <a
                href="mailto:Ogtiresandrims@gmail.com"
                className="text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                Ogtiresandrims@gmail.com
              </a>
            </li>

            <li>
              <a
                href="tel:+16047123870"
                className="text-[#f7c25a] hover:text-[#ffd978] transition"
              >
                +1 60471 23870
              </a>
            </li>

            <li className="text-white/80 font-semibold">
              Hours: 9 AM – 7 PM
            </li>

            <li className="text-xs text-white/40 max-w-xs">
              Premium tire catalogue interface designed for a luxury browsing
              experience.
            </li>

          </ul>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#f7c25a]/10 py-4 text-center text-sm text-white/50">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#f7c25a] font-semibold">
          OG Tires & Rims
        </span>. All rights reserved.
      </div>

    </footer>
  );
}