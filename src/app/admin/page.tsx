"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsAndOrders from "@/components/admin/AdminProductsPanel";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    // ✅ Frontend localhost:3000, Backend localhost:5055
    if (loc.includes("localhost:3000")) return "http://localhost:5055/api";
    return loc.replace(/\/+$/, "") + "/api";
  }

  // ✅ Safe fallback (so API never becomes empty)
  return "http://localhost:5055/api";
}

const API = getApiBase();

const readToken = () =>
  (typeof window !== "undefined" &&
    (localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken"))) ||
  null;

function safeReadUser(): any | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isAdminUser(u: any) {
  const role = String(u?.role || u?.user?.role || "").toUpperCase();
  return role === "ADMIN" || role === "SUPERADMIN" || role === "OWNER";
}

function clearAuth() {
  try {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  } catch {}
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const token = readToken();
    if (!token) {
      router.replace(`/login?redirectTo=/admin`);
      return;
    }

    // ✅ Fast path: trust cached user (from login response)
    const cachedUser = safeReadUser();
    if (cachedUser && isAdminUser(cachedUser)) {
      setIsAdmin(true);
      setUserName(cachedUser?.name || cachedUser?.email || null);
      setLoading(false);
      return;
    }

    // ✅ Verify with backend (/auth/me)
    (async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!mounted) return;

        // If backend doesn't implement /auth/me
        if (res.status === 404) {
          const u2 = safeReadUser();
          if (u2 && isAdminUser(u2)) {
            setIsAdmin(true);
            setUserName(u2?.name || u2?.email || null);
            return;
          }
          clearAuth();
          router.replace(`/login?redirectTo=/admin`);
          return;
        }

        if (!res.ok) {
          clearAuth();
          router.replace(`/login?redirectTo=/admin`);
          return;
        }

        const j = await res.json();
        const u = j?.user || j?.data || j;

        try {
          localStorage.setItem("user", JSON.stringify(u));
        } catch {}

        if (!isAdminUser(u)) {
          router.replace("/");
          return;
        }

        setIsAdmin(true);
        setUserName(u?.name || u?.email || null);
      } catch (err) {
        console.error("Admin auth check failed", err);

        // fallback to cached user if possible
        const u2 = safeReadUser();
        if (u2 && isAdminUser(u2)) {
          setIsAdmin(true);
          setUserName(u2?.name || u2?.email || null);
        } else {
          clearAuth();
          router.replace(`/login?redirectTo=/admin`);
        }
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
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="text-sm text-white/70">Checking authentication…</div>
          <div className="mt-2 h-1.5 w-48 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 bg-[#f7c25a]/70 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ✅ IMPORTANT: removed mt-20 to avoid extra top gap
  return (
    <AdminLayout userName={userName}>
      <ProductsAndOrders apiBase={API} />
    </AdminLayout>
  );
}