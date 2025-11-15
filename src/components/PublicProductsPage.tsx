"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Shirt, Calendar, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProductVariant {
  id: number;
}

interface Product {
  id: number;
  name: string;
  category?: { id: number };
  variants?: ProductVariant[];
}

const CATEGORY_ID = 10;
const SAME_DAY_FEE = 6.99;
const SHIPPING_FIXED = 10.99; // 🔥 Fixed shipping charge
const GST_RATE = 0.0;
const PRODUCTS_LIMIT = 1000;

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

/* ---------------------- Normalize Postal ---------------------- */
const normalizePostal = (code: string): string => {
  if (!code) return "";
  const clean = code.toUpperCase().replace(/\s+/g, "");
  if (clean.length === 6) {
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  return clean;
};

export default function ServicesSelectionPage() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
  const [remarks, setRemarks] = useState<{ [productId: number]: string }>({});
  const [sameDayPickup, setSameDayPickup] = useState(false);
  const [postalCode, setPostalCode] = useState<string>("");
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

  /* ---------------------- Load Products ---------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/products?limit=${PRODUCTS_LIMIT}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        const parsed: Product[] = data?.products || data?.data || data || [];
        const filtered = parsed.filter((p) => p.category?.id === CATEGORY_ID);
        setProducts(filtered);

        const initialQuantities: any = {};
        filtered.forEach((p) => (initialQuantities[p.id] = 0));
        setQuantities(initialQuantities);
      } catch (err) {
        console.error(err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [apiBaseUrl]);

  /* ---------------------- Add / Remove Cart ---------------------- */
  const handleAddToCart = async (product: Product, delta = 1) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login first!");
      router.push("/login?redirect=/services-selection");
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
          quantity: delta,
          remarks: remarks[product.id] || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update cart");

      setQuantities((prev) => ({
        ...prev,
        [product.id]: Math.max(0, (prev[product.id] || 0) + delta),
      }));

      if (delta > 0) toast.success(`${product.name} added!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating cart");
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: 0,
    }));
    toast("Item removed from cart", { icon: "🗑️" });
  };

  /* ---------------------- Cart Summary ---------------------- */
  const selectedItems = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        return { product, quantity: qty };
      })
      .filter(({ product }) => !!product);
  }, [quantities, products]);

  const subtotal = useMemo(() => {
    const base = selectedItems.length * 5;
    return base + (sameDayPickup ? SAME_DAY_FEE : 0);
  }, [selectedItems, sameDayPickup]);

  const gst = +((subtotal + SHIPPING_FIXED) * GST_RATE).toFixed(2);
  const total = +(subtotal + SHIPPING_FIXED + gst).toFixed(2);

  /* ---------------------- Checkout ---------------------- */
  const handleCheckout = async () => {
    const token = localStorage.getItem("accessToken");
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
        localStorage.setItem("cartSummary", JSON.stringify(data.data));
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
      <section className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">
        Loading services...
      </section>
    );

  if (error)
    return (
      <section className="max-w-7xl mx-auto px-4 py-10 text-center text-red-500">
        {error}
      </section>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10" aria-label="Services selection">
      {/* Progress */}
      <div className="mb-8">
        <div className="relative flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : stepIcons[index]}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-0 overflow-hidden">
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
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Services List */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Choose Your Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => {
              const quantity = quantities[product.id] || 0;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between bg-white hover:shadow-md transition-all"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{product.name}</h4>
                    <textarea
                      placeholder="Add remarks or special instructions..."
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:ring-amber-500 focus:border-amber-500 resize-y min-h-[70px]"
                      value={remarks[product.id] || ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-end mt-4">
                    {quantity === 0 ? (
                      <button
                        onClick={() => handleAddToCart(product, 1)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full transition font-medium"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-full overflow-hidden border-gray-300">
                          <button
                            onClick={() => handleAddToCart(product, -1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="px-3 text-sm font-medium">{quantity}</span>
                          <button
                            onClick={() => handleAddToCart(product, 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-20 border border-gray-100"
        >
          <h3 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-900">Order Summary</h3>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <label className="text-gray-700 font-medium">Enter Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(normalizePostal(e.target.value))}
                placeholder="e.g. V6B 1A1"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <AnimatePresence>
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-center">No services selected yet.</p>
              ) : (
                selectedItems.map(({ product, quantity }) => (
                  <motion.div
                    key={product?.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span>
                      {product?.name} × {quantity}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(product!.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span>Shipping</span>
              <span>${SHIPPING_FIXED.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Same-Day Pickup</span>
              <input
                type="checkbox"
                checked={sameDayPickup}
                onChange={() => setSameDayPickup(!sameDayPickup)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {sameDayPickup && (
              <div className="flex justify-between text-gray-700">
                <span>Same-Day Service Fee</span>
                <span>${SAME_DAY_FEE.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
              <span>${gst.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full py-3 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            Continue →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
