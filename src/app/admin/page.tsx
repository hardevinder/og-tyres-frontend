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
    // Frontend localhost:3000, Backend localhost:5055
    if (loc.includes("localhost:3000")) return "http://localhost:5055/api";
    return loc.replace(/\/+$/, "") + "/api";
  }

  // Safe fallback
  return "http://localhost:5055/api";
}

const API = getApiBase();

function readToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

function safeReadUser(): any | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: any) {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {}
}

function isAdminUser(u: any) {
  const role = String(
    u?.role || u?.user?.role || u?.data?.role || ""
  ).toUpperCase();

  return role === "ADMIN" || role === "SUPERADMIN" || role === "OWNER";
}

function clearAuth() {
  try {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  } catch {}
}

function extractUser(payload: any) {
  return payload?.user || payload?.data?.user || payload?.data || payload || null;
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
      router.replace("/login?redirectTo=/admin");
      return;
    }

    const cachedUser = safeReadUser();

    // Fast path from stored user
    if (cachedUser && isAdminUser(cachedUser)) {
      if (!mounted) return;
      setIsAdmin(true);
      setUserName(cachedUser?.name || cachedUser?.email || null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!mounted) return;

        // Backend does not implement /auth/me
        if (res.status === 404) {
          const fallbackUser = safeReadUser();

          if (fallbackUser && isAdminUser(fallbackUser)) {
            setIsAdmin(true);
            setUserName(fallbackUser?.name || fallbackUser?.email || null);
          } else {
            clearAuth();
            router.replace("/login?redirectTo=/admin");
          }
          return;
        }

        if (!res.ok) {
          clearAuth();
          router.replace("/login?redirectTo=/admin");
          return;
        }

        const json = await res.json();
        const user = extractUser(json);

        if (user) {
          saveUser(user);
        }

        if (!isAdminUser(user)) {
          router.replace("/");
          return;
        }

        setIsAdmin(true);
        setUserName(user?.name || user?.email || null);
      } catch (err) {
        console.error("Admin auth check failed", err);

        const fallbackUser = safeReadUser();

        if (fallbackUser && isAdminUser(fallbackUser)) {
          if (!mounted) return;
          setIsAdmin(true);
          setUserName(fallbackUser?.name || fallbackUser?.email || null);
        } else {
          clearAuth();
          router.replace("/login?redirectTo=/admin");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="text-sm text-white/70">Checking authentication…</div>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-pulse bg-[#f7c25a]/70" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout userName={userName}>
      <ProductsAndOrders apiBase={API} />
    </AdminLayout>
  );
}