"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Moon, CloudSun, CheckCircle2, MapPin, Shirt, Calendar, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

export default function PickupPage() {
  const router = useRouter();

  const [dates, setDates] = useState<{ label: string; day: string; date: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("MORNING");
  const [sameDayPickup, setSameDayPickup] = useState(false);

  // ✅ Progress bar configuration
  const steps = ["Address", "Services", "Pickup Date/Time", "Checkout"];
  const currentStep = 2;
  const stepIcons = [
    <MapPin key="address" className="w-5 h-5" />,
    <Shirt key="services" className="w-5 h-5" />,
    <Calendar key="pickup" className="w-5 h-5" />,
    <ShoppingBag key="checkout" className="w-5 h-5" />,
  ];

  // ✅ Ensure user is logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login?redirect=/pickup");
    }
  }, [router]);

  // ✅ Generate next 7 days dynamically (starting from tomorrow)
  useEffect(() => {
    const today = new Date();
    const generatedDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i + 1); // 👈 +1 ensures we start from tomorrow
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const shortDay = weekday.split(" ")[0];
      const monthDay = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const label = i === 0 ? "Tomorrow" : shortDay;
      return { label, day: weekday, date: monthDay };
    });
    setDates(generatedDates);
    setSelectedDate(generatedDates[0].date); // 👈 default to tomorrow
  }, []);

  const pickupTimes = [
    { label: "MORNING", icon: <Sun className="w-5 h-5 text-yellow-500" />, time: "08:00–16:00" },
    { label: "EVENING", icon: <CloudSun className="w-5 h-5 text-orange-400" />, time: "16:00–00:00" },
    { label: "NIGHT", icon: <Moon className="w-5 h-5 text-indigo-400" />, time: "00:00–08:00" },
  ];

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both pickup date and time");
      return;
    }

    const pickupData = { selectedDate, selectedTime, sameDayPickup };
    localStorage.setItem("pickupDetails", JSON.stringify(pickupData));

    const address = localStorage.getItem("selectedAddress");
    if (!address) {
      toast.error("Please select your delivery address first");
      router.push("/checkout");
      return;
    }

    toast.success("Pickup details saved!");
    router.push("/checkout");
  };

  return (
    <>
      <BreadcrumbBanner
        title="Select Pickup Date & Time"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/products" },
          { label: "Pickup Date & Time" },
        ]}
        background="/pickup-banner.png"
      />

      <section className="w-full bg-[#FFFDF8] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="relative flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                        index <= currentStep
                          ? "bg-amber-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        stepIcons[index]
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-0">
                      <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <span key={step} className="text-xs text-gray-600 flex-1 text-center">
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "#111111" }}>
              Schedule Your Laundry Pickup
            </h1>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: "#444444" }}>
              Choose a convenient pickup date and time for your laundry. You can also opt for a same-day pickup if you need your clothes cleaned urgently.
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-lg max-w-5xl mx-auto p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose your pickup date:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`border rounded-xl p-3 text-center transition-all font-medium ${
                        selectedDate === d.date
                          ? "bg-teal-600 text-white shadow-md border-teal-600"
                          : "border-gray-300 hover:border-teal-500 hover:text-teal-700"
                      }`}
                    >
                      <div className="text-lg">{d.date}</div>
                      <div className="text-xs">{d.label}</div>
                    </button>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-6 leading-relaxed">
                  “At Laundry24, we make laundry effortless! Our convenient pickup and delivery service ensures your clothes are professionally washed, carefully folded, and returned fresh to your doorstep.”
                </p>
              </div>

              {/* Right: Times */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose your pickup time:</h3>
                <div className="space-y-3">
                  {pickupTimes.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setSelectedTime(t.label)}
                      className={`flex items-center justify-between w-full border rounded-xl p-4 transition-all ${
                        selectedTime === t.label
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-300 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {t.icon}
                        <span className="font-medium">{t.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{t.time}</span>
                    </button>
                  ))}
                </div>

                {/* Same-day Pickup */}
                <div className="flex items-center mt-5">
                  <input
                    type="checkbox"
                    id="sameDay"
                    checked={sameDayPickup}
                    onChange={(e) => setSameDayPickup(e.target.checked)}
                    className="mr-2 accent-teal-600"
                  />
                  <label htmlFor="sameDay" className="text-sm">
                    Same Day Pickup (+$9.99)
                  </label>
                </div>

                <button
                  onClick={handleNext}
                  className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full py-3 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
