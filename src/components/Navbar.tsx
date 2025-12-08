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
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Home,
  Sparkles,
  PhoneCall,
  Newspaper,
  BadgePercent,
  ChevronRight,
} from "lucide-react";

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

// 🎨 Brand colors (using your orange)
const BRAND_ORANGE = "#FFA726"; // main orange
const BRAND_ORANGE_DARK = "#FB8C00"; // darker for active
const BRAND_ORANGE_SOFT = "#FFF3E0"; // soft bg / chip

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

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

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

  /* ✅ Lock body scroll when mobile menu open */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ✅ Styles – TOP: glass white, SCROLL: solid white + dark text */
  const navStyles = useMemo(
    () => ({
      header: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md border-b border-gray-200"
          : "bg-white/20 backdrop-blur-md border-b border-white/10"
      }`,
      textColor: scrolled ? "#0f172a" : "#ffffff",
      loginBg: BRAND_ORANGE_DARK,
    }),
    [scrolled]
  );

  /* ✅ Mobile menu items (for fancy cards) */
  const mobileLinks = [
    {
      href: "/services/showcase",
      label: "Pricing",
      sub: "Simple plans for every need",
      icon: <BadgePercent className="h-5 w-5" />,
    },
    {
      href: "/features",
      label: "Features",
      sub: "Why customers love us",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      href: "/for-business",
      label: "For Business",
      sub: "Solutions for hostels & PGs",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/blogs",
      label: "Blogs",
      sub: "Tips & laundry hacks",
      icon: <Newspaper className="h-5 w-5" />,
    },
    {
      href: "/contact",
      label: "Contact",
      sub: "We’re just a call away",
      icon: <PhoneCall className="h-5 w-5" />,
    },
  ];

  /* ✅ User menu items for mobile (integrated) */
  const userMobileLinks = useMemo(() => {
    if (!user) return [];
    return [
      {
        href: "/customer/profile",
        label: "My Profile",
        sub: "Update your details",
        icon: <User className="h-5 w-5" />,
      },
      {
        href: "/customer/orders",
        label: "My Orders",
        sub: "Track your laundry",
        icon: <Newspaper className="h-5 w-5" />,
      },
      {
        href: user.isAdmin ? "/admin" : "/customer",
        label: "Dashboard",
        sub: "Manage your account",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ];
  }, [user]);

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
          {/* User – Hide dropdown on mobile, integrate into menu */}
          <div ref={dropdownRef} className="relative hidden md:block">
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
                    <Link
                      href="/customer/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-orange-600" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/customer/orders"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Newspaper className="h-4 w-4 text-orange-600" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href={user.isAdmin ? "/admin" : "/customer"}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-orange-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-orange-600" />
                      <span>Dashboard</span>
                    </Link>
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
                className="hidden sm:flex items-center gap-2 text-white text-sm px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: navStyles.loginBg }}
              >
                <User className="h-4 w-4" /> Login
              </button>
            )}
          </div>

          {/* ✅ Mobile User Greeting (visible on mobile) */}
          {user && (
            <div className="md:hidden flex items-center gap-2 text-sm font-medium">
              <div
                className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
              >
                {user.name.split(" ")[0][0].toUpperCase()}
              </div>
              <span className="max-w-20 truncate" style={{ color: navStyles.textColor }}>
                Hi, {user.name.split(" ")[0]}
              </span>
            </div>
          )}

          {/* ✅ Mobile Menu Toggle (mobile + tablet) */}
          <button
            className="lg:hidden p-1.5 rounded-full hover:bg-black/5 transition-all"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ✅ Mobile / Tablet Menu – Orange Glass Overlay + Card Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* dim background with click to close */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* menu sheet – slide in from top with animation */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 left-0 right-0 z-50 mt-[env(safe-area-inset-top,0px)] mx-4 max-w-md mx-auto bg-white shadow-2xl overflow-hidden translate-y-0 transition-transform duration-300 ease-out max-h-[calc(100vh-var(--safe-area-inset-top,0px)-var(--safe-area-inset-bottom,0px))]"
            style={{ maxHeight: `calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))` }}
          >
            {/* header */}
            <div
              className="px-5 pt-4 pb-3 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10"
              style={{ borderColor: BRAND_ORANGE_SOFT }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Laundry Logo"
                  className="h-8 w-auto object-contain"
                />
                {user && (
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-32">
                      Welcome back
                    </p>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: BRAND_ORANGE }}
                    >
                      {user.name.split(" ")[0]}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      router.push("/login");
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: BRAND_ORANGE_DARK }}
                  >
                    Login
                  </button>
                )}

                {/* ✅ Close button INSIDE the card/header */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center h-8 w-8 rounded-full border text-slate-600 hover:bg-slate-50 active:scale-95 transition"
                  style={{ borderColor: BRAND_ORANGE_SOFT }}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* menu items – scrollable */}
            <div className="px-4 py-3 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 border text-sm active:opacity-90 transition-all min-h-[64px]"
                  style={{
                    backgroundColor: isActive(item.href)
                      ? BRAND_ORANGE_SOFT
                      : "#F8FAFC",
                    borderColor: isActive(item.href)
                      ? BRAND_ORANGE
                      : "#E5E7EB",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white flex-shrink-0"
                      style={{
                        backgroundColor: isActive(item.href)
                          ? BRAND_ORANGE_DARK
                          : BRAND_ORANGE,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900 truncate">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {item.sub}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isActive(item.href) && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex"
                        style={{
                          color: BRAND_ORANGE_DARK,
                          backgroundColor: BRAND_ORANGE_SOFT,
                        }}
                      >
                        Active
                      </span>
                    )}
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isActive(item.href) ? 'rotate-90' : ''}`} />
                  </div>
                </Link>
              ))}

              {/* ✅ User Section (if logged in) */}
              {userMobileLinks.length > 0 && (
                <>
                  <div className="my-3 px-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 px-2 mb-2">
                      Your Account
                    </h3>
                  </div>
                  {userMobileLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 border text-sm active:opacity-90 transition-all min-h-[64px]"
                      style={{
                        backgroundColor: isActive(item.href)
                          ? BRAND_ORANGE_SOFT
                          : "#F8FAFC",
                        borderColor: isActive(item.href)
                          ? BRAND_ORANGE
                          : "#E5E7EB",
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white flex-shrink-0"
                          style={{
                            backgroundColor: isActive(item.href)
                              ? BRAND_ORANGE_DARK
                              : BRAND_ORANGE,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-900 truncate">
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-500 truncate">
                            {item.sub}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isActive(item.href) && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex"
                            style={{
                              color: BRAND_ORANGE_DARK,
                              backgroundColor: BRAND_ORANGE_SOFT,
                            }}
                          >
                            Active
                          </span>
                        )}
                        <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isActive(item.href) ? 'rotate-90' : ''}`} />
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 border text-sm active:opacity-90 transition-all min-h-[64px] hover:bg-red-50"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white flex-shrink-0 bg-red-500">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 truncate">Logout</span>
                        <span className="text-xs text-red-600 truncate">Sign out securely</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </>
              )}
            </div>

            {/* bottom CTA only */}
            <div className="px-4 pb-6 pt-3 border-t bg-slate-50/80 sticky bottom-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/services/showcase");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white px-4 py-4 text-sm font-semibold shadow-lg active:scale-[0.98] transition-transform"
                style={{ backgroundColor: BRAND_ORANGE_DARK }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Book a Pickup Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}