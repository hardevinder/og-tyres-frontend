"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, CloudSun } from "lucide-react";

export default function PickupDateTimePage() {
  const [dates, setDates] = useState<{ label: string; day: string; date: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("MORNING");
  const [sameDayPickup, setSameDayPickup] = useState(false);

  // Generate next 7 days from current date
  useEffect(() => {
    const today = new Date();
    const generatedDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const shortDay = weekday.split(" ")[0];
      const dayNum = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : shortDay;
      return { label, day: weekday, date: dayNum };
    });
    setDates(generatedDates);
    setSelectedDate(generatedDates[0].date);
  }, []);

  const pickupTimes = [
    { label: "MORNING", icon: <Sun className="w-5 h-5 text-yellow-500" />, time: "08:00–16:00" },
    { label: "EVENING", icon: <CloudSun className="w-5 h-5 text-orange-400" />, time: "16:00–00:00" },
    { label: "NIGHT", icon: <Moon className="w-5 h-5 text-indigo-400" />, time: "00:00–08:00" },
  ];

  const handleNext = () => {
    const pickupData = {
      selectedDate,
      selectedTime,
      sameDayPickup,
    };
    localStorage.setItem("pickupDetails", JSON.stringify(pickupData));
    console.log("Saved pickup:", pickupData);
    // Navigate to next step (checkout or summary)
  };

  return (
    <section className="min-h-screen bg-teal-900 flex flex-col items-center justify-center px-6 py-10 text-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-lg max-w-5xl w-full p-10"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-teal-900">
          Select Pickup Date & Time
        </h2>

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
              <button className="border rounded-xl p-3 text-center text-gray-500 hover:border-teal-400">
                <span className="text-sm">Other</span>
                <div className="text-xs">📅</div>
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6 leading-relaxed">
              “At Laundry24, we make laundry effortless! Our convenient pickup and delivery service
              ensures your clothes are professionally washed, carefully folded, and returned fresh to
              your doorstep. With attention to detail and a commitment to quality, we save you time and
              hassle so you can focus on what truly matters.”
            </p>
          </div>

          {/* Right: Time Slots */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose your pickup Time:</h3>
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

            {/* Same-day Pickup Option */}
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
              className="mt-6 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl py-3 transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
