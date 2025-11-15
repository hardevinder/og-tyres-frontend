// app/admin/categories/page.tsx
"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminCategoriesPanel from "@/components/admin/AdminCategoriesPanel";

export default function AdminCategoriesPage() {
  return (
    <div className="mt-20"> {/* ✅ adds space below fixed navbar */}
      <AdminLayout>
        <AdminCategoriesPanel />
      </AdminLayout>
    </div>
  );
}
