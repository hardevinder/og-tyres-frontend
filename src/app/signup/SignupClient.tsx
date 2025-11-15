"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000"))
      return loc.replace(":3000", ":5000") + "/api";
    return loc + "/api";
  }
  return "";
}

const API = getApiBase();

export default function SignupClient() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAndStoreUser(token: string) {
    try {
      const meUrl = API ? `${API}/auth/me` : "/api/auth/me";
      const res = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await res.json();
      const userObj = meData?.user || meData?.data || meData;
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(userObj));
      }
    } catch (err) {
      console.warn("Signup: error calling /auth/me", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Signup failed");

      const token = data.accessToken;
      if (token) {
        localStorage.setItem("accessToken", token);
        await fetchAndStoreUser(token);
      }

      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <header className="mb-6 text-center">
          <img src="/logo.png" alt="Site logo" className="mx-auto h-12 w-auto mb-3" />
          <h1 className="text-2xl font-semibold text-[#506600]">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join our enchanted marketplace</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="mt-1 w-full border rounded-lg p-2 focus:ring-[#506600] focus:border-[#506600]"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg p-2 focus:ring-[#506600] focus:border-[#506600]"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-lg p-2 focus:ring-[#506600] focus:border-[#506600]"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {/* ✅ UPDATED SIGNUP BUTTON - ORANGE LIKE LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[#506600] font-medium hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
