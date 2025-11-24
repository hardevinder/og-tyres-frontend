"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  Shirt,
  ShoppingCart,
  Droplets,
  Sparkles,
  Bath,
  WashingMachine,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

interface Category {
  id: number;
  name: string;
}

interface ProductVariant {
  id?: number;
  salePrice?: string;
  price?: string;
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
  description?: string;
  category?: { id: number };
  variants?: ProductVariant[];
  images?: ProductImage[];
}

const PRODUCTS_LIMIT = 1000;

const getApiBaseUrl = (): string => {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost:3000")) {
      return origin.replace(":3000", ":5000") + "/api";
    }
    return origin + "/api";
  }
  return "";
};

type CartSummary = {
  itemsCount: number;
  total: number;
};

const PRODUCT_ICON_COMPONENTS = [Shirt, WashingMachine, Bath, Droplets, Sparkles];

export default function ServiceShowcasePage() {
  const apiBaseUrl = getApiBaseUrl();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSummary>({ itemsCount: 0, total: 0 });

  const getImageUrl = (path: string): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const base = apiBaseUrl.replace(/\/api$/, "").replace(/\/$/, "");
    return `${base}${path}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories`, { cache: "no-store" }),
          fetch(`${apiBaseUrl}/products?limit=${PRODUCTS_LIMIT}`, {
            cache: "no-store",
          }),
        ]);

        if (!catRes.ok || !prodRes.ok) throw new Error("Failed to fetch services");

        const cats = await catRes.json();
        const prods = await prodRes.json();

        setCategories(cats?.categories || cats?.data || cats || []);
        setProducts(prods?.products || prods?.data || prods || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (apiBaseUrl) loadData();
  }, [apiBaseUrl]);

  const getProductPrice = (product: Product): number => {
    const variant = product.variants?.[0];
    const value = parseFloat(variant?.salePrice ?? variant?.price ?? "0");
    return !isNaN(value) && value > 0 ? value : 0;
  };

  const handleEstimateClick = (product: Product) => {
    const price = getProductPrice(product);
    if (price <= 0) return;
    setCart((prev) => ({
      itemsCount: prev.itemsCount + 1,
      total: +(prev.total + price).toFixed(2),
    }));
  };

  const handleGoToAddress = () => {
    router.push("/address");
  };

  if (loading)
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading services...
      </section>
    );

  if (error)
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500">
        {error}
      </section>
    );

  return (
    <>
      <BreadcrumbBanner
        title="Our Premium Laundry & Cleaning Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        background="/services-banner.jpg"
      />

      <section className="w-full bg-white py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Laundry – Per Pound Pricing
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-8">
            Ideal for your everyday wear, linens, and casual garments.
          </p>

          <div className="flex justify-center mb-8">
            <img
              src="/basket.png"
              alt="Laundry basket"
              className="w-36 md:w-48 lg:w-56 drop-shadow-md"
            />
          </div>

          <p
            className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-sm"
            style={{ color: "#003636" }}
          >
            $1.99 Per Lbs
          </p>

          <p className="text-sm md:text-base text-gray-700">
            $10.99 pickup/delivery fee{" "}
            <span className="font-medium">(waived off over 28 lbs)</span>
          </p>
          <p className="text-sm md:text-base text-gray-700 mt-1">
            $31.49 minimum charge <span className="font-medium">(10 lbs)</span>
          </p>

          <p className="text-sm md:text-base text-gray-600 mt-6 max-w-2xl mx-auto">
            Choose washing preferences as per your requirements – we handle the rest
            with professional care and quality detergents.
          </p>
        </div>
      </section>

      <section className="w-full bg-[#FFFDF8] py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-10">
            {[...categories].reverse().map((category) => {
              if (category.name === "Laundry & Fabric Care Services") return null;

              const categoryProducts = products.filter(
                (p) => p.category?.id === category.id
              );
              if (!categoryProducts.length) return null;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg md:text-xl text-gray-900">
                        {category.name}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500">
                        {categoryProducts.length} services · Priced per item
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Premium &amp; Reliable</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {categoryProducts.map((product, index) => {
                      const priceNum = getProductPrice(product);
                      const price = priceNum > 0 ? `$${priceNum.toFixed(2)}` : "--";

                      const IconComponent =
                        PRODUCT_ICON_COMPONENTS[
                          index % PRODUCT_ICON_COMPONENTS.length
                        ];

                      const firstImage = product.images?.[0];
                      const imageUrl = firstImage?.url
                        ? getImageUrl(firstImage.url)
                        : "";

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.02 }}
                          viewport={{ once: true }}
                          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={firstImage?.alt || product.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#FFF5E6] flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-[#F4A23A]" />
                              </div>

                            )}

                            <div>
                              <p className="text-sm md:text-base font-medium text-gray-900">
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 md:gap-4 justify-end">
                            <span className="text-sm md:text-base font-semibold text-gray-900 min-w-[68px] text-right">
                              {price}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleEstimateClick(product)}
                              className="text-xs md:text-sm font-semibold px-4 py-1.5 rounded-md border border-sky-500 text-sky-600 bg-white hover:bg-sky-50"
                            >
                              Get Estimate
                            </button>

                            <Link
                              href={`/address?service=${encodeURIComponent(
                                product.name
                              )}`}
                              className="text-xs md:text-sm font-semibold px-4 py-1.5 rounded-md border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50"
                            >
                              Book Service
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {cart.itemsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 inset-x-3 md:inset-x-auto md:right-8 md:bottom-6 z-40"
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl px-4 py-3 md:px-5 md:py-4 max-w-md mx-auto md:mx-0">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-sky-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Your Estimate
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Items selected:{" "}
              <span className="font-semibold">{cart.itemsCount}</span>
            </p>
            <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
              ${cart.total.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={handleGoToAddress}
              className="mt-3 w-full bg-sky-500 hover:bg-sky-600 text-white text-xs md:text-sm font-semibold rounded-full py-2 flex items-center justify-center gap-2"
            >
              <MapPin className="w-3 h-3" />
              <span>Book Services</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
