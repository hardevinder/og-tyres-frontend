"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Truck, Layers, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Bookings", icon: Truck },
    { href: "/admin/categories", label: "Categories", icon: Layers },
  ];

  function isNavActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");

      window.dispatchEvent(new Event("auth"));

      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(1000px_550px_at_14%_18%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_520px_at_84%_16%,rgba(247,194,90,0.10),transparent_58%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[#f7c25a]/15 bg-black/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Logo */}
              <Link href="/admin" className="inline-flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f7c25a]/35 bg-[linear-gradient(180deg,rgba(247,194,90,0.18),rgba(247,194,90,0.08))] text-sm font-extrabold text-[#f7c25a] shadow-[0_10px_30px_rgba(247,194,90,0.16)]">
                  OG
                </span>

                <span className="leading-tight">
                  <div className="bg-gradient-to-r from-[#f7c25a] via-[#f3d27d] to-[#d79b2b] bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
                    OG Tires & Rims
                  </div>
                  <div className="mt-0.5 text-xs font-medium tracking-wide text-[#f7c25a]/80">
                    Admin panel — manage catalogue & bookings
                  </div>
                </span>
              </Link>

              {/* Right Side */}
              <div className="flex items-center gap-3">

                {/* User */}
                <div className="rounded-full border border-[#f7c25a]/15 bg-[#f7c25a]/[0.06] px-3 py-1.5 text-sm font-medium text-[#f7c25a]/85">
                  {userName ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#f7c25a]" />
                      {userName}
                    </span>
                  ) : (
                    "Admin Panel"
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-4 py-2 text-sm font-bold text-[#f7c25a] transition-all hover:border-[#f7c25a] hover:bg-[#f7c25a]/20 hover:shadow-[0_0_18px_rgba(247,194,90,0.35)]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>

              </div>
            </div>

            {/* Navigation */}
            <div className="overflow-x-auto border-t border-[#f7c25a]/10 bg-[linear-gradient(180deg,rgba(247,194,90,0.06),rgba(247,194,90,0.03))]">
              <nav className="mx-auto flex max-w-7xl flex-nowrap gap-2 px-4 py-3 sm:gap-3 sm:px-6">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = isNavActive(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "group inline-flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all duration-200",
                        active
                          ? "border-[#f7c25a]/35 bg-[linear-gradient(180deg,rgba(247,194,90,0.18),rgba(247,194,90,0.10))] text-[#f7c25a]"
                          : "border-[#f7c25a]/18 bg-[linear-gradient(180deg,rgba(247,194,90,0.09),rgba(247,194,90,0.05))] text-[#f7c25a]",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          {/* Main */}
          <main className="w-full flex-1 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-[30px] border border-[#f7c25a]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.04))] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6">
                <div className="rounded-[24px] border border-[#f7c25a]/8 bg-black/15 p-1">
                  {children}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#f7c25a]/10 bg-black/50 py-4 text-center text-xs font-medium tracking-wide text-[#f7c25a]/65">
            © {new Date().getFullYear()} OG Tires & Rims — Admin Bookings Dashboard
          </footer>
        </div>
      </div>
    </div>
  );
}