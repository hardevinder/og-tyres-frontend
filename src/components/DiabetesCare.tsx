"use client";

import {
  ShieldCheck,
  Timer,
  Shirt,
  Sparkles,
  Smile,
  Leaf,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-[#F59E0B]" />,
      title: "Trusted Quality Care",
      desc: "We follow strict quality control standards, ensuring every garment is perfectly cleaned, dried, and folded before delivery.",
    },
    {
      icon: <Timer className="w-10 h-10 text-[#F59E0B]" />,
      title: "24-Hour Turnaround",
      desc: "Fast, efficient, and reliable — we collect, process, and deliver your laundry within 24 hours, guaranteed.",
    },
    {
      icon: <Shirt className="w-10 h-10 text-[#F59E0B]" />,
      title: "Expert Fabric Handling",
      desc: "From delicate silks to heavy denims, each fabric type is treated with the right cleaning method for long-lasting freshness.",
    },
    {
      icon: <Sparkles className="w-10 h-10 text-[#F59E0B]" />,
      title: "Premium Finishing",
      desc: "Your clothes are neatly pressed, lint-free, and gently packaged to ensure a wrinkle-free, ready-to-wear experience.",
    },
    {
      icon: <Leaf className="w-10 h-10 text-[#F59E0B]" />,
      title: "Eco-Friendly Cleaning",
      desc: "We use biodegradable detergents and energy-efficient machines to reduce environmental impact without compromising quality.",
    },
    {
      icon: <Smile className="w-10 h-10 text-[#F59E0B]" />,
      title: "Customer Satisfaction",
      desc: "Thousands of happy customers trust us for consistent results, affordable pricing, and top-notch customer service.",
    },
  ];

  return (
    <section
      className="relative w-full py-24 px-6 md:px-12 overflow-hidden"
      style={{
        backgroundColor: "#1E1B17", // fixed deep brown background
        colorScheme: "light", // 👈 prevents any dark mode color changes
        color: "#FFFFFF", // default text color
      }}
    >
      {/* 🧺 Heading */}
      <div className="max-w-6xl mx-auto text-center mb-16">
     <h2
        className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              style={{ color: "#FDFCF8" }}
            >
              Why Choose Us
            </h2>
        <p
          className="max-w-2xl mx-auto text-base md:text-lg"
          style={{ color: "#E5E7EB" }}
        >
          Discover why thousands trust our professional laundry service —
          where quality, speed, and care come together.
        </p>
      </div>

      {/* 🌟 Feature Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl border shadow-lg p-8 text-center transition-all duration-300 backdrop-blur-sm group"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="rounded-full p-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: "rgba(245,158,11,0.15)" }}
              >
                {feature.icon}
              </div>
            </div>
            <h3
              className="text-xl font-semibold mb-3 group-hover:text-[#F59E0B] transition-colors duration-300"
              style={{ color: "#FFFFFF" }}
            >
              {feature.title}
            </h3>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ color: "#D1D5DB" }}
            >
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ✨ Subtle Background Glow */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(42,38,31,0.6) 60%, black 100%)",
          opacity: 0.8,
        }}
      />
      <div
        className="absolute -top-20 left-0 w-64 h-64 rounded-full blur-3xl -z-10"
        style={{
          backgroundColor: "rgba(245,158,11,0.25)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl -z-10"
        style={{
          backgroundColor: "rgba(245,158,11,0.15)",
        }}
      />
    </section>
  );
}
