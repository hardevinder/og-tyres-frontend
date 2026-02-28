"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ShoppingCart, PhoneCall } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/catalogues", label: "Catalogues" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ✅ ALWAYS DARK — premium scroll effect */
  const headerClass = useMemo(() => {
    return `sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-black/90 backdrop-blur-md border-b border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.7)]"
        : "bg-black border-b border-white/5"
    }`;
  }, [scrolled]);

  return (
    <header className={headerClass}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* ✅ Brand LOGO ONLY */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-[150px] sm:w-[170px]">
            <Image
              src="/brand/og-logo.png"
              alt="OG Tires & Rims"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>
        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#f7c25a]/15 text-[#f7c25a] border border-[#f7c25a]/25"
                    : "text-white/75 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            <ShoppingCart className="h-4 w-4 text-[#f7c25a]" />
            Cart
          </Link>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#f7c25a] px-4 py-2 text-sm font-extrabold text-black hover:brightness-110 transition"
          >
            Browse
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-black shadow-2xl border-l border-white/10">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              {/* ✅ Logo only in drawer header */}
              <div className="relative h-10 w-[160px]">
                <Image
                  src="/brand/og-logo.png"
                  alt="OG Tires & Rims"
                  fill
                  className="object-contain"
                />
              </div>

              <button
                className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition">
                <Search className="h-4 w-4 text-[#f7c25a]" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/40 text-white"
                  placeholder="Search size / brand..."
                />
              </div>

              <div className="mt-4 space-y-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      isActive(l.href)
                        ? "border-[#f7c25a]/25 bg-[#f7c25a]/10 text-[#f7c25a]"
                        : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-[#f7c25a] px-4 py-3 text-center text-sm font-extrabold text-black hover:brightness-110 transition"
                >
                  Browse Products
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
                >
                  <PhoneCall className="h-4 w-4 text-[#f7c25a]" />
                  Contact Support
                </Link>
              </div>

              <div className="mt-5 text-xs text-white/50">
                Tip: Try tyre size{" "}
                <span className="text-white/80 font-semibold">205/55R16</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}