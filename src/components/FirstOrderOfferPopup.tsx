"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Percent, Sparkles } from "lucide-react";

type FirstOrderOfferPopupProps = {
  storageKey?: string;
};

const FirstOrderOfferPopup: React.FC<FirstOrderOfferPopupProps> = ({
  storageKey = "first_order_offer_seen",
}) => {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = window.localStorage.getItem(storageKey);
    setOpen(!seen);
  }, [storageKey]);

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }
  };

  if (open === null || !open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-sm">
      {/* Popup Card */}
      <div className="relative max-w-md w-[90%] rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white px-6 pt-5 pb-6">
        
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full bg-black/40 hover:bg-black/70"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-200" />
        </button>

        {/* Icon + Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-black/50 border border-white/15 flex items-center justify-center">
            <Percent className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-black/40 border border-white/20 uppercase tracking-wide text-gray-100">
            <Sparkles className="w-3 h-3 text-[#FBBF24]" />
            New customer offer
          </span>
        </div>

        {/* White small text */}
        <p className="text-xs text-white text-center mb-1">
          Enjoy your first pickup
        </p>

        {/* Heading – manually colored */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-center mb-2">
          <span className="text-white">Flat </span>
          <span className="text-[#F59E0B]">10% OFF</span>
          <span className="text-white"> on your first order</span>
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-200 text-center mb-3">
          Experience smart laundry, fast delivery and fabric-safe care with{" "}
          <span className="font-semibold">Laundry24</span>. A special welcome
          offer just for your first pickup.
        </p>

        <div className="text-[10px] sm:text-[11px] text-gray-300 text-center mb-5 space-y-1">
          <p>Valid only for first-time customers on eligible bookings.</p>
          <p>No promo code required — discount is applied automatically.</p>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <Link href="/address" onClick={handleClose} className="block w-full">
            <button
              type="button"
              className="w-full bg-[#F59E0B] hover:bg-[#d48a08] text-white rounded-full px-6 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span>Book Pickup Now</span>
            </button>
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-full border border-white/25 bg-black/30 px-5 py-2 text-[11px] sm:text-xs font-medium text-gray-200 hover:bg-black/50 transition"
          >
            Not now, maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstOrderOfferPopup;
