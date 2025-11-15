// app/admin/shipping-rules/page.tsx
import AdminLayout from "@/components/admin/AdminLayout";
import AdminShippingRulesPanel from "@/components/admin/AdminShippingRulesPanel";

export default function AdminShippingRulesPage() {
  return (
    <AdminLayout>
      <AdminShippingRulesPanel />
    </AdminLayout>
  );
}
