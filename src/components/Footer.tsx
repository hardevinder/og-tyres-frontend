"use client";

import Image from "next/image";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        {/* Left Section - Logo & About */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center mb-4">
           <Image
                src="/laundry24-logo.png"
              alt="Laundry24 Logo"
              width={180}
              height={60}
              className="object-contain"
              unoptimized // ✅ added
              />

          </div>

          <p className="text-sm leading-relaxed mb-4 max-w-sm">
            "At Laundry24, we provide high-quality laundry services that fit your busy
            lifestyle. Your laundry will be cleaned, fresh, and delivered on time—so you
            can focus on what matters most."
          </p>

          {/* Social Icons — no links */}
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-[#F59E0B]">
              <Facebook size={22} />
            </span>
            <span className="text-[#F59E0B]">
              <Instagram size={22} />
            </span>
            <span className="text-[#F59E0B]">
              <MessageCircle size={22} />
            </span>
          </div>
        </div>

        {/* Middle Section - Locations */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Locations</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="space-y-1">
              <p>Vancouver</p>
              <p>North Vancouver</p>
              <p>West Vancouver</p>
              <p>Richmond</p>
              <p>New Westminister</p>
              <p>Burnaby</p>
              <p>Coquitlam</p>
            </div>
            <div className="space-y-1">
              <p>Maple Ridge</p>
              <p>Delta</p>
              <p>White Rock</p>
              <p>Langley</p>
              <p>Port Moody</p>
              <p>Pitt Meadows</p>
              <p>Surrey</p>
            </div>
          </div>
        </div>

        {/* Right Section - Contact Info */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Contact us</h4>
          <ul className="text-sm space-y-2">
            <li>
              <a
                href="mailto:info@laundry24.ca"
                className="hover:text-[#F59E0B] transition"
              >
                info@laundry24.ca
              </a>
            </li>
            <li>
              <a
                href="tel:+16722302211"
                className="hover:text-[#F59E0B] transition"
              >
                +1 (672) 230-2211
              </a>
            </li>
            <li className="font-semibold">Available 24×7</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        Copyrights © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-700">Laundry24</span>. All Rights Reserved.
      </div>
    </footer>
  );
}
