import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import GoogleSdkLoader from "../components/GoogleSdkLoader";
import type { Metadata } from "next";

// ----------------------------------------------------
// 🌐 Site Metadata
// ----------------------------------------------------
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: "Laundry24 – Pickup & Delivery Laundry Service",
  description:
    "Laundry24 offers fast, reliable, and affordable pickup & delivery laundry services available 24×7.",
  keywords: [
    "Laundry",
    "Dry Cleaning",
    "Laundry24",
    "Pickup Laundry Service",
    "Laundry Delivery",
    "Online Laundry",
    "Doorstep Laundry",
  ],
  authors: [{ name: "Laundry24" }],
  openGraph: {
    title: "Laundry24 – 24×7 Pickup Laundry Service",
    description:
      "Experience the smartest way to do laundry. Laundry24 offers doorstep pickup and delivery — clean clothes, no hassle.",
    url: "/",
    siteName: "Laundry24",
    images: [
      {
        url: "/laundry24-og.png",
        width: 1200,
        height: 630,
        alt: "Laundry24 – 24×7 Laundry Pickup Service",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laundry24 – Smart Laundry at Your Doorstep",
    description:
      "Affordable, professional laundry & dry-cleaning service with 24×7 pickup and delivery.",
    images: ["/laundry24-og.png"],
    creator: "@laundry24",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ----------------------------------------------------
// 🧺 Root Layout
// ----------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen antialiased">
        {/* ✅ Google SDK Loader (client side) */}
        <GoogleSdkLoader />

        {/* 🧭 Global Layout */}
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
