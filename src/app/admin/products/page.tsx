// app/admin/products/page.tsx
"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminProductsPanel from "@/components/admin/AdminProductsPanel";

export default function AdminProductsPage() {
  return (
    <div className="mt-20"> {/* ✅ Space below navbar */}
      <AdminLayout>
        <AdminProductsPanel />
      </AdminLayout>
    </div>
  );
}
