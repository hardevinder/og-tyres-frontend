"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart, Clock, Leaf, ShieldCheck } from "lucide-react";

export default function LaundryHero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/address");
    }, 400);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center min-h-[500px] sm:min-h-[600px] md:min-h-screen">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/laundry-hero-poster.jpg"
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        {/* NEW VIDEO FILE */}
        <source src="/UpdateLaundry24.mp4" type="video/mp4" />
      </video>

      {/* 🌓 Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/20 z-0" />

      {/* ✨ Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto text-white w-full">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
          <span className="block text-[#E5E7EB]">Doorstep Laundry</span>
          <span className="text-[#F59E0B]">Pickup & Delivery 24×7</span>
        </h1>

        {/* Mobile Friendly Short Text */}
        <p className="text-sm sm:text-lg text-gray-200 mb-3">
          Smart laundry. Fast delivery. Fabric-safe care.
        </p>

        <p className="text-xs sm:text-sm mb-6 text-gray-300">
          Just add your address — we’ll do the rest.
        </p>

        {/* 🌟 CTA Card */}
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-5 sm:p-6 shadow-xl max-w-lg mx-auto animate-fade-up">
          {/* Button */}
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="w-full bg-[#F59E0B] hover:bg-[#d48a08] disabled:bg-gray-600 text-white rounded-full px-6 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading…</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Enter Address</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-[11px] sm:text-xs text-gray-300 mt-3">
            Secure & instant slot check
          </p>

          {/* ⚡ Quick Highlights */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-left">
            <div className="flex items-center gap-2 bg-black/30 rounded-xl px-2 py-2">
              <Clock className="w-4 h-4 text-[#FBBF24]" />
              <p className="text-[11px] text-gray-300">24×7</p>
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-xl px-2 py-2">
              <Leaf className="w-4 h-4 text-emerald-300" />
              <p className="text-[11px] text-gray-300">Fabric Care</p>
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-xl px-2 py-2">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <p className="text-[11px] text-gray-300">Secure</p>
            </div>
          </div>
        </div>

        {/* 🌍 Service Area */}
        <p className="mt-4 text-[10px] sm:text-xs text-gray-200/90">
          Serving selected locations. Expanding soon.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 1.2s ease forwards;
        }
      `}</style>
    </section>
  );
}
