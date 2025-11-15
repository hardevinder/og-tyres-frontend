"use client";

import { Clock, WashingMachine, Truck } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Clock className="w-10 h-10 text-[#F59E0B]" />,
      title: "1. Schedule a Pickup",
      desc: "Select your preferred date and time. Our system instantly confirms your pickup and sends a notification to our delivery partner.",
    },
    {
      icon: <WashingMachine className="w-10 h-10 text-[#F59E0B]" />,
      title: "2. We Collect & Clean",
      desc: "Your laundry is picked up from your doorstep and processed at our professional facility — washed, dried, and neatly folded.",
    },
    {
      icon: <Truck className="w-10 h-10 text-[#F59E0B]" />,
      title: "3. Fresh Delivery",
      desc: "Within 24 hours, your clothes are delivered back fresh, clean, and ready to wear — with live tracking for complete transparency.",
    },
  ];

  return (
    <section className="relative w-full bg-[#fafafa] py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          How It Works
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          A seamless three-step process — designed to save you time and make laundry day effortless.
        </p>
      </div>

      {/* Step Cards */}
      <div className="relative grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 border border-gray-100 group"
          >
            <div className="bg-[#FFF6E5] p-6 rounded-full mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {step.icon}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {step.desc}
            </p>

            {/* Connector Arrow (between cards) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 right-[-45px] transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 opacity-70"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decorative background shapes */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#F59E0B]/5 rounded-full blur-3xl" />
    </section>
  );
}
