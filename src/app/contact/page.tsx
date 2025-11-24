"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

const LOCATIONS = [
  "Vancouver",
  "North Vancouver",
  "West Vancouver",
  "Richmond",
  "New Westminster",
  "Burnaby",
  "Coquitlam",
  "Maple Ridge",
  "Delta",
  "White Rock",
  "Langley",
  "Port Moody",
  "Pitt Meadows",
  "Surrey",
];

export default function ContactPage() {
  return (
    <>
      {/* Banner */}
      <BreadcrumbBanner
        title="Connect With Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
        background="/contact-banner.jpg"
      />

      {/* Main Section */}
      <section className="w-full bg-gradient-to-br from-[#FFFDF8] to-[#F8F9FA] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Contact Info and Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8 lg:col-span-1"
            >
              <div>
                <h2 className="text-4xl font-bold text-[#001f3f] mb-6">
                  Let's Connect
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Whether it's scheduling a pickup, asking about our services, or
                  sharing feedback, our team is always here for you. Enjoy truly
                  flexible, on-your-schedule laundry with 24×7 availability.
                </p>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                  <div className="bg-[#EA580C]/10 p-3 rounded-xl">
                    <MapPin size={24} className="text-[#EA580C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#001f3f] mb-1">
                      Metro Vancouver Coverage
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Proudly serving the Greater Vancouver Area with reliable,
                      doorstep service.
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                  <div className="bg-[#EA580C]/10 p-3 rounded-xl">
                    <Mail size={24} className="text-[#EA580C]" />
                  </div>
                  <a
                    href="mailto:info@laundry24.ca"
                    className="text-[#001f3f] hover:text-[#EA580C] transition"
                  >
                    info@laundry24.ca
                  </a>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                  <div className="bg-[#EA580C]/10 p-3 rounded-xl">
                    <Phone size={24} className="text-[#EA580C]" />
                  </div>
                  <a
                    href="tel:+16722302211"
                    className="text-[#001f3f] hover:text-[#EA580C] transition"
                  >
                    +1 (672) 230-2211
                  </a>
                </div>

                {/* 24x7 Availability */}
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                  <h3 className="font-semibold text-[#001f3f] mb-2 flex items-center gap-2">
                    <Clock size={20} className="text-[#EA580C]" />
                    Available 24×7
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    No fixed business hours — we operate round the clock. Schedule
                    pickups, drop-offs, and get support any time of the day or
                    night, 7 days a week.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2 w-full h-[500px] rounded-3xl overflow-hidden shadow-xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2602.845120995093!2d-123.1216476232473!3d49.28272997282507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54867179b1f7a6b9%3A0xb0f11df8c9edc0a9!2sVancouver%2C%20BC!5e0!3m2!1sen!2sca!4v1699999999999"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>

          {/* Service Areas */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-[#001f3f] mb-8">
              Our Service Footprint
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              We extend our premium laundry services throughout the vibrant
              communities of Metro Vancouver, ensuring convenience and quality
              wherever you are.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {LOCATIONS.map((city, idx) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-white border border-orange-50 rounded-2xl py-6 px-4 shadow-sm hover:shadow-md hover:border-[#EA580C]/20 transition-all duration-300 flex items-center justify-center"
                >
                  <CheckCircle
                    size={20}
                    className="text-[#EA580C] group-hover:scale-110 transition-transform mr-2 opacity-0 group-hover:opacity-100"
                  />
                  <p className="text-[#001f3f] font-semibold text-lg">
                    {city}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-[#001f3f] mb-6">
              Ready to Simplify Your Laundry Routine?
            </h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Schedule a pickup any time that suits you. Laundry on your timing —
              day or night, 24×7.
            </p>
            <button
              onClick={() => (window.location.href = "/address")}
              className="bg-gradient-to-r from-[#EA580C] to-[#c94a0a] text-white font-semibold px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Schedule Pickup Now
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
