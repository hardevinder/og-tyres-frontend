"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminInquiriesPanel from "@/components/admin/AdminInquiriesPanel";

export default function AdminInquiriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-4">
      {/* pt-28 ensures content sits below fixed navbar */}
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <AdminInquiriesPanel />
        </div>
      </AdminLayout>
    </div>
  );
}
