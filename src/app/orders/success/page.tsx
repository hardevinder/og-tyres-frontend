"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  ShoppingBag,
  Clock,
  CreditCard,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${base}/orders/${orderNumber}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();
        console.log("Fetched order response:", data);
        setOrder(data?.data || data?.order || null);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Loading your order details...
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <CheckCircle2 className="w-10 h-10 text-red-500 mb-2" />
        <p>Sorry, we couldn&apos;t find that order.</p>
      </div>
    );

  // ✅ Safe status handling
  const rawStatus =
    typeof order?.orderStatus === "string" && order.orderStatus.length > 0
      ? order.orderStatus
      : "pending";

  const normalizedStatus = rawStatus.toLowerCase();
  const prettyStatus =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  const statusColor =
    {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800",
      partial: "bg-orange-100 text-orange-800",
    }[normalizedStatus] || "bg-gray-100 text-gray-800";

  // ✅ Safely read shippingAddress (ensure object)
  const sa =
    order.shippingAddress && typeof order.shippingAddress === "object"
      ? order.shippingAddress
      : {};

  const addressLine1 =
    sa.fullAddress ||
    sa.line1 ||
    sa.street ||
    [sa.city, sa.state, sa.postalCode].filter(Boolean).join(", ");

  const addressLine2 = sa.line2 || "";

  return (
    <section className="py-16 px-6 md:px-12 bg-[#FFFDF8] min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-3xl p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Below are your order details:
        </p>

        {/* Status + Payment + Pickup */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${statusColor}`}
          >
            {prettyStatus}
          </span>
          <span className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
            <CreditCard className="w-4 h-4" />{" "}
            {order.paymentMethod?.toUpperCase() || "CARD"}
          </span>
          {order.pickupTime && (
            <span className="flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-1 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" /> Pickup: {order.pickupTime}
            </span>
          )}
        </div>

        {/* Order Info */}
        <div className="text-left space-y-6">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Order Number</h2>
            <p className="text-gray-700">{order.orderNumber}</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Customer</h2>
            <p className="text-gray-700">
              {order.customerName} — {order.customerEmail}
            </p>
            {order.customerPhone && (
              <p className="text-gray-700">{order.customerPhone}</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Delivery Address
            </h2>
            <p className="text-gray-700">
              {addressLine1 || "No address available"}
            </p>
            {addressLine2 && <p className="text-gray-700">{addressLine2}</p>}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" /> Items
            </h2>
            <ul className="border border-gray-200 rounded-xl divide-y">
              {order.items?.map((item: any) => (
                <li
                  key={item.id}
                  className="flex justify-between p-3 text-sm text-gray-700"
                >
                  <span>{item.productName}</span>
                  <span>
                    {item.quantity} × ${item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4 mt-2">
            <p className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>${order.subtotal}</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span>${order.tax}</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Shipping:</span>
              <span>${order.shipping}</span>
            </p>
            <p className="flex justify-between text-lg font-semibold text-gray-900 mt-2">
              <span>Total:</span>
              <span>${order.grandTotal}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
