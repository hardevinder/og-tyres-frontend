import { Suspense } from "react";
import ProductsPageClient from "@/components/ProductsPageClient";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050505] text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <div className="text-lg font-bold text-[#f7c25a]">Loading products...</div>
            </div>
          </div>
        </main>
      }
    >
      <ProductsPageClient />
    </Suspense>
  );
}