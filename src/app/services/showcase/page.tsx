"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, CheckCircle2 } from "lucide-react";
import Link from "next/link";
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

interface Product {
  id: number;
  name: string;
  description?: string;
  category?: { id: number };
  variants?: ProductVariant[];
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

export default function ServiceShowcasePage() {
  const apiBaseUrl = getApiBaseUrl();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------- Load Data ---------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories`, { cache: "no-store" }),
          fetch(`${apiBaseUrl}/products?limit=${PRODUCTS_LIMIT}`, { cache: "no-store" }),
        ]);

        if (!catRes.ok || !prodRes.ok) throw new Error("Failed to fetch services");

        const cats = await catRes.json();
        const prods = await prodRes.json();

        const parsedCats: Category[] = cats?.categories || cats?.data || cats || [];
        const parsedProds: Product[] = prods?.products || prods?.data || prods || [];

        setCategories(parsedCats);
        setProducts(parsedProds);
      } catch (err) {
        console.error(err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (apiBaseUrl) loadData();
  }, [apiBaseUrl]);

  /* ---------------------- Render ---------------------- */
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
      {/* 🌟 Banner */}
      <BreadcrumbBanner
        title="Our Premium Laundry & Cleaning Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        background="/services-banner.jpg"
      />

      {/* 💧 Main Section */}
      <section className="w-full bg-[#FFFDF8] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Professional Laundry & Cleaning Solutions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right service for your needs — from dry cleaning to steam ironing, all handled with care.
            </p>
          </motion.div>

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (p) => p.category?.id === category.id
              );
              const showAll = expanded[category.id];

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-3xl shadow-md p-8 hover:shadow-xl transition"
                >
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                      <h2 className="font-bold text-2xl text-gray-900">{category.name}</h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {categoryProducts.length} available services
                      </p>
                    </div>
                    <Link
                      href={`/address?category=${encodeURIComponent(category.name)}`}
                      className="mt-4 md:mt-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-transform duration-300 hover:scale-105"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Book Service
                    </Link>
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(showAll ? categoryProducts : categoryProducts.slice(0, 3)).map(
                      (product, index) => {
                        const variant = product.variants?.[0];
                        const price = parseFloat(
                          variant?.salePrice ?? variant?.price ?? "0"
                        );
                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            viewport={{ once: true }}
                            className="border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white to-[#FFF8EE] hover:shadow-md transition"
                          >
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            {price > 0 && (
                              <p className="text-amber-600 font-semibold text-sm bg-amber-50 px-3 py-1 rounded-full inline-block">
                                From ${price.toFixed(2)}
                              </p>
                            )}
                          </motion.div>
                        );
                      }
                    )}
                  </div>

                  {/* Show More / Less Button */}
                  {categoryProducts.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [category.id]: !prev[category.id],
                          }))
                        }
                        className="text-amber-600 font-semibold hover:underline transition-colors"
                      >
                        {showAll ? "Show Less" : "Show More"}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-20">
            <Link
              href="/address"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
            >
              <MapPin className="w-5 h-5" />
              <span>Book a Laundry Pickup Today</span>
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
