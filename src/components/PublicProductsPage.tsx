"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  Shirt,
  Calendar,
  ShoppingBag,
  Trash2,
  Droplets,
  Sparkles,
  Bath,
  WashingMachine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProductVariant {
  id: number;
}

interface ProductImage {
  id: number;
  url: string;
  alt?: string | null;
  position?: number | null;
}

interface Product {
  id: number;
  name: string;
  description?: string | null;
  category?: { id: number };
  variants?: ProductVariant[];
  images?: ProductImage[];
}

const CATEGORY_ID = 10;
const SHIPPING_FIXED = 10.99;
const GST_RATE = 0.0;
const PRODUCTS_LIMIT = 1000;
const SELECTED_VARIANTS_KEY = "selectedVariantIds";

/* Rotate through these when image is missing */
const PRODUCT_ICON_COMPONENTS = [Shirt, WashingMachine, Bath, Droplets, Sparkles];

/* ---------------------- Get API Base ---------------------- */
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    return origin.endsWith("/") ? origin.slice(0, -1) + "/api" : origin + "/api";
  }

  return "/api";
};

/* ---------------------- Safe localStorage Helpers ---------------------- */
const safeGetLocalStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn("localStorage getItem blocked or unavailable:", err);
    return null;
  }
};

const safeSetLocalStorageItem = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn("localStorage setItem blocked or unavailable:", err);
  }
};

const safeRemoveLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn("localStorage removeItem blocked or unavailable:", err);
  }
};

