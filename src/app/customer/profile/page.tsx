"use client";

import React, { useEffect, useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { motion } from "framer-motion";
import { User } from "lucide-react";

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

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  isAdmin?: boolean;
}

export default function CustomerProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  function readToken(): string | null {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = readToken();
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load profile");

        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mt-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-orange-600 mb-6 text-center"
        >
          My Profile
        </motion.h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading your profile...</p>
        ) : !user ? (
          <p className="text-center text-gray-500">Unable to load profile.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-orange-200 object-cover shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 border-4 border-orange-200">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium text-gray-800">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-lg font-medium text-gray-800">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-medium text-gray-800">
                  {user.isAdmin ? "Admin" : "Customer"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
