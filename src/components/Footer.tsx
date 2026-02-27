"use client";

import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        
        {/* Left: Brand + About */}
        <div className="flex flex-col items-start text-left">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-[#f7c25a] px-3 py-2 text-black font-extrabold tracking-wide">
              OG
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">
                OG TIRES & RIMS
              </div>
              <div className="text-xs text-white/50">
                Premium Tyres Catalogue
              </div>
            </div>
          </Link>

          <p className="text-sm leading-relaxed mt-4 max-w-sm text-white/60">
            Explore premium tyres by category, brand and size. Browse by
            performance, durability and road conditions. Built for speed,
            safety and style.
          </p>

          {/* Social Icons */}
          <div className="flex items-center space-x-4 mt-5">
            <span className="text-white/60 hover:text-[#f7c25a] transition cursor-pointer">
              <Facebook size={20} />
            </span>
            <span className="text-white/60 hover:text-[#f7c25a] transition cursor-pointer">
              <Instagram size={20} />
            </span>
            <span className="text-white/60 hover:text-[#f7c25a] transition cursor-pointer">
              <MessageCircle size={20} />
            </span>
          </div>
        </div>

        {/* Middle: Quick Links */}
        <div className="text-left">
          <h4 className="text-lg font-semibold mb-4 text-white">
            Quick Links
          </h4>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="space-y-2">
              <Link className="text-white/60 hover:text-[#f7c25a] transition" href="/products">
                Products
              </Link>
              <Link className="text-white/60 hover:text-[#f7c25a] transition" href="/catalogues">
                Catalogues
              </Link>
              <Link className="text-white/60 hover:text-[#f7c25a] transition" href="/contact">
                Contact
              </Link>
            </div>

            <div className="space-y-2">
              <Link className="text-white/60 hover:text-[#f7c25a] transition" href="/cart">
                Cart
              </Link>
              <Link
                className="text-white/60 hover:text-[#f7c25a] transition"
                href="/products?category=all-season"
              >
                All Season
              </Link>
              <Link
                className="text-white/60 hover:text-[#f7c25a] transition"
                href="/products?category=winter"
              >
                Winter
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Contact */}
        <div className="text-left">
          <h4 className="text-lg font-semibold mb-4 text-white">
            Support
          </h4>

          <ul className="text-sm space-y-2 text-white/60">
            <li>
              <a
                href="mailto:support@ogtires.com"
                className="hover:text-[#f7c25a] transition"
              >
                support@ogtires.com
              </a>
            </li>
            <li>
              <a
                href="tel:+910000000000"
                className="hover:text-[#f7c25a] transition"
              >
                +91 00000 00000
              </a>
            </li>
            <li className="font-semibold text-white/80">
              Hours: 9 AM – 7 PM
            </li>
            <li className="text-xs text-white/40">
              Premium demo interface — backend integration coming soon.
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/50">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-white">
          OG Tires & Rims
        </span>. All rights reserved.
      </div>
    </footer>
  );
}