// pages/products/[slug].tsx
import React from "react";
import { GetServerSideProps } from "next";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

type Props = { product?: any };

export default function ProductPage({ product }: Props) {
  if (!product) {
    return <div className="p-12 text-center">Product not found</div>;
  }
  const priceRaw = product.variants?.[0]?.salePrice ?? product.variants?.[0]?.price ?? null;
  const price = priceRaw ? (typeof priceRaw === "string" ? parseFloat(priceRaw) : priceRaw) : null;

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <div className="text-emerald-600 font-semibold text-xl">{price ? `₹${Number(price).toFixed(2)}` : "Price on request"}</div>
      {/* rest similar to app router example */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };
  const base = process.env.NEXT_PUBLIC_API_URL ?? ""; // or use absolute path to your backend
  const res = await fetch(`${base}/api/products/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    return { notFound: true };
  }
  const json = await res.json();
  const product = json?.data ?? json?.product ?? json ?? null;
  if (!product) return { notFound: true };
  return { props: { product } };
};