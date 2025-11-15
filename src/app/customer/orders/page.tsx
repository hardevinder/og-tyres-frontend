"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CustomerLayout from "@/components/customer/CustomerLayout";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000"))
      return loc.replace(":3000", ":7100") + "/api";
    return loc + "/api";
  }
  return "";
}

const API = getApiBase();

interface OrderItem {
  productName: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  orderNumber: string;
  grandTotal: string;
  paymentStatus: string;
  orderStatus?: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [repeatLoadingId, setRepeatLoadingId] = useState<number | null>(null);

  const router = useRouter();

  function readToken(): string | null {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = readToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const res = await fetch(`${API}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load orders");
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string | undefined) => {
    const normalized = (status || "").toString().toLowerCase();

    switch (normalized) {
      case "pending":
        return <Clock className="text-yellow-500 h-4 w-4" />;
      case "processing":
        return (
          <RefreshCcw className="text-blue-500 h-4 w-4 animate-spin-slow" />
        );
      case "shipped":
        return <Truck className="text-indigo-500 h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="text-green-600 h-4 w-4" />;
      case "cancelled":
      case "failed":
        return <XCircle className="text-red-500 h-4 w-4" />;
      default:
        return <ShoppingBag className="text-gray-400 h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRepeatOrder = async (orderId: number) => {
    try {
      const token = readToken();
      if (!token) {
        router.push("/login");
        return;
      }

      setRepeatLoadingId(orderId);

      const res = await fetch(`${API}/orders/${orderId}/repeat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // 👇 Fastify JSON parser ko khush rakhne ke liye empty JSON body
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to repeat order");
      }

      const cartId = data.cartId;
      // 👉 Redirect to checkout with this cartId
      if (cartId) {
        router.push(`/checkout?cartId=${cartId}`);
      } else {
        router.push("/checkout");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Unable to repeat this order right now.");
    } finally {
      setRepeatLoadingId(null);
    }
  };

  return (
    <CustomerLayout>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-orange-600 mb-8 text-center"
      >
        My Orders
      </motion.h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">You have no orders yet.</div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-orange-600 text-white text-left">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed On</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusLabel =
                  (order.orderStatus &&
                    order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)) ||
                  "Pending";

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t hover:bg-orange-50/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx}>
                          {item.productName} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{order.items.length - 2} more
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ${order.grandTotal}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {getStatusIcon(order.orderStatus)}
                      <span className="capitalize">{statusLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRepeatOrder(order.id)}
                        disabled={repeatLoadingId === order.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-500 text-orange-600 text-xs font-medium hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        {repeatLoadingId === order.id
                          ? "Repeating..."
                          : "Repeat Order"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CustomerLayout>
  );
}
