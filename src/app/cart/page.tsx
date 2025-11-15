"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getCartApi } from "@/utils/cart";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import { saveGuestToken } from "@/utils/checkout";

// dynamic import to avoid server/client mismatch if BreadcrumbBanner is a server component
const BreadcrumbBanner = dynamic(() => import("@/components/BreadcrumbBanner"), { ssr: false });

type Variant = { id?: number; name?: string; sku?: string | null; price?: string | number | null; stock?: number | null; image?: string | null; images?: any[]; product?: any };
type CartItem = { id: number; variantId: number; quantity: number; price: string | number | null; variant?: Variant | null; image?: string | null; product?: any | null };
type Cart = { id?: number | null; userId?: number | null; sessionId?: string | null; items?: CartItem[]; createdAt?: string; updatedAt?: string };

function formatMoney(v: string | number | null | undefined) {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// prefer explicit API base in dev; fallback to current origin
function apiBase() {
  const env = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "") : "";
  const raw = (env && String(env)) || (typeof window !== "undefined" ? window.location.origin : "");
  // remove trailing slashes and optional trailing /api
  return raw.replace(/\/+$/u, "").replace(/\/api(?:\/)?$/u, "");
}

// SHIPPING calc endpoint (change if your backend uses a different route)
const SHIPPING_CALC_URL = `${apiBase()}/api/shipping/calculate`;

type Toast = { id: string; type: "success" | "error" | "info"; text: string };

function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

/* --------------------------
   session helpers (inline)
-------------------------- */
function saveSessionId(sessionId?: string | null) {
  if (!sessionId) return;
  try {
    document.cookie = `sessionId=${encodeURIComponent(sessionId)}; path=/; max-age=${60 * 60 * 24 * 30}`;
  } catch {}
  try {
    localStorage.setItem("cartSessionId", sessionId);
  } catch {}
}

function readSessionId(): string | null {
  try {
    const m = document.cookie.match(/(?:^|; )sessionId=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  } catch {}
  try {
    return localStorage.getItem("cartSessionId");
  } catch {}
  return null;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    paymentMethod: "cod",
  });
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({});
  const [localQty, setLocalQty] = useState<Record<number, number>>({});

  // 🕒 Pickup time states
  const [pickupTime, setPickupTime] = useState<"Morning" | "Evening" | "Night">("Morning");
  const [sameDayPickup, setSameDayPickup] = useState(false);

  // server-provided totals (shipping/grandTotal) after checkout attempt
  const [serverTotals, setServerTotals] = useState<{ shipping?: number | null; grandTotal?: number | null } | null>(null);

  // shipping estimate state driven by pincode input
  const [shippingEstimate, setShippingEstimate] = useState<{ shipping: number | null; grandTotal: number | null; appliedRule?: any } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Pickup fee
  const pickupFee = sameDayPickup ? 9.99 : 0;
  const effectivePickupTime = sameDayPickup ? "SameDay" : pickupTime;

  // debounce timer ref for pincode lookups
  const shippingDebounceRef = useRef<number | null>(null);
  // abort controller for fetch
  const shippingAbortRef = useRef<AbortController | null>(null);

  // modal confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"remove" | "clear" | null>(null);
  const [confirmPayload, setConfirmPayload] = useState<any>(null);
  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);
  const confirmPrimaryRef = useRef<HTMLButtonElement | null>(null);

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(t: Omit<Toast, "id">) {
    const newToast: Toast = { id: uid("t_"), ...t };
    setToasts((s) => [...s, newToast]);
    // auto remove
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== newToast.id));
    }, 3600);
  }

  // load cart
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setBannerError(null);
      try {
        const j = await getCartApi();
        const data = j?.data ?? j;
        if (j && typeof j?.sessionId === "string") {
          saveSessionId(j.sessionId);
        }
        if (!mounted) return;
        setCart(data ?? { items: [] });
        const map: Record<number, number> = {};
        (data?.items ?? []).forEach((it: CartItem) => (map[it.id] = it.quantity));
        setLocalQty(map);
      } catch (e: any) {
        console.error("getCartApi error", e);
        if (!mounted) return;
        setBannerError("Failed to load cart. Try again.");
        setCart(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("cart:update", onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("cart:update", onUpdate);
    };
  }, []);

  // Updated subtotal to use localQty for real-time updates
  const subtotal = (cart?.items ?? []).reduce((s, it) => {
    const effectiveQty = localQty[it.id] ?? it.quantity ?? 0;
    const price = typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0);
    return s + (isFinite(price) ? price * effectiveQty : 0);
  }, 0);

  // choose shipping display — prefer serverTotals if set after real checkout, else live estimate, else 0
  const displayShipping = serverTotals?.shipping ?? (shippingEstimate?.shipping ?? 0);

  // Grand total: Use serverTotals.grandTotal if available (includes pickup fee from backend), else client-side calculation with pickupFee
  const displayGrand = serverTotals?.grandTotal ?? ((shippingEstimate?.grandTotal ?? subtotal + displayShipping) + pickupFee);

  // focus confirm primary button when opening modal
  useEffect(() => {
    if (confirmOpen) {
      const t = setTimeout(() => {
        confirmPrimaryRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [confirmOpen]);

  /* -------------------------
     Shipping lookup
     - Called when postalCode changes
     - Debounced to 500ms
     - Expects API: GET /api/shipping/calculate?pincode=XXXXX&subtotal=NNN
     - Response shape expected: { shipping: number, grandTotal: number, appliedRule?: {...} }
     ------------------------- */
  function normalizePincode(v: string) {
    if (!v) return "";
    return String(v).replace(/\D/g, "").slice(0, 6); // keep up to 6 digits
  }

  function triggerShippingLookupDebounced(pincodeRaw: string, currentSubtotal: number) {
    const pincode = normalizePincode(pincodeRaw);
    // clear previous debounce
    if (shippingDebounceRef.current) {
      window.clearTimeout(shippingDebounceRef.current);
      shippingDebounceRef.current = null;
    }
    // cancel previous fetch
    if (shippingAbortRef.current) {
      shippingAbortRef.current.abort();
      shippingAbortRef.current = null;
    }

    // If pincode is too short, clear estimate
    if (!pincode || pincode.length < 5) {
      setShippingEstimate(null);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }

    setShippingLoading(true);
    setShippingError(null);

    shippingDebounceRef.current = window.setTimeout(async () => {
      try {
        shippingAbortRef.current = new AbortController();
        // include subtotal to allow free-shipping decision serverside
        const url = `${SHIPPING_CALC_URL}?pincode=${encodeURIComponent(pincode)}&subtotal=${encodeURIComponent(String(currentSubtotal ?? 0))}`;
        const res = await fetch(url, { signal: shippingAbortRef.current.signal, credentials: "include" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({ error: "Failed to fetch shipping" }));
          throw new Error(j?.error || `Status ${res.status}`);
        }
        const j = await res.json();
        const shipping = j?.shipping ?? (j?.data?.shipping ?? null);
        const grandTotal = j?.grandTotal ?? (j?.data?.grandTotal ?? null);
        const appliedRule = j?.appliedRule ?? j?.data?.appliedRule ?? j?.data?.appliedShippingRule ?? null;
        setShippingEstimate({
          shipping: shipping != null ? Number(shipping) : 0,
          grandTotal: grandTotal != null ? Number(grandTotal) : (currentSubtotal + (shipping != null ? Number(shipping) : 0)),
          appliedRule: appliedRule ?? undefined,
        });
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // aborted — ignore
          return;
        }
        console.error("shipping lookup error", err);
        setShippingError(String(err?.message ?? err));
        setShippingEstimate(null);
      } finally {
        shippingAbortRef.current = null;
        setShippingLoading(false);
      }
    }, 500);
  }

  /* -------------------------
     UPDATE QUANTITY (PUT)
  ------------------------- */
  async function apiUpdateQuantity(itemId: number, qty: number) {
    setUpdatingItemId(itemId);
    setBannerError(null);
    try {
      const url = `${apiBase()}/api/cart/item/${itemId}`;
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Update failed" }));
        throw new Error(j?.error || `Status ${res.status}`);
      }
      const j = await res.json();
      const data = j?.data ?? j;
      setCart(data);
      const map: Record<number, number> = {};
      (data?.items ?? []).forEach((it: CartItem) => (map[it.id] = it.quantity));
      setLocalQty(map);
      window.dispatchEvent(new CustomEvent("cart:update", { detail: j }));
      pushToast({ type: "success", text: "Quantity updated" });
    } catch (e: any) {
      console.error("update quantity error", e);
      setBannerError(String(e?.message ?? e));
      pushToast({ type: "error", text: String(e?.message ?? "Failed to update") });
      // revert to server state
      try {
        const j = await getCartApi();
        const data = j?.data ?? j;
        setCart(data);
        const map: Record<number, number> = {};
        (data?.items ?? []).forEach((it: CartItem) => (map[it.id] = it.quantity));
        setLocalQty(map);
      } catch {}
    } finally {
      setUpdatingItemId(null);
    }
  }

  /* -------------------------
     PERFORM REMOVE (actual network call)
  ------------------------- */
  async function performRemove(itemId: number) {
    setUpdatingItemId(itemId);
    setBannerError(null);
    try {
      const url = `${apiBase()}/api/cart/item/${itemId}`;
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Remove failed" }));
        throw new Error(j?.error || `Status ${res.status}`);
      }
      const j = await res.json();
      const data = j?.data ?? j;
      setCart(data);
      const qtyMap: Record<number, number> = {};
      (data?.items ?? []).forEach((it: CartItem) => (qtyMap[it.id] = it.quantity));
      setLocalQty(qtyMap);
      window.dispatchEvent(new CustomEvent("cart:update", { detail: j }));
      pushToast({ type: "success", text: "Item removed" });
    } catch (e: any) {
      console.error("remove error", e);
      setBannerError(String(e?.message ?? e));
      pushToast({ type: "error", text: String(e?.message ?? "Remove failed") });
    } finally {
      setUpdatingItemId(null);
    }
  }

  /* -------------------------
     PERFORM CLEAR CART
  ------------------------- */
  async function performClearCart() {
    setClearing(true);
    setBannerError(null);
    try {
      const q: string[] = [];
      if (cart?.id) {
        q.push(`cartId=${encodeURIComponent(String(cart.id))}`);
      } else if (cart?.sessionId) {
        q.push(`sessionId=${encodeURIComponent(String(cart.sessionId))}`);
      } else {
        const sid = readSessionId();
        if (sid) q.push(`sessionId=${encodeURIComponent(sid)}`);
      }

      const url = `${apiBase()}/api/cart/clear${q.length ? "?" + q.join("&") : ""}`;
      const res = await fetch(url, { method: "DELETE", credentials: "include" });

      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Clear failed" }));
        throw new Error(j?.error || `Status ${res.status}`);
      }

      const j = await res.json().catch(() => null);
      if (j && typeof j.sessionId === "string") {
        saveSessionId(j.sessionId);
      }

      const freshResp = await getCartApi();
      const fresh = freshResp?.data ?? freshResp ?? null;

      setCart(fresh ?? { items: [] });
      const qtyMap: Record<number, number> = {};
      (fresh?.items ?? []).forEach((it: CartItem) => (qtyMap[it.id] = it.quantity));
      setLocalQty(qtyMap);

      window.dispatchEvent(new CustomEvent("cart:update", { detail: { data: fresh } }));
      pushToast({ type: "success", text: "Cart emptied" });
    } catch (e: any) {
      console.error("clear cart error", e);
      setBannerError(String(e?.message ?? e));
      pushToast({ type: "error", text: String(e?.message ?? "Clear failed") });
      try {
        const freshResp = await getCartApi();
        const fresh = freshResp?.data ?? freshResp ?? null;
        setCart(fresh ?? { items: [] });
        const qtyMap: Record<number, number> = {};
        (fresh?.items ?? []).forEach((it: CartItem) => (qtyMap[it.id] = it.quantity));
        setLocalQty(qtyMap);
      } catch {}
    } finally {
      setClearing(false);
    }
  }

  function openConfirmRemove(itemId: number) {
    setConfirmType("remove");
    setConfirmPayload({ itemId });
    confirmActionRef.current = () => performRemove(itemId);
    setConfirmOpen(true);
  }

  function openConfirmClear() {
    setConfirmType("clear");
    setConfirmPayload(null);
    confirmActionRef.current = performClearCart;
    setConfirmOpen(true);
  }

  function changeQtyLocally(itemId: number, qty: number) {
    setLocalQty((s) => ({ ...s, [itemId]: qty }));
    // when qty changes we might want to re-evaluate shipping (subtotal changed)
    // schedule a shipping lookup using current postal code
    triggerShippingLookupDebounced(checkoutForm.postalCode, computeSubtotalWithLocalQty(itemId, qty));
  }

  function computeSubtotalWithLocalQty(changedItemId?: number, changedQty?: number) {
    // compute subtotal taking into account possible changed single item (optimistic)
    return (cart?.items ?? []).reduce((s, it) => {
      const qty = it.id === changedItemId ? (changedQty ?? it.quantity) : (localQty[it.id] ?? it.quantity ?? 0);
      const price = typeof it.price === "string" ? parseFloat(it.price) : Number(it.price || 0);
      return s + (isFinite(price) ? price * qty : 0);
    }, 0);
  }

  function validateCheckout() {
    const errs: Record<string, string> = {};
    if (!checkoutForm.name.trim()) errs.name = "Name is required";
    if (!checkoutForm.phone.trim()) errs.phone = "Phone is required";
    if (!checkoutForm.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!checkoutForm.city.trim()) errs.city = "City is required";
    if (!checkoutForm.state.trim()) errs.state = "State is required";
    if (!checkoutForm.postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!checkoutForm.email.trim()) errs.email = "Email is required";
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutSuccess(null);
    setBannerError(null);
    setServerTotals(null);
    if (!cart || (cart.items?.length ?? 0) === 0) {
      setBannerError("Cart is empty");
      return;
    }
    if (!validateCheckout()) return;

    setCheckoutLoading(true);
    try {
      const payload = {
        cartId: cart.id,
        items: cart.items?.map((it) => ({ variantId: it.variantId, quantity: localQty[it.id] ?? it.quantity })) ?? [],
        customer: {
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          email: checkoutForm.email,
          address: {
            line1: checkoutForm.addressLine1,
            line2: checkoutForm.addressLine2,
            city: checkoutForm.city,
            state: checkoutForm.state,
            postalCode: checkoutForm.postalCode,
            country: checkoutForm.country,
          },
        },
        paymentMethod: checkoutForm.paymentMethod,
        // 🕒 Include pickup time in payload
        pickupTime: effectivePickupTime,
      };
      const res = await fetch(`${apiBase()}/api/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Checkout failed" }));
        throw new Error(j?.error || `Status ${res.status}`);
      }
      const j = await res.json();

      const orderNumber = j?.orderNumber ?? j?.data?.orderNumber ?? j?.data?.orderId ?? null;
      const guestToken = j?.guestAccessToken ?? j?.data?.guestAccessToken ?? null;

      if (j && typeof j.sessionId === "string") {
        try {
          saveSessionId(j.sessionId);
        } catch {}
      }

      if (orderNumber && guestToken) {
        try {
          saveGuestToken(orderNumber, guestToken);
        } catch {}
      }

      const serverShipping = j?.data?.shipping ?? j?.shipping ?? null;
      const serverGrand = j?.data?.grandTotal ?? j?.grandTotal ?? null;
      if (serverShipping != null || serverGrand != null) {
        setServerTotals({
          shipping: serverShipping != null ? Number(serverShipping) : null,
          grandTotal: serverGrand != null ? Number(serverGrand) : null,  // Backend now includes pickupFee
        });
      }

      setCheckoutSuccess(orderNumber ? `Order placed: ${orderNumber}` : "Order placed successfully");
      setCart({ ...cart, items: [] });
      setLocalQty({});
      window.dispatchEvent(new CustomEvent("cart:update", { detail: { data: { items: [] } } }));
      pushToast({ type: "success", text: "Order placed successfully" });

      if (orderNumber) {
        const base = `/orders/${encodeURIComponent(orderNumber)}`;
        const target = guestToken ? `${base}?token=${encodeURIComponent(guestToken)}` : base;
        router.push(target);
        return;
      }
    } catch (err: any) {
      console.error("checkout error", err);
      setBannerError(String(err?.message ?? err));
      pushToast({ type: "error", text: String(err?.message ?? "Checkout failed") });
    } finally {
      setCheckoutLoading(false);
    }
  }

  /* -------------------------
     RENDER
  ------------------------- */
  if (loading) {
    return (
      <>
        <BreadcrumbBanner
          title="Your Cart"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
          background="/cart-banner.jpg"
        />
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
          <div className="ml-4 text-gray-600 font-medium">Loading your treasures…</div>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadcrumbBanner
        title="Your Cart"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        background="/cart-banner.jpg"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black !text-black mb-2">
            Your Enchanted Cart
          </h1>



            <p className="text-xl text-gray-600">Discover the magic of your selections</p>
          </div>

          {bannerError && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {bannerError}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Section */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l1.5 7.5M16 13l-1.5 7.5M9 13l-1.5 7.5" />
                  </svg>
                  Your Selections
                </h2>
                <button
                  onClick={() => openConfirmClear()}
                  disabled={clearing || !(cart?.items?.length ?? 0)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearing ? "Clearing…" : "Empty Cart"}
                </button>
              </div>

              {cart?.items && cart.items.length > 0 ? (
                <ul className="space-y-6">
                  {cart.items.map((it: CartItem) => {
                    const currentQty = localQty[it.id] ?? it.quantity;
                    const stock = it.variant?.stock ?? null;
                    const isUpdating = updatingItemId === it.id;

                    // Enhanced image extraction: Check multiple sources for product/variant images
                    let rawImage = it.image;
                    if (!rawImage && it.variant) {
                      rawImage = it.variant.image;
                      if (!rawImage && Array.isArray(it.variant.images) && it.variant.images.length > 0) {
                        rawImage = it.variant.images[0].url || it.variant.images[0];
                      }
                    }
                    if (!rawImage && it.product && Array.isArray(it.product.images) && it.product.images.length > 0) {
                      rawImage = it.product.images[0].url || it.product.images[0];
                    }
                    if (!rawImage && it.variant?.product && Array.isArray(it.variant.product.images) && it.variant.product.images.length > 0) {
                      rawImage = it.variant.product.images[0].url || it.variant.product.images[0];
                    }

                    const imageUrl = rawImage ? resolveImageUrl(rawImage) : null;

                    return (
                      <li key={it.id} className="group bg-gradient-to-r from-white to-orange-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-orange-100">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-gray-400 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={it.variant?.name ?? `Product Image ${it.id}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <>
                                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 6m0 0l-8-6m8 6V7m-4 4h.01M23 21a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                              </>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 text-lg truncate">{it.variant?.name ?? `Magical Item #${it.id}`}</h3>
                                <p className="text-sm text-gray-500 truncate">{it.variant?.sku ?? ""}</p>
                              </div>

                              <div className="flex-shrink-0 text-right">
                                <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{formatMoney(it.price)}</div>
                                <div className="text-xs text-gray-500">per enchantment</div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex items-center bg-white rounded-xl p-2 shadow-sm border border-gray-200">
                                <button onClick={() => changeQtyLocally(it.id, Math.max(1, currentQty - 1))} className="px-3 py-2 text-lg font-bold text-gray-600 hover:text-orange-600 transition-colors duration-200 hover:scale-110" aria-label="Decrease quantity">
                                  −
                                </button>
                                <input type="number" min={1} value={currentQty} onChange={(e) => changeQtyLocally(it.id, Math.max(1, Number(e.target.value || 1)))} className="w-16 text-center py-2 text-lg font-semibold outline-none bg-transparent" />
                                <button onClick={() => changeQtyLocally(it.id, currentQty + 1)} className="px-3 py-2 text-lg font-bold text-gray-600 hover:text-orange-600 transition-colors duration-200 hover:scale-110" aria-label="Increase quantity">
                                  +
                                </button>
                              </div>

                              <div className="flex items-center gap-3 flex-wrap">
                                <button onClick={() => apiUpdateQuantity(it.id, localQty[it.id] ?? it.quantity)} disabled={isUpdating || currentQty === it.quantity} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                  {isUpdating ? "Updating…" : "Save Changes"}
                                </button>

                                <button onClick={() => openConfirmRemove(it.id)} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200">
                                  Remove
                                </button>

                                {stock != null && <div className={`px-3 py-1 rounded-full text-xs font-medium ${stock > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>{stock > 0 ? `${stock} in stock` : "Out of stock"}</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-16 text-center bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l1.5 7.5M16 13l-1.5 7.5M9 13l-1.5 7.5" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is an empty canvas</h3>
                  <p className="text-gray-500">Ready to be filled with wonders.</p>
                  <button onClick={() => router.push("/products")} className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                    Explore Wonders
                  </button>
                </div>
              )}

              {cart?.items && cart.items.length > 0 && (
                <div className="mt-8 pt-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Subtotal</span>
                    <span className="text-2xl font-bold text-gray-900">{formatMoney(subtotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Aside */}
            <aside className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Complete Your Quest
              </h2>

              {checkoutSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {checkoutSuccess}
                  </div>
                </div>
              )}

              {/* 🕒 Pickup Time Selection — On Top as Requested */}
              <div className="space-y-4 mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700">Choose Your Pickup Time</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Morning", "Evening", "Night"].map((time) => {
                    const isSelected = pickupTime === time;
                    const icons: Record<string, string> = {
                      Morning: "☀️",
                      Evening: "🐦",
                      Night: "🌙",
                    };
                    const timeRanges: Record<string, string> = {
                      Morning: "09:00-16:00",
                      Evening: "16:00-00:00",
                      Night: "00:00-08:00",
                    };
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setPickupTime(time as "Morning" | "Evening" | "Night")}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center hover:shadow-md ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`text-3xl mb-2 ${isSelected ? "text-orange-600" : "text-gray-400"}`}>
                          {icons[time]}
                        </div>
                        <div className={`font-semibold ${isSelected ? "text-gray-800" : "text-gray-600"}`}>
                          {time}
                        </div>
                        <div className="text-xs text-gray-500">{timeRanges[time]}</div>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sameDayPickup}
                    onChange={(e) => setSameDayPickup(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Same Day Pickup (+${pickupFee.toFixed(2)})
                  </span>
                </label>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input value={checkoutForm.name} onChange={(e) => setCheckoutForm((s) => ({ ...s, name: e.target.value }))} className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="Enter your enchanted name" />
                  {checkoutErrors.name && <div className="text-xs text-red-600 mt-1">{checkoutErrors.name}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input value={checkoutForm.phone} onChange={(e) => setCheckoutForm((s) => ({ ...s, phone: e.target.value }))} className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="Your magical contact number" />
                  {checkoutErrors.phone && <div className="text-xs text-red-600 mt-1">{checkoutErrors.phone}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input value={checkoutForm.email} onChange={(e) => setCheckoutForm((s) => ({ ...s, email: e.target.value }))} type="email" className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="Where spells arrive" />
                  {checkoutErrors.email && <div className="text-xs text-red-600 mt-1">{checkoutErrors.email}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
                  <input value={checkoutForm.addressLine1} onChange={(e) => setCheckoutForm((s) => ({ ...s, addressLine1: e.target.value }))} className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.addressLine1 ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="Your portal address" />
                  {checkoutErrors.addressLine1 && <div className="text-xs text-red-600 mt-1">{checkoutErrors.addressLine1}</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input value={checkoutForm.city} onChange={(e) => setCheckoutForm((s) => ({ ...s, city: e.target.value }))} className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.city ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="City of dreams" />
                    {checkoutErrors.city && <div className="text-xs text-red-600 mt-1">{checkoutErrors.city}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input value={checkoutForm.state} onChange={(e) => setCheckoutForm((s) => ({ ...s, state: e.target.value }))} className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.state ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} placeholder="Realm" />
                    {checkoutErrors.state && <div className="text-xs text-red-600 mt-1">{checkoutErrors.state}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                    <input
                      value={checkoutForm.postalCode}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setCheckoutForm((s) => ({ ...s, postalCode: cleaned }));
                        // trigger shipping lookup (use optimistic subtotal)
                        triggerShippingLookupDebounced(cleaned, subtotal);
                      }}
                      className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${checkoutErrors.postalCode ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                      placeholder="ZIP/Postal"
                    />
                    {checkoutErrors.postalCode && <div className="text-xs text-red-600 mt-1">{checkoutErrors.postalCode}</div>}

                    {/* Shipping estimate UI */}
                    <div className="mt-2 text-sm">
                      {shippingLoading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          </svg>
                          Calculating shipping…
                        </div>
                      ) : shippingError ? (
                        <div className="text-xs text-red-600">Shipping: error ({shippingError})</div>
                      ) : shippingEstimate ? (
                        <div>
                          <div className="text-xs text-gray-600">Shipping estimate: <strong>{formatMoney(shippingEstimate.shipping)}</strong></div>
                          {shippingEstimate.appliedRule && (
                            <div className="text-xs text-gray-500">Rule: {shippingEstimate.appliedRule.name ?? `${shippingEstimate.appliedRule.pincodeFrom}-${shippingEstimate.appliedRule.pincodeTo}`}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Enter PIN to see shipping</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <select value={checkoutForm.country} onChange={(e) => setCheckoutForm((s) => ({ ...s, country: e.target.value }))} className="w-full rounded-xl border px-4 py-3 text-sm border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select value={checkoutForm.paymentMethod} onChange={(e) => setCheckoutForm((s) => ({ ...s, paymentMethod: e.target.value }))} className="w-full rounded-xl border px-4 py-3 text-sm border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
                    <option value="cod">Cash on Delivery</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card (online)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatMoney(subtotal)}</span>
                    </div>
                    {displayShipping > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Shipping</span>
                        <span>{formatMoney(displayShipping)}</span>
                      </div>
                    )}
                    {pickupFee > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Pickup Fee</span>
                        <span>{formatMoney(pickupFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300 text-lg font-bold text-gray-900">
                      <span>Grand Total</span>
                      <span>{formatMoney(displayGrand)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button type="submit" disabled={checkoutLoading || (cart?.items?.length ?? 0) === 0} className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                      {checkoutLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing Your Order…
                        </>
                      ) : (
                        "Place Order & Embark"
                      )}
                    </button>
                    <button type="button" onClick={() => router.push("/products")} className="w-full px-6 py-3 border-2 border-orange-200 rounded-xl text-sm font-semibold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200">
                      Continue Exploring
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">We will summon payment details on the next step, tailored to your chosen method.</div>
            </aside>
          </div>
        </div>
      </div>

      {/* Toast container (top-right) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg ${t.type === "success" ? "bg-orange-50 border border-orange-200 text-orange-800" : t.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : "bg-gray-50 border"}`}>
            <div className="text-sm">{t.text}</div>
          </div>
        ))}
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {confirmType === "remove" ? "Remove item?" : "Empty cart?"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmType === "remove"
                ? "This will remove the selected item from your cart. This action cannot be undone."
                : "This will empty your cart. This action cannot be undone."}
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
                Cancel
              </button>
              <button
                ref={confirmPrimaryRef}
                onClick={async () => {
                  setConfirmOpen(false);
                  if (confirmActionRef.current) {
                    try {
                      await confirmActionRef.current();
                    } catch (err) {
                      // performRemove / performClear handle errors themselves
                    } finally {
                      confirmActionRef.current = null;
                      setConfirmType(null);
                      setConfirmPayload(null);
                    }
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                {confirmType === "remove" ? "Remove item" : "Empty cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}