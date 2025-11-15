"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderNumber = searchParams.get("order");

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) {
        console.warn("⚠️ No order number in URL");
        return;
      }

      try {
        // Get token from localStorage (auth or guest)
        const token =
          localStorage.getItem("authToken") ||
          localStorage.getItem("guestAccessToken");

        if (!token) {
          toast.error("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:7121/api/orders/${orderNumber}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 👈 send token
          },
        });

        console.log("🔍 Fetch:", res.status);

        if (!res.ok) throw new Error(`Order not found (${res.status})`);

        const data = await res.json();
        setOrder(data.data);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        toast.error("Sorry, we couldn't find that order.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-600 mb-4">Sorry, we couldn’t find that order.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-6 min-h-screen"
    >
      <h1 className="text-3xl font-semibold text-center mb-6">Order Successful 🎉</h1>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-medium">Order Number: {order.orderNumber}</h2>
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.customerEmail}</p>
        <p><strong>Total:</strong> ₹{order.grandTotal}</p>

        <div>
          <h3 className="font-semibold mt-4 mb-2">Items:</h3>
          <ul className="divide-y">
            {order.items.map((item: any) => (
              <li key={item.id} className="py-2">
                {item.productName} × {item.quantity} — ₹{item.total}
              </li>
            ))}
          </ul>
        </div>

        {order.invoicePdfPath && (
          <a
            href={`http://localhost:7121/invoices/${order.invoicePdfPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Download Invoice (PDF)
          </a>
        )}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
}
