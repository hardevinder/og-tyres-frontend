"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsAndOrders from "@/components/admin/AdminProductsPanel";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:5000"))
      return loc.replace(":3000", ":5000") + "/api";
    return loc + "/api";
  }
  return "";
}

const API = getApiBase();

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // ✅ Helper to read token
  const readToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    null;

  useEffect(() => {
    let mounted = true;
    const token = readToken();
    if (!token) {
      router.replace(`/login?redirectTo=/admin`);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        if (!res.ok) {
          // Not authorized
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          router.replace(`/login?redirectTo=/admin`);
          return;
        }
        const j = await res.json();
        const u = j?.user || j;
        if (!u?.isAdmin) {
          router.replace("/");
          return;
        }
        setIsAdmin(true);
        setUserName(u?.name || null);
      } catch (err) {
        console.error("Admin auth check failed", err);
        router.replace(`/login?redirectTo=/admin`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // router will have redirected
  }

  return (
    <div className="mt-20"> {/* ✅ adds space below fixed navbar */}
      <AdminLayout userName={userName}>
        <ProductsAndOrders apiBase={API} />
      </AdminLayout>
    </div>
  );
}
