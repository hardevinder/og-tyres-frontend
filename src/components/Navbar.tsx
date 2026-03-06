"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, PhoneCall } from "lucide-react";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

// ✅ Removed +91 from visible number
const PHONE_NUMBER = "60471 23870";
const PHONE_HREF = "tel:+916047123870";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY || 0;

      setScrolled(currentY > 10);

      if (currentY <= 20) {
        setShowHeader(true);
      } else if (currentY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
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

  const headerClass = useMemo(() => {
    return [
      "fixed left-0 right-0 top-0 z-[60] transform transition-all duration-300 ease-out",
      showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
      scrolled
        ? "border-b border-[#f7c25a]/10 bg-black/80 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        : "border-b border-white/5 bg-black/95",
    ].join(" ");
  }, [scrolled, showHeader]);

  return (
    <>
      <header className={headerClass}>
        <div
          className={[
            "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 md:px-6",
            scrolled ? "py-3" : "py-4",
          ].join(" ")}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-[150px] sm:h-11 sm:w-[180px]">
              <Image
                src="/brand/og-logo.png"
                alt="OG Tires & Rims"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-3">
            {navLinks.map((l) => {
              const active = isActive(l.href);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "rounded-2xl border px-5 py-3 text-base font-bold tracking-[0.01em] transition-all duration-300",
                    active
                      ? "border-[#f7c25a]/30 bg-[#f7c25a]/12 text-[#f7c25a] shadow-[0_10px_30px_rgba(247,194,90,0.08)]"
                      : "border-transparent text-white hover:border-[#f7c25a]/15 hover:bg-white/[0.04] hover:text-[#f7c25a]",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#f7c25a]/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#f7c25a]/40 hover:bg-white/[0.07]"
            >
              <PhoneCall className="h-4 w-4 text-[#f7c25a]" />
              <span className="text-white/70">Call:</span>
              <span className="text-[15px] font-extrabold text-white">
                {PHONE_NUMBER}
              </span>
            </a>

            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-5 py-3 text-sm font-extrabold text-black shadow-[0_12px_28px_rgba(247,194,90,0.18)] transition hover:scale-[1.02] hover:brightness-110"
            >
              Browse Products
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={PHONE_HREF}
              className="inline-flex items-center justify-center rounded-xl border border-[#f7c25a]/20 bg-white/[0.04] p-2.5 text-white transition hover:bg-white/[0.08]"
              aria-label="Call OG Tyres"
            >
              <PhoneCall className="h-5 w-5 text-[#f7c25a]" />
            </a>

            <button
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm border-l border-[#f7c25a]/10 bg-[#090909] shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="relative h-10 w-[150px]">
                  <Image
                    src="/brand/og-logo.png"
                    alt="OG Tires & Rims"
                    fill
                    className="object-contain"
                  />
                </div>

                <button
                  className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="px-4 py-5">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition hover:bg-white/10">
                  <Search className="h-4 w-4 text-[#f7c25a]" />
                  <input
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    placeholder="Search tyre size or brand..."
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "block rounded-2xl border px-4 py-3.5 text-base font-bold transition",
                        isActive(l.href)
                          ? "border-[#f7c25a]/30 bg-[#f7c25a]/12 text-[#f7c25a]"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-[#f7c25a]",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-5 grid gap-3">
                  <a
                    href={PHONE_HREF}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f7c25a]/20 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-[#f7c25a]/40 hover:bg-white/[0.08]"
                  >
                    <PhoneCall className="h-4 w-4 text-[#f7c25a]" />
                    {PHONE_NUMBER}
                  </a>

                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] px-4 py-3 text-center text-sm font-extrabold text-black transition hover:brightness-110"
                  >
                    Browse Products
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-[#f7c25a]/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c25a]">
                    Customer Assistance
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Contact us for tyre size guidance, fitment support, product
                    availability, and help choosing the right option for your
                    vehicle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className={scrolled ? "h-[76px]" : "h-[88px]"} />
    </>
  );
}