"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          id: String(product.id),
          name: product.name,
          price: Number(product.price),
          image: product.image,
          variant: product.size, // optional for tires
        })
      }
      className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 hover:bg-white/15"
    >
      Add to Cart
    </button>
  );
}