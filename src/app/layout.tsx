import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

import type { Metadata } from "next";
import { CartProvider } from "../context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "OG Tires & Rims – Premium Tyres Catalogue",
    template: "%s | OG Tires & Rims",
  },
  description:
    "Explore premium tyres by category, brand, and size. Discover dependable options for performance, comfort, durability, and everyday driving with OG Tires & Rims.",
  keywords: [
    "Tyres",
    "Tires",
    "Tyre shop",
    "Tire shop",
    "Tyre catalogue",
    "Car tyres",
    "SUV tyres",
    "Truck tyres",
    "Tyre size",
    "All terrain tyres",
    "Performance tyres",
    "Winter tyres",
    "OG Tires & Rims",
  ],
  authors: [{ name: "OG Tires & Rims" }],
  creator: "OG Tires & Rims",
  publisher: "OG Tires & Rims",
  applicationName: "OG Tires & Rims",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OG Tires & Rims – Premium Tyres Catalogue",
    description:
      "Explore premium tyres by category, brand, and size with OG Tires & Rims.",
    url: "/",
    siteName: "OG Tires & Rims",
    images: [
      {
        url: "/og-tyres.png",
        width: 1200,
        height: 630,
        alt: "OG Tires & Rims – Premium Tyres Catalogue",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Tires & Rims – Premium Tyres Catalogue",
    description:
      "Browse premium tyres by category, brand, and size with OG Tires & Rims.",
    images: ["/og-tyres.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#050505]">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-[#050505] text-white">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}