"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      question: "How do I schedule a laundry pickup?",
      answer:
        "You can schedule a pickup directly through our website or app. Just enter your address, choose your preferred date and time, and confirm — it’s that simple!",
    },
    {
      question: "Do you provide same-day or express delivery?",
      answer:
        "Yes! We offer express service options for customers who need faster turnaround. Clothes can be picked up and delivered within the same day.",
    },
    {
      question: "How are my clothes washed and handled?",
      answer:
        "Each order is processed separately using premium detergents and fabric-specific cleaning methods. We ensure hygiene and freshness every time.",
    },
    {
      question: "Can I track my order in real time?",
      answer:
        "Yes, you can track your order’s progress — from pickup to delivery — in real time through your account dashboard or mobile app.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We currently accept credit/debit cards and digital wallet payments.",
    },
    {
      question: "Do you offer subscription or corporate plans?",
      answer:
        "Yes, we offer flexible monthly subscriptions for regular users and bulk service packages for hostels, hotels, and offices.",
    },
    {
      question: "What finishing do you provide after washing?",
      answer:
        "All clothes are neatly and professionally folded after cleaning.",
    },
    {
      question: "Are the detergents eco-friendly?",
      answer:
        "We use biodegradable, skin-safe detergents and energy-efficient washing systems to reduce our environmental impact.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section className="relative w-full bg-[#fafafa] py-24 px-6 md:px-12 overflow-hidden">
      {/* Heading */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1E1B17] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
          Find quick answers to common questions about our pickup, cleaning, and delivery process.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-6 py-5 text-left"
            >
              <span className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="text-[#F59E0B] w-6 h-6 transition-transform duration-200" />
              ) : (
                <ChevronDown className="text-[#F59E0B] w-6 h-6 transition-transform duration-200" />
              )}
            </button>

            {/* Content */}
            <div
              className={`px-6 pb-5 text-gray-600 text-sm md:text-base leading-relaxed transition-all duration-300 ${
                openIndex === index
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>

      {/* Background Glow */}
      <div className="absolute -top-20 left-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/15 rounded-full blur-3xl opacity-40" />
    </section>
  );
}
