"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { Truck, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";

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

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function readToken(): string | null {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = readToken();
        if (!token) return;
        const res = await fetch(`${API}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setOrders(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // 📊 Dashboard Calculations
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, o) => sum + parseFloat(o.grandTotal || "0"),
    0
  );

  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;
  const cancelledCount = orders.filter((o) => o.orderStatus === "cancelled").length;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="text-yellow-500 h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="text-green-500 h-4 w-4" />;
      case "cancelled":
        return <XCircle className="text-red-500 h-4 w-4" />;
      default:
        return <Truck className="text-orange-500 h-4 w-4" />;
    }
  };

  return (
    <CustomerLayout>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-orange-600 mb-8"
      >
        Dashboard Overview
      </motion.h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
      ) : (
        <div className="space-y-8">
          {/* 🔸 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-orange-100 border border-orange-200 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{totalOrders}</p>
            </div>

            <div className="p-6 bg-green-100 border border-green-200 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">Total Spent</p>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="text-green-700 h-5 w-5" />
                <p className="text-3xl font-bold text-green-700">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-6 bg-yellow-100 border border-yellow-200 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">{pendingCount}</p>
            </div>

            <div className="p-6 bg-red-100 border border-red-200 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500">Cancelled Orders</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{cancelledCount}</p>
            </div>
          </div>

          {/* 🔸 Recent Orders Table */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Recent Orders
            </h2>

            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">You have no orders yet.</p>
            ) : (
              <div className="overflow-hidden border rounded-xl">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-orange-600 text-white text-left">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-t hover:bg-orange-50 transition-all">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {o.orderNumber}
                        </td>
                        <td className="px-4 py-3">${o.grandTotal}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          {getStatusIcon(o.orderStatus)}
                          <span className="capitalize">{o.orderStatus}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
