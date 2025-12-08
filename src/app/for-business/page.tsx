"use client";

import { motion } from "framer-motion";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";
import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

export default function ForBusinessPage() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiBase =
        (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/i, "") ||
        window.location.origin;
      const res = await fetch(`${apiBase}/api/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send inquiry");

      setSuccess(true);
      setForm({ companyName: "", fullName: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Banner */}
      <BreadcrumbBanner
        title="For Business Partnerships"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "For Business" }]}
        background="/products-banner.png"
      />

      {/* ✅ Inquiry Section */}
      <section
        className="w-full bg-[#FFFDF8] py-20 px-6 md:px-12"
        style={{ color: "#1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* ✅ Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-4"
              style={{ color: "#111111" }}
            >
              Partner With Laundry24
            </h1>
            <p
              className="text-lg max-w-3xl mx-auto"
              style={{ color: "#444444" }}
            >
              We provide commercial laundry solutions for hotels, gyms & organisations. 
              Let’s make your laundry operations smooth and stress-free.
            </p>
          </motion.div>

          {/* ✅ Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* ✅ Form Section - Left on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                {success ? (
                  <div className="flex flex-col items-center text-center text-emerald-600">
                    <CheckCircle className="w-14 h-14 mb-4" />
                    <h2 className="text-xl font-semibold mb-1">
                      Thank you for contacting us!
                    </h2>
                    <p>Our team will get back to you shortly.</p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-6 text-sm text-orange-600 hover:underline"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="e.g. Sunrise Hotels Pvt Ltd"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={form.fullName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="+1 (604) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Tell us about your cleaning needs
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Describe your laundry requirements..."
                      />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="pt-4 text-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-medium shadow hover:bg-orange-700 transition disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Inquiry
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ✅ Content - Right on Desktop */}
            <div className="lg:col-span-1 space-y-16">
              {/* ✅ Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Dedicated Account Manager
                  </h3>
                  <p className="text-gray-600">
                    Personalised service to handle your volumes and logistics.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Next-Day Turnaround</h3>
                  <p className="text-gray-600">
                    Fast, reliable cleaning to keep your operations running.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Eco-Friendly & Premium Care
                  </h3>
                  <p className="text-gray-600">
                    High-quality cleaning with sustainable detergents and processes.
                  </p>
                </div>
              </div>

              {/* ✅ How It Works */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                <ol className="space-y-8 text-gray-700">
                  <li>
                    <strong>1. Enquiry & Signup:</strong> Fill the form or call us, we’ll discuss your needs and onboard you.
                  </li>
                  <li>
                    <strong>2. Scheduled Pickup:</strong> We pick up your linen/garments from your location at a convenient time.
                  </li>
                  <li>
                    <strong>3. Professional Cleaning:</strong> Our facility delivers premium care and hygiene standards.
                  </li>
                  <li>
                    <strong>4. Delivery & Feedback:</strong> Clean items delivered back on time, with your feedback handled professionally.
                  </li>
                </ol>
              </div>

              {/* ✅ Trust / Stats */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Trusted by Businesses Across India
                </h2>
                <p className="text-4xl font-extrabold text-orange-600 mb-4">
                  200+ Partners · 99% On-Time Delivery · 1-Hour Pickup Slots
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}