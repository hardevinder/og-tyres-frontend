import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

import type { Metadata } from "next";

// ✅ import your real components (adjust path if needed)
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ----------------------------------------------------
// 🌐 Site Metadata (Tyre)
// ----------------------------------------------------
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: "OG Tires & Rims – Premium Tyres Catalogue",
  description:
    "Explore premium tyres by category, brand and size. Static demo frontend (backend will be connected later).",
  keywords: ["Tyres", "Tire shop", "Tyre catalogue", "Car tyres", "SUV tyres", "Truck tyres", "Tyre size"],
  authors: [{ name: "OG Tires & Rims" }],
  openGraph: {
    title: "OG Tires & Rims – Premium Tyres Catalogue",
    description: "Browse tyre categories, compare sizes and build your cart. Demo UI with static data.",
    url: "/",
    siteName: "OG Tires & Rims",
    images: [
      { url: "/og-tyres.png", width: 1200, height: 630, alt: "OG Tires & Rims – Premium Tyres Catalogue" },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Tires & Rims – Premium Tyres",
    description: "Browse tyres by category and size. Demo UI (static data).",
    images: ["/og-tyres.png"],
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
// 🧺 Root Layout (Tyre)
// ----------------------------------------------------
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* ✅ make body theme-ready (your pages can still override) */}
      <body className="bg-[#050505] text-white flex flex-col min-h-screen antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}