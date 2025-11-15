"use client";

export default function CallToAction() {
  return (
    <section className="relative w-full bg-[#506600] py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto text-center text-white">
        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Start Your Journey to Natural Wellness Today
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-xl mb-10 text-gray-100">
          Discover the power of Ayurveda with our authentic herbal products —
          crafted for your health, harmony, and happiness.
        </p>

        {/* CTA Button */}
        <button className="bg-white text-[#506600] font-semibold px-8 py-4 rounded-lg shadow hover:bg-gray-100 transition">
          Explore Products
        </button>
      </div>
    </section>
  );
}
