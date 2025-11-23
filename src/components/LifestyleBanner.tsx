"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LaundryLifestyleBanner() {
  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image with subtle zoom-in animation */}
      <motion.img
        src="/laundry-lifestyle-banner.jpg" // 👉 Ensure this image exists in /public
        alt="Fresh Laundry, Easy Living"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Gradient Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-2xl"
          style={{ color: "#ffffff" }}  // ✅ ALWAYS WHITE (light + dark mode)
        >
          Fresh Laundry, Easy Living
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl max-w-3xl leading-relaxed mb-8 drop-shadow"
          style={{ color: "rgba(255,255,255,0.9)" }} // ✅ Soft white in all modes
        >
          Experience convenience like never before — spotless clothes, fast
          delivery, and the freedom to focus on what matters most.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/address"
            className="inline-block bg-white text-[#F59E0B] font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-amber-500 hover:text-white hover:shadow-amber-500/40 transition-all duration-300"
          >
            Schedule a Pickup
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