export default function ServicesSelectionPage() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMap, setSelectedMap] = useState<{ [productId: number]: boolean }>(
    {}
  );
  const [alterationRemarks, setAlterationRemarks] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps = ["Address", "Services", "Pickup Date/Time", "Checkout"];
  const currentStep = 1;
  const stepIcons = [
    <MapPin key="address" className="w-5 h-5" />,
    <Shirt key="services" className="w-5 h-5" />,
    <Calendar key="pickup" className="w-5 h-5" />,
    <ShoppingBag key="checkout" className="w-5 h-5" />,
  ];

  const getImageUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = apiBaseUrl.replace(/\/api$/, "").replace(/\/$/, "");
    return `${base}${path}`;
  };

  /* ---------------------- Helpers for selectedVariantIds ---------------------- */
  const addSelectedVariantId = (variantId: number) => {
    const raw = safeGetLocalStorageItem(SELECTED_VARIANTS_KEY);
    let list: number[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (!list.includes(variantId)) {
      list.push(variantId);
      safeSetLocalStorageItem(SELECTED_VARIANTS_KEY, JSON.stringify(list));
    }
  };

  const removeSelectedVariantId = (variantId: number) => {
    const raw = safeGetLocalStorageItem(SELECTED_VARIANTS_KEY);
    let list: number[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    const newList = list.filter((id) => id !== variantId);
    safeSetLocalStorageItem(SELECTED_VARIANTS_KEY, JSON.stringify(newList));
  };

  /* ---------------------- Clear backend cart on page load (fresh cart) ---------------------- */
  useEffect(() => {
    const clearServerCart = async () => {
      const token = safeGetLocalStorageItem("accessToken");
      if (!token) return;

      try {
        await fetch(`${apiBaseUrl}/cart/clear`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("🧹 Cart cleared on server");
      } catch (err) {
        console.warn("Could not clear cart on mount:", err);
      }
    };

    clearServerCart();
    // Also clear current session selection variants
    safeRemoveLocalStorageItem(SELECTED_VARIANTS_KEY);
  }, [apiBaseUrl]);

  /* ---------------------- Load Products ---------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${apiBaseUrl}/products?limit=${PRODUCTS_LIMIT}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        const parsed: Product[] = data?.products || data?.data || data || [];
        const filtered = parsed.filter((p) => p.category?.id === CATEGORY_ID);

        const ordered = [...filtered].reverse();
        setProducts(ordered);

        const initialSelected: Record<number, boolean> = {};
        ordered.forEach((p) => {
          initialSelected[p.id] = false;
        });
        setSelectedMap(initialSelected);
      } catch (err) {
        console.error(err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [apiBaseUrl]);

  /* ---------------------- Add / Remove Cart (Single time per product) ---------------------- */
  const handleAddToCart = async (product: Product) => {
    const token = safeGetLocalStorageItem("accessToken");

    if (!token) {
      toast.error("Please login first!");
      router.push("/login?redirect=/services-selection");
      return;
    }

    if (selectedMap[product.id]) {
      return;
    }

    const variantId = product.variants?.[0]?.id ?? 1;

    try {
      const res = await fetch(`${apiBaseUrl}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variantId,
          quantity: 1,
          remarks: alterationRemarks || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update cart");

      setSelectedMap((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      // 🔐 Track this variant for this session
      addSelectedVariantId(variantId);

      toast.success(`${product.name} added!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating cart");
    }
  };

  const handleRemoveFromCart = async (product: Product) => {
    const variantId = product.variants?.[0]?.id ?? 1;

    try {
      // Optionally call backend /cart/remove here if available

      setSelectedMap((prev) => ({
        ...prev,
        [product.id]: false,
      }));

      removeSelectedVariantId(variantId);

      toast("Item removed from cart", { icon: "🗑️" });
    } catch (err) {
      console.error(err);
      setSelectedMap((prev) => ({
        ...prev,
        [product.id]: false,
      }));
      removeSelectedVariantId(variantId);
      toast.error("Could not sync removal with server, but removed locally.");
    }
  };

  /* ---------------------- Cart Summary (no quantities) ---------------------- */
  const selectedItems = useMemo(() => {
    return products.filter((p) => selectedMap[p.id]);
  }, [products, selectedMap]);

  const subtotal = useMemo(() => {
    const base = selectedItems.length * 5;
    return base;
  }, [selectedItems]);

  const gst = +((subtotal + SHIPPING_FIXED) * GST_RATE).toFixed(2);
  const total = +(subtotal + SHIPPING_FIXED + gst).toFixed(2);

  /* ---------------------- Checkout ---------------------- */
  const handleCheckout = async () => {
    const token = safeGetLocalStorageItem("accessToken");

    if (!token) {
      toast.error("Please login to continue.");
      router.push("/login?redirect=/pickup");
      return;
    }

    const toastId = toast.loading("Verifying your cart...");
    try {
      const res = await fetch(`${apiBaseUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.dismiss(toastId);

      if (!res.ok) {
        toast.error(data?.error || "Failed to verify cart");
        return;
      }

      if (data?.data?.items?.length > 0) {
        toast.success("Cart verified! Redirecting...");
        safeSetLocalStorageItem("cartSummary", JSON.stringify(data.data));
        setTimeout(() => router.push("/pickup"), 300);
      } else {
        toast.error("Your cart is empty!");
      }
    } catch {
      toast.dismiss(toastId);
      toast("Proceeding anyway...", { icon: "⚠️" });
      setTimeout(() => router.push("/pickup"), 400);
    }
  };

  /* ---------------------- Render ---------------------- */
  if (loading)
    return (
      <section className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100">
          <Shirt className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-sm font-medium">Loading services...</span>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="max-w-7xl mx-auto px-4 py-16 text-center text-red-500">
        {error}
      </section>
    );

  return (
    <section
      className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14"
      aria-label="Services selection"
    >
      {/* Page Header */}
      <div className="mb-10 md:mb-12 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Laundry Services
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2 max-w-2xl">
            Choose the garments you want us to take care of. Add what you need,
            and we’ll handle the rest — wash, dry, fold, and a little extra love.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Premium care · Hygienic wash · On-time delivery</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-10">
        <div className="relative flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-0 flex-1">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold shadow-sm ${
                    index <= currentStep
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    stepIcons[index]
                  )}
                </div>
                <span className="mt-2 hidden md:block text-xs text-gray-500">
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-0 overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: index < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-8 xl:gap-12">
        {/* Services List + Remarks */}
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
            Choose Your Services
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Tap <span className="font-semibold">Add</span> next to each service to
            include it in your pickup. You can fine-tune everything at checkout.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product, idx) => {
              const isSelected = !!selectedMap[product.id];
              const isFeatured = idx === 0;

              const firstImage = product.images?.[0];
              const imageUrl = firstImage?.url ? getImageUrl(firstImage.url) : "";
              const IconComponent =
                PRODUCT_ICON_COMPONENTS[idx % PRODUCT_ICON_COMPONENTS.length];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.03 }}
                  className={`border rounded-2xl p-4 md:p-5 bg-gradient-to-br from-white via-white to-amber-50/40 backdrop-blur-sm hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 ${
                    isFeatured
                      ? "border-amber-300 ring-1 ring-amber-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={firstImage?.alt || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <IconComponent className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                            {product.name}
                          </h4>
                          {isFeatured && (
                            <span className="text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 shrink-0">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Everyday wash &amp; care service
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() =>
                          isSelected
                            ? handleRemoveFromCart(product)
                            : handleAddToCart(product)
                        }
                        className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-sm transition-all whitespace-nowrap ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {isSelected ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Remarks */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Alterations / Special Instructions
            </h3>
            <textarea
              value={alterationRemarks}
              onChange={(e) => setAlterationRemarks(e.target.value)}
              placeholder="e.g. Shorten sleeves, delicate cycle only, no starch on shirts, handle silks separately..."
              className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[80px] resize-y focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              These remarks will be sent along with your order and applied to all
              selected items.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-[360px] xl:w-[380px] bg-white rounded-2xl shadow-xl p-6 md:p-7 h-fit lg:sticky lg:top-20 border border-gray-100"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4 border-b pb-3 text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Order Summary
          </h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Selected items
              </p>
              <AnimatePresence>
                {selectedItems.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-xs text-center border border-dashed border-gray-200 rounded-lg py-3 bg-gray-50/60"
                  >
                    No services selected yet. Start by adding items on the left.
                  </motion.p>
                ) : (
                  selectedItems.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-xs md:text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(product)}
                        className="text-red-500 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200 text-sm">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${SHIPPING_FIXED.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-medium pt-1">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                <span>${gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base md:text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full py-3 text-sm md:text-base transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </motion.aside>
      </div>
    </section>
  );
}
