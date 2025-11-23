"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  X,
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

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ✅ Helper: Active route */
  const isActive = useCallback(
    (path: string) => {
      if (!pathname) return false;
      if (path === "/") return pathname === "/";
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname]
  );

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

  /* ✅ Scroll – only change style, don't hide navbar */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 80);
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ✅ Outside Click Close (for user dropdown) */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target))
        setDropdownOpen(false);
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

  /* ✅ Styles – TOP: glass white, SCROLL: solid white + dark text */
  const navStyles = useMemo(
    () => ({
      header: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md border-b border-gray-200"
          : "bg-white/20 backdrop-blur-md border-b border-white/10"
      }`,
      textColor: scrolled ? "#0f172a" : "#ffffff",
      loginBg: "#003636",
    }),
    [scrolled]
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

        {/* ✅ Desktop Menu (only on large screens) */}
        <nav className="hidden lg:flex gap-8 text-base font-semibold items-center">
          {/* Pricing – simple link now */}
          <Link
            href="/services/showcase"
            className="transition"
            style={{
              color: navStyles.textColor,
              borderBottom: isActive("/services/showcase")
                ? `2px solid ${navStyles.textColor}`
                : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            Pricing
          </Link>

          <Link
            href="/features"
            className="transition"
            style={{
              color: navStyles.textColor,
              borderBottom: isActive("/features")
                ? `2px solid ${navStyles.textColor}`
                : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            Features
          </Link>

          <Link
            href="/for-business"
            className="transition"
            style={{
              color: navStyles.textColor,
              borderBottom: isActive("/for-business")
                ? `2px solid ${navStyles.textColor}`
                : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            For Business
          </Link>

          <Link
            href="/blogs"
            className="transition"
            style={{
              color: navStyles.textColor,
              borderBottom: isActive("/blogs")
                ? `2px solid ${navStyles.textColor}`
                : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            Blogs
          </Link>

          <Link
            href="/contact"
            className="transition"
            style={{
              color: navStyles.textColor,
              borderBottom: isActive("/contact")
                ? `2px solid ${navStyles.textColor}`
                : "2px solid transparent",
              paddingBottom: 2,
            }}
          >
            Contact
          </Link>
        </nav>

        {/* ✅ Right Section */}
        <div
          className="flex items-center gap-3 md:gap-4 relative"
          style={{ color: navStyles.textColor }}
        >
          {/* User */}
          <div ref={dropdownRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-white text-sm px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                  style={{ backgroundColor: navStyles.loginBg }}
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
                className="flex items-center gap-2 text-white text-sm px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: navStyles.loginBg }}
              >
                <User className="h-4 w-4" /> Login
              </button>
            )}
          </div>

          {/* ✅ Mobile Menu Toggle (mobile + tablet) */}
          <button
            className="lg:hidden p-1 rounded-full hover:bg-black/5 transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile / Tablet Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 p-4 flex flex-col gap-4 text-lg font-semibold text-orange-800">
          <Link href="/services/showcase" onClick={() => setIsOpen(false)}>
            Pricing
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
