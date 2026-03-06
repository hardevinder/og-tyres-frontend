"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminProductsPanel from "@/components/admin/AdminProductsPanel";

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductsPanel />
    </AdminLayout>
  );
}