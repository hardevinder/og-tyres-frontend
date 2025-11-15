"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { ArrowRight, ShoppingCart, CheckCircle } from "lucide-react";

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
  // Yukon region additions
  "Whitehorse",       // Capital city of Yukon
  "Dawson City",      // Historic town
  "Watson Lake",      // Gateway town on the Alaska Highway
  "Haines Junction",  // Near Kluane National Park
  "Carmacks",         // Small community on Yukon River
  "Mayo",             // Mining and service community
  "Faro",             // Central Yukon
  "Teslin",           // Southern Yukon
  "Yukon"             // For general coverage of the entire territory
];

export default function LaundryHero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const searchBoxRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
    region: "CA",
  });

  /* ---------------- Handle Google Place Select ---------------- */
  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const selectedAddress = place.formatted_address;
      setAddress(selectedAddress);
      setError("");

      const isServicable = SERVICABLE_LOCATIONS.some((loc) =>
        selectedAddress.toLowerCase().includes(loc.toLowerCase())
      );
      setIsValidAddress(isServicable);
      setPlaceDetails(place);

      if (!isServicable) {
        setError("Sorry! We currently serve only the Metro Vancouver Area.");
      }
    }
  };

  /* ---------------- Handle Continue ---------------- */
  const handleContinue = () => {
    if (!address || !isValidAddress || !placeDetails) {
      setError("Please enter your complete address in the Metro Vancouver Area.");
      return;
    }

    const components = placeDetails.address_components || [];
    const lat = placeDetails.geometry?.location?.lat();
    const lng = placeDetails.geometry?.location?.lng();
    const placeId = placeDetails.place_id;

    const city =
      components.find((c: any) => c.types.includes("locality"))?.long_name ||
      components.find((c: any) => c.types.includes("sublocality"))?.long_name ||
      "";
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
      placeId,
    };

    localStorage.setItem("selectedAddress", JSON.stringify(stored));

    setIsLoading(true);
    setTimeout(() => {
      router.push("/products");
    }, 700);
  };

  const handleInputFocus = () => setError("");

  // Autofocus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center min-h-[500px] sm:min-h-[600px] md:min-h-screen">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/laundry-hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/10271-1.mov" type="video/mp4" />
      </video>

      {/* 🌓 Lighter Overlay so video is visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-[#F59E0B]/15 z-0" />


      {/* ✨ Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto text-white w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <span className="text-[#E5E7EB] block sm:inline">
            THE SMARTEST WAY TO DO{" "}
          </span>
          <span className="text-[#F59E0B]">LAUNDRY</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-200 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Doorstep Pickup & Delivery Service Available{" "}
          <span className="text-[#F59E0B] font-semibold">24×7</span>
        </p>

        <p className="text-sm sm:text-base mb-5 text-gray-200 font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Enter your address below to get started – we’ll check availability instantly!
        </p>

        {/* 📍 Address Input Box */}
        <div className="relative bg-white/12 backdrop-blur-xl rounded-3xl border border-white/25 p-5 shadow-2xl max-w-xl mx-auto animate-fade-up w-full">
          {loadError && (
            <p className="text-red-400 text-sm">
              Error loading Google Maps API.
            </p>
          )}

          {!isLoaded ? (
            <p className="text-gray-200 text-sm">Loading address tools...</p>
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
                  setError("");
                  setIsValidAddress(false);
                }}
                onFocus={handleInputFocus}
                placeholder="e.g., 123 Main St, Vancouver, BC"
                className="w-full px-4 py-3 rounded-full bg-white/18 text-white placeholder-gray-300 border border-white/40 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition text-base"
              />
            </StandaloneSearchBox>
          )}

          {address && isValidAddress && (
            <div className="flex items-center gap-2 text-sm text-green-300 mt-3 bg-green-500/15 rounded-lg p-2">
              <CheckCircle className="w-4 h-4" />
              <span className="truncate">{address}</span>
            </div>
          )}

          {error && (
            <p className="text-red-300 mt-3 text-sm bg-red-500/15 rounded-lg p-2">
              {error}
            </p>
          )}

          {/* 🛒 Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading || !isValidAddress}
            className="mt-6 w-full bg-[#F59E0B] hover:bg-[#d48a08] disabled:bg-gray-600 text-white rounded-full px-6 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Continue to Services</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-xs sm:text-sm text-gray-200 mt-3 text-center">
            Serving Metro Vancouver only – fast, easy, and eco-friendly!
          </p>
        </div>
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
