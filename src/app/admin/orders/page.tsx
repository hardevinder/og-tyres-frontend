"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrdersPanel from "@/components/admin/AdminOrdersPanel";

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-4">
      {/* pt-28 = padding top to push content below main navbar */}
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <AdminOrdersPanel />
        </div>
      </AdminLayout>
    </div>
  );
}
