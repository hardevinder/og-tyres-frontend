"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Shirt,
  Calendar,
  Phone,
  MessageSquare,
} from "lucide-react";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";

const getApiBaseUrl = () => {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost:3000")) {
      return origin.replace(":3000", ":7121") + "/api";
    }
    return origin + "/api";
  }
  return "";
};

export default function CheckoutPage() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!ready)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Initializing payment system...
      </div>
    );

  return (
    <Elements stripe={stripePromise} options={{ fonts: [] }} key="stable-stripe">
      <CheckoutContent />
    </Elements>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const apiBaseUrl = getApiBaseUrl();

  const [pickupDetails, setPickupDetails] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [placing, setPlacing] = useState(false);

  const steps = ["Address", "Services", "Pickup Date/Time", "Checkout"];
  const currentStep = 3;
  const stepIcons = [
    <MapPin key="address" className="w-5 h-5" />,
    <Shirt key="services" className="w-5 h-5" />,
    <Calendar key="pickup" className="w-5 h-5" />,
    <ShoppingBag key="checkout" className="w-5 h-5" />,
  ];

  // Load address, pickup and user from localStorage
  useEffect(() => {
    try {
      const storedAddress = localStorage.getItem("selectedAddress");
      const storedPickup = localStorage.getItem("pickupDetails");
      const storedUser = localStorage.getItem("user");

      const addr = storedAddress ? JSON.parse(storedAddress) : null;
      const u = storedUser ? JSON.parse(storedUser) : null;
      const pickup = storedPickup ? JSON.parse(storedPickup) : null;

      setAddress(addr);
      setPickupDetails(pickup);
      setUser(u);

      if (u?.phone) {
        setPhone(u.phone);
      } else if (addr?.phone) {
        setPhone(addr.phone);
      }
    } catch (err) {
      console.error("Failed to load local data", err);
    }
  }, []);

  // Ensure logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login?redirect=/checkout");
    }
  }, [router]);

  // Load cart from backend
  useEffect(() => {
    const loadCart = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(`${apiBaseUrl}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data?.data?.items?.length) {
          setCart(data.data.items);
          console.log("✅ Loaded cart from backend:", data.data.items);
        } else {
          toast.error("Your cart is empty!");
          setCart([]);
        }
      } catch (err) {
        console.error("Failed to load cart", err);
        toast.error("Unable to load cart from server");
      }
    };
    loadCart();
  }, [apiBaseUrl]);

  /* ---------------------- 💳 PLACE ORDER ---------------------- */
  const handlePlaceOrder = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe not loaded yet. Please wait.");
      return;
    }

    setPlacing(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login again.");
        router.push("/login?redirect=/checkout");
        return;
      }

      if (!cart || cart.length === 0) {
        toast.error("Your cart is empty!");
        setPlacing(false);
        return;
      }

      if (!address) {
        toast.error("Please add your address before checkout.");
        setPlacing(false);
        return;
      }

      // ✅ Flexible Canada-friendly phone validation
      const cleaned = phone.replace(/[^\d]/g, "");
      if (cleaned.length < 7 || cleaned.length > 15) {
        toast.error("📞 Please enter a valid phone number (e.g. +1 604 555 0182).");
        const input = document.querySelector<HTMLInputElement>('input[type="tel"]');
        if (input) {
          input.classList.add("ring-2", "ring-red-500", "animate-shake");
          setTimeout(
            () => input.classList.remove("ring-2", "ring-red-500", "animate-shake"),
            600
          );
          input.focus();
        }
        setPlacing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Please enter your card details.");
        setPlacing(false);
        return;
      }

      const result = await stripe.createToken(cardElement);
      if (result.error || !result.token?.id) {
        toast.error(result.error?.message || "Invalid card details");
        setPlacing(false);
        return;
      }

      // 🔹 Safe values for name & email (must NOT be empty, backend validation)
      const safeUserName = (user?.name || "").trim() || "Customer";
      const safeUserEmail =
        (user?.email || "").trim() || "laundry24@gmail.com";

      // ✅ Send cart with remarks & full customer/address details
      const payload = {
        paymentMethod: "card",
        stripeToken: result.token.id,
        customer: {
          // Always use logged-in user's name + email (so "Testing" etc)
          name: safeUserName,
          email: safeUserEmail,
          phone,
          address: {
            // send everything we have from selectedAddress
            ...(address || {}),
            // but be sure name/phone exist
            name: address?.name ?? safeUserName,
            phone,
          },
        },
        pickup: pickupDetails,
        items: cart.map((item) => ({
          variantId: item.variant?.id ?? item.variantId,
          quantity: item.quantity,
          remarks: item.remarks || "",
        })),
      };

      console.log("🟢 Sending payload:", payload);

      const res = await fetch(`${apiBaseUrl}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("❌ Checkout failed:", data);
        toast.error(data?.error || "Checkout failed.");
        setPlacing(false);
        return;
      }

      toast.success("✅ Order placed successfully!");
      router.push(`/orders/success?order=${data?.order?.orderNumber}`);
    } catch (err) {
      console.error("💥 Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ---------------------- UI ---------------------- */
  if (!address || !pickupDetails)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Loading checkout details...
      </div>
    );

  const displayAddressLine1 =
    address?.fullAddress ||
    address?.line1 ||
    address?.street ||
    address?.addressLine ||
    [
      address?.city,
      address?.state,
      address?.postalCode || address?.zip || address?.postal,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <>
      <BreadcrumbBanner
        title="Checkout"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/products" },
          { label: "Checkout" },
        ]}
        background="/checkout-banner.png"
      />

      <section className="py-20 px-6 md:px-12 bg-[#FFFDF8]">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="relative flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-amber-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        stepIcons[index]
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-0">
                      <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Checkout Section */}
          <div className="bg-white shadow-xl rounded-3xl p-10">
            <div className="flex items-center gap-3 mb-8">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Delivery Address
                </h3>
                <div className="border border-gray-200 rounded-xl p-4 mb-6">
                  <p>{displayAddressLine1}</p>
                  <p className="text-sm text-gray-500">{address?.state}</p>
                  <p className="text-sm text-gray-500">
                    Postal Code:{" "}
                    {address?.postalCode || address?.zip || address?.postal}
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" /> Contact Number
                </h3>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="w-full border border-gray-200 rounded-xl p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Pickup Details
                </h3>
                <div className="border border-gray-200 rounded-xl p-4 mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {pickupDetails?.selectedDate}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {pickupDetails?.selectedTime}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Items in Cart
                  </h3>
                  {cart.length > 0 ? (
                    <ul className="border border-gray-200 rounded-xl p-4 space-y-3">
                      {cart.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm border-b border-gray-100 pb-2 last:border-none"
                        >
                          <div className="flex justify-between">
                            <span>{item.variant?.name || "Product"}</span>
                            <span className="font-medium text-gray-700">
                              × {item.quantity}
                            </span>
                          </div>
                          {item.remarks && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-amber-600" />{" "}
                              {item.remarks}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Your cart is empty.</p>
                  )}
                </div>
              </div>

              {/* Right */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" /> Payment Details
                </h3>
                <div className="border border-gray-200 rounded-xl p-4 mb-4">
                  <CardElement
                    key="stripe-card-field"
                    options={{
                      hidePostalCode: true,
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#222",
                          "::placeholder": { color: "#999" },
                        },
                        invalid: { color: "#e5424d" },
                      },
                    }}
                  />
                </div>

                <button
                  disabled={placing || !stripe || !elements}
                  onClick={handlePlaceOrder}
                  className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition ${
                    placing
                      ? "bg-gray-400 cursor-wait"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
