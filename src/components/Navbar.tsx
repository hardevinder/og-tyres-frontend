"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { getCartApi } from "@/utils/cart";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000"))
      return loc.replace(":3000", ":5000") + "/api";
    return loc + "/api";
  }
  return "";
}
const API = getApiBase();

interface UserInfo {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  category?: {
    id: number;
    name: string;
    slug?: string;
  };
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaOpen, setMegaOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const megaRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  /* ✅ Fetch Products */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/products?limit=1000`);
      const json = await res.json();
      setProducts(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    products.forEach((p) => {
      const catName = p.category?.name || "Other";
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(p);
    });
    return grouped;
  }, [products]);

  /* ✅ Auth Handling */
  const readToken = useCallback(() => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  }, []);

  const fetchUser = useCallback(async () => {
    const token = readToken();
    if (!token) return setUser(null);
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("unauthorized");
      const json = await res.json();
      setUser(json.user || json);
    } catch {
      setUser(null);
    }
  }, [readToken]);

  useEffect(() => {
    fetchUser();
    const handleAuthChange = () => fetchUser();
    window.addEventListener("auth", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [fetchUser]);

  const handleLogout = useCallback(
    async () => {
      const token = readToken();
      if (token) {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      setUser(null);
      window.dispatchEvent(new Event("auth"));
      router.push("/login");
    },
    [router, readToken]
  );

  /* ✅ Scroll Visibility */
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setVisible(y < lastY.current || y < 40);
          setScrolled(y > 80);
          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ✅ Outside Click Close */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target))
        setDropdownOpen(false);
      if (megaRef.current && !megaRef.current.contains(target))
        setMegaOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ✅ Cart Count */
  useEffect(() => {
    async function loadCart() {
      try {
        const res = await getCartApi().catch(() => null);
        if (res?.data?.items) {
          const count = res.data.items.reduce(
            (s: number, it: any) => s + (it.quantity || 0),
            0
          );
          setCartCount(count);
        }
      } catch (err) {
        console.error("Cart load failed", err);
      }
    }

    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  /* ✅ Styles */
  const navStyles = useMemo(
    () => ({
      header: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "bg-white/95 shadow-md border-b border-orange-100 backdrop-blur-md"
          : "bg-transparent"
      }`,
      textColor: scrolled ? "#7c2d12" : "#ffffff",
      activeColor: scrolled ? "#EA580C" : "#FACC15",
    }),
    [visible, scrolled]
  );

  return (
    <header className={navStyles.header}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
        {/* ✅ Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Laundry Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* ✅ Desktop Menu */}
        <nav
          className="hidden md:flex gap-8 text-base font-semibold items-center"
          style={{ color: navStyles.textColor }}
        >
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
            ref={megaRef}
          >
            <Link
              href="/services/showcase"
              className="flex items-center gap-1 hover:text-orange-400 transition"
              style={{ color: navStyles.activeColor }}
            >
              Services <ChevronDown className="h-4 w-4" />
            </Link>
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 w-[92vw] max-w-[1300px] bg-white text-gray-800 rounded-2xl shadow-2xl px-10 py-8 transition-all duration-300 ${
                isMegaOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-3"
              }`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-gray-200">
                {Object.entries(productsByCategory).map(([category, items]) => (
                  <div key={category} className="px-4">
                    <h3 className="text-lg font-semibold text-orange-700 mb-2 border-b border-orange-200 pb-1">
                      {category}
                    </h3>
                    {items.slice(0, 6).map((p) => (
                      <Link
                        key={p.id}
                        href={`/services/showcase?category=${encodeURIComponent(
                          p.category?.slug ||
                            p.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
                            ""
                        )}`}
                        className="block hover:text-orange-600 text-sm truncate"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/features" className="hover:text-orange-400 transition">
            Features
          </Link>
          <Link href="/for-business" className="hover:text-orange-400 transition">
            For Business
          </Link>
          <Link href="/blogs" className="hover:text-orange-400 transition">
            Blogs
          </Link>
          <Link href="/contact" className="hover:text-orange-400 transition">
            Contact
          </Link>
        </nav>

        {/* ✅ Right Section */}
        <div
          className="flex items-center gap-3 md:gap-4 relative"
          style={{ color: navStyles.textColor }}
        >
          {/* Cart (currently disabled)
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
                {cartCount}
              </span>
            )}
          </Link> */}

          {/* User */}
          <div ref={dropdownRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-1.5 rounded-full transition-all"
                >
                  <User className="h-4 w-4" /> {user.name.split(" ")[0]}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-700 rounded-lg shadow-xl w-52 py-2 z-50">
                    {/* ✅ Profile */}
                    <Link
                      href="/customer/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-orange-600" />
                      <span>My Profile</span>
                    </Link>

                    {/* ✅ Orders */}
                    <Link
                      href="/customer/orders"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                      <span>My Orders</span>
                    </Link>

                    {/* ✅ Dashboard (Admin / Customer) */}
                    <Link
                      href={user.isAdmin ? "/admin" : "/customer"}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-orange-600" />
                      <span>Dashboard</span>
                    </Link>

                    {/* ✅ Logout */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 hover:bg-orange-50 transition text-left"
                    >
                      <LogOut className="h-4 w-4 text-orange-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-1.5 rounded-full transition-all"
              >
                <User className="h-4 w-4" /> Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1 rounded-full hover:bg-orange-50/20 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 flex flex-col gap-4 text-lg font-semibold text-orange-800">
          <Link href="/services/showcase" onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link href="/features" onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link href="/for-business" onClick={() => setIsOpen(false)}>
            For Business
          </Link>
          <Link href="/blogs" onClick={() => setIsOpen(false)}>
            Blogs
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
