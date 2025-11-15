"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  Settings,
  Mail,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: Truck },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/shipping-rules", label: "Shipping Rules", icon: Settings },
    { href: "/admin/inquiries", label: "Inquiries", icon: Mail }, // ✅ New Inquiries Link
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🔸 Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <Link
              href="/admin"
              className="text-2xl font-bold tracking-wide text-orange-600 hover:text-orange-700 transition"
            >
              Laundry 24
            </Link>
            <p className="text-xs text-gray-500">
              Manage your store operations easily
            </p>
          </div>

          {/* optional admin info placeholder */}
          <div className="text-sm text-gray-600 hidden sm:block">
            Admin Panel
          </div>
        </div>

        {/* 🔸 Sub Navigation */}
        <div className="border-t border-orange-100 bg-orange-50 overflow-x-auto">
          <nav className="max-w-7xl mx-auto flex flex-nowrap sm:flex-wrap gap-4 px-6 py-3 text-sm font-medium text-orange-800">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
                    isActive
                      ? "bg-orange-100 text-orange-700 font-semibold"
                      : "hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 🔸 Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          {children}
        </div>
      </main>

      {/* 🔸 Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Laundry 24 — Admin Dashboard
      </footer>
    </div>
  );
}
