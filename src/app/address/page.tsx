"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, Shirt, Calendar, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import BreadcrumbBanner from "@/components/BreadcrumbBanner";
import toast from "react-hot-toast";

const SERVICABLE_LOCATIONS = [
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

  // Yukon region
  "Whitehorse",
  "Dawson City",
  "Watson Lake",
  "Haines Junction",
  "Carmacks",
  "Mayo",
  "Faro",
  "Teslin",
  "Yukon"
];


export default function AddressPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchBoxRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
    region: "CA",
  });

  const steps = ["Address", "Services", "Pickup Date/Time", "Checkout"];
  const currentStep = 0;
  const stepIcons = [
    <MapPin key="address" className="w-5 h-5" />,
    <Shirt key="services" className="w-5 h-5" />,
    <Calendar key="pickup" className="w-5 h-5" />,
    <ShoppingBag key="checkout" className="w-5 h-5" />,
  ];

  /* ---------------- Handle Google Address Selection ---------------- */
  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || !places.length) return;
    const place = places[0];
    const selectedAddress = place.formatted_address;
    setAddress(selectedAddress);
    setError("");

    const isServicable = SERVICABLE_LOCATIONS.some((loc) =>
      selectedAddress.toLowerCase().includes(loc.toLowerCase())
    );
    setIsValid(isServicable);
    setPlaceDetails(place);

    if (!isServicable) {
      setError("Sorry! We currently serve only the Metro Vancouver Area.");
    }
  };

  /* ---------------- Save Address & Continue ---------------- */
  const handleContinue = () => {
    if (!address || !isValid || !placeDetails) {
      setError("Please enter a valid address in Metro Vancouver Area.");
      return;
    }

    const components = placeDetails.address_components || [];
    const lat = placeDetails.geometry?.location?.lat();
    const lng = placeDetails.geometry?.location?.lng();

    const city =
      components.find((c: any) => c.types.includes("locality"))?.long_name || "";
    const state =
      components.find((c: any) =>
        c.types.includes("administrative_area_level_1")
      )?.short_name || "";
    const postalCode =
      components.find((c: any) => c.types.includes("postal_code"))?.long_name ||
      "";

    const stored = {
      name: "Hardevinder Singh",
      phone: "9999999999",
      line1: address,
      city,
      state,
      postalCode,
      fullAddress: address,
      latitude: lat,
      longitude: lng,
      placeId: placeDetails.place_id,
    };

    localStorage.setItem("selectedAddress", JSON.stringify(stored));
    toast.success("Address saved successfully!");

    setLoading(true);
    setTimeout(() => {
      router.push("/products");
    }, 800);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {/* 🌆 Hero Banner */}
      <BreadcrumbBanner
        title="Enter Your Address to Get Started"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Address" }]}
        background="/address-banner.jpg"
      />

      <section className="w-full bg-[#FFFDF8] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* 🧭 Progress Bar */}
          <div className="mb-12">
            <div className="relative flex items-center">
              {steps.map((step, index) => (
                <div key={step} className="flex-1 flex flex-col items-center">
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

                  {index < steps.length - 1 && (
                    <motion.div
                      className="absolute top-5 left-0 right-0 h-1 bg-gray-200"
                      initial={false}
                      animate={{
                        background: index < currentStep ? "#F59E0B" : "#E5E7EB",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <span
                  key={step}
                  className="text-xs text-gray-600 flex-1 text-center"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* 🏠 Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl mx-auto text-center border border-gray-100"
          >
            <h1 className="text-3xl font-bold mb-3 text-gray-900">
              Enter Your Address
            </h1>
            <p className="text-gray-600 mb-6">
              We’ll check if your area is within our service range.
            </p>

            {loadError && (
              <p className="text-red-500">
                Error loading Google Maps API. Please try again.
              </p>
            )}

            {!isLoaded ? (
              <p className="text-gray-400">Loading map tools...</p>
            ) : (
              <StandaloneSearchBox
                onLoad={(ref) => (searchBoxRef.current = ref)}
                onPlacesChanged={handlePlacesChanged}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setIsValid(false);
                    setError("");
                  }}
                  placeholder="e.g., 123 Main St, Vancouver, BC"
                  className="w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </StandaloneSearchBox>
            )}

            {isValid && (
              <div className="flex items-center justify-center gap-2 mt-3 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">{address}</span>
              </div>
            )}

            {error && (
              <p className="text-red-500 mt-3 text-sm bg-red-50 py-2 px-3 rounded-full inline-block">
                {error}
              </p>
            )}

            <button
              onClick={handleContinue}
              disabled={loading || !isValid}
              className="mt-8 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-semibold rounded-full py-3 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? "Processing..." : "Continue to Services →"}
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
