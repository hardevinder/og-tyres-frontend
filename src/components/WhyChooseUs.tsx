"use client";

import { Truck, Sparkles, ShieldCheck, Clock4 } from "lucide-react";

const reasons = [
  {
    icon: <Truck size={40} />,
    title: "Free Pickup & Delivery",
    desc: "We collect and deliver your clothes right at your doorstep — absolutely hassle-free.",
  },
  {
    icon: <Sparkles size={40} />,
    title: "Premium Quality Wash",
    desc: "Every fabric is treated with care using top-grade eco-friendly detergents and techniques.",
  },
  {
    icon: <Clock4 size={40} />,
    title: "On-Time Every Time",
    desc: "Your laundry is always ready when promised. Punctuality is part of our service culture.",
  },
  {
    icon: <ShieldCheck size={40} />,
    title: "Safe & Hygienic Handling",
    desc: "From collection to delivery, each garment is handled in a sanitized and secure environment.",
  },
];

export default function WhyChooseLaundry() {
  return (
    <section className="w-full bg-[#f9faf6] py-16 px-6 md:px-12">
      {/* Heading */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1E1B17]">
          Why Choose Our Laundry Service
        </h2>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          We make your laundry experience smarter, faster, and more reliable —
          with care that goes beyond clean.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
          >
            <div className="flex justify-center text-[#F59E0B] mb-4">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#1E1B17] mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
