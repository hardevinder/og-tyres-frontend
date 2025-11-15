"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";
import AddToCartClient from "@/components/AddToCartClient";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_PRODUCTS_API ?? "").trim();
  const globalEnv = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  const raw = env || globalEnv || "http://localhost:5000";
  return raw.replace(/\/+$/u, "").replace(/\/api$/u, "");
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const origin = getApiBase();
        const res = await fetch(`${origin}/api/products`, { cache: "no-store" });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : json;
        setProducts(list || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Group products by category
  const groupedProducts = products.reduce((acc: any, product: any) => {
    const cat = product.category?.name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const categories = ["All", ...Object.keys(groupedProducts)];
  const visibleCategories =
    selectedCategory === "All"
      ? Object.keys(groupedProducts)
      : [selectedCategory];

  return (
    <>
      <BreadcrumbBanner
        title="Our Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        background="/products-banner.jpg"
      />

      <section className="w-full bg-[#f9faf6] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#506600] mb-4">
              Our Laundry & Alteration Services
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our professional laundry and alteration services below.
              Filter by category to explore specific service types.
            </p>
          </motion.div>

          {/* ✅ Category Filter */}
          <div className="flex justify-center mb-12">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#c9d7a8] bg-white text-gray-700 rounded-xl px-5 py-3 shadow-sm focus:ring-2 focus:ring-[#7aa82c] focus:outline-none transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Cards Section */}
          {loading ? (
            <p className="text-center text-gray-500">Loading services...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No services available.</p>
          ) : (
            visibleCategories.map((category, catIndex) => (
              <div key={category} className="mb-16">
                {/* Category Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-extrabold text-[#4a5e00] mb-8 border-b-4 border-[#cce29f] pb-2"
                >
                  {category}
                </motion.h2>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {groupedProducts[category].map((product: any, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-[#eef3e2]"
                    >
                      {/* Product Info */}
                      <h3 className="text-xl font-bold text-[#506600] mb-2 underline decoration-[#7aa82c] underline-offset-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {product.summary || "No description available."}
                      </p>

                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-4">
                          <span className="font-medium text-gray-700">Brand:</span>{" "}
                          {product.brand}
                        </p>
                      )}

                      {/* ✅ Perfectly stacked Variant Section */}
                      {product.variants && product.variants.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {product.variants.map((variant: any, i: number) => (
                            <div
                              key={i}
                              className="border border-gray-200 rounded-xl p-4 bg-[#f9faf6] shadow-sm"
                            >
                              <div className="flex flex-col text-sm text-gray-700 space-y-1">
                                <div>
                                  <span className="font-medium text-gray-800">
                                    Variant:
                                  </span>
                                  <div className="text-gray-600 break-words">
                                    {variant.name || "Default"}
                                  </div>
                                </div>

                                <div>
                                  <span className="font-medium text-gray-800">
                                    Price:
                                  </span>{" "}
                                  <span className="text-emerald-600 font-semibold">
                                    $
                                    {variant.salePrice
                                      ? Number(variant.salePrice).toFixed(2)
                                      : Number(variant.price || 0).toFixed(2)}
                                  </span>
                                </div>

                                <div className="pt-2 mt-1 border-t border-gray-300">
                                  <span className="font-medium text-gray-800">
                                    Quantity:
                                  </span>{" "}
                                  <span className="text-gray-700">
                                    {variant.quantity ?? "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 mb-4">
                          Price:{" "}
                          <span className="text-emerald-600 font-semibold">
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                        </p>
                      )}

                      {/* Add to Cart Button */}
                      <div className="text-center mt-4">
                        <AddToCartClient
                          variants={product.variants || []}
                          buttonText="Add Service"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}