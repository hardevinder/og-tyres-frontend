"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrdersPanel from "@/components/admin/AdminOrdersPanel";

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4">
        <AdminOrdersPanel />
      </div>
    </AdminLayout>
  );
}