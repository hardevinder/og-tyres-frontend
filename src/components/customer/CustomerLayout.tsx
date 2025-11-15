"use client";

import React from "react";
import Link from "next/link";
import { User, Truck, LayoutDashboard } from "lucide-react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[140px] relative z-10">
      {/* 🔸 Header */}
      <header className="bg-white border-b shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-orange-600 hover:text-orange-700 transition"
          >
            Laundry 24
          </Link>
          <p className="text-xs text-gray-500">Welcome to your dashboard</p>
        </div>

        {/* 🔸 Sub Navigation Bar */}
        <div className="border-t border-orange-100 bg-orange-50">
          <nav className="max-w-7xl mx-auto flex flex-wrap gap-4 px-6 py-3 text-sm font-medium text-orange-800">
            <Link
              href="/customer"
              className="flex items-center gap-1 hover:text-orange-600 transition"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link
              href="/customer/orders"
              className="flex items-center gap-1 hover:text-orange-600 transition"
            >
              <Truck className="h-4 w-4" /> My Orders
            </Link>
            <Link
              href="/customer/profile"
              className="flex items-center gap-1 hover:text-orange-600 transition"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* 🔸 Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-10 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          {children}
        </div>
      </main>

      {/* 🔸 Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Laundry 24 — Customer Dashboard
      </footer>
    </div>
  );
}
