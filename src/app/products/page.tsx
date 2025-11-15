"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";
import PublicProductsPage from "@/components/PublicProductsPage";

export default function ProductsPage() {
  return (
    <>
      {/* ✅ Banner */}
      <BreadcrumbBanner
        title="Our Laundry & Cleaning Services"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        background="/products-banner.png"
      />

      {/* ✅ Main Services Section */}
      <section
        className="w-full bg-[#FFFDF8] py-20 px-6 md:px-12"
        style={{
          color: "#1a1a1a",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* ✅ Page Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-4"
              style={{ color: "#111111" }}
            >
              Professional Laundry & Cleaning Services
            </h1>

            <p
              className="text-lg max-w-3xl mx-auto"
              style={{ color: "#444444" }}
            >
              From ironing to dry cleaning, we handle your clothes with care.
              Add your preferred services to the cart and enjoy hassle-free care
              for your garments.
            </p>
          </motion.div>

          {/* ✅ Wrap component using useSearchParams() in Suspense */}
          <Suspense fallback={<div>Loading services...</div>}>
            <PublicProductsPage />
          </Suspense>
        </div>
      </section>
    </>
  );
}
