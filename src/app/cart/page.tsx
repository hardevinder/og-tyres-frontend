"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

function formatINR(n: number) {
  try {
    return n.toLocaleString("en-IN");
  } catch {
    return String(n);
  }
}

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart();

  // ✅ If any item has price 0, treat cart as "quote mode"
  const hasQuoteItems = items.some((it) => !(Number(it.price) > 0));

  // ✅ Calculate totals only for priced items (ignore price=0)
  const pricedSubtotal = items.reduce((sum, it) => {
    const price = Number(it.price) || 0;
    if (price > 0) return sum + price * (Number(it.qty) || 0);
    return sum;
  }, 0);

  // Use pricedSubtotal for display if quote items exist, else use original subtotal
  const displaySubtotal = hasQuoteItems ? pricedSubtotal : subtotal;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Header strip */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                Secure Cart
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7c25a] to-[#d79b2b]">
                  Cart
                </span>
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/80">
                Review items, update quantities, then proceed to checkout.
              </p>

              {hasQuoteItems ? (
                <div className="mt-3 text-sm text-[#f7c25a]/90">
                  Some items have <span className="font-extrabold">Price on Request</span> — you can request a quote.
                </div>
              ) : null}
            </div>

            {items.length > 0 ? (
              <button
                onClick={clear}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Clear cart
              </button>
            ) : (
              <Link
                href="/products"
                className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110 transition"
              >
                Browse Tires
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="text-xl font-extrabold text-white">Cart is empty</div>
            <div className="mt-2 text-sm text-white/80">
              Add tires from the catalogue and they’ll show up here.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black hover:brightness-110 transition"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Get Fitment Help
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Easy Updates</div>
                <div className="mt-1 text-sm font-extrabold text-white">Change qty anytime</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Fast Support</div>
                <div className="mt-1 text-sm font-extrabold text-white">Size & fitment help</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Secure Checkout</div>
                <div className="mt-1 text-sm font-extrabold text-white">Pay safely</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => {
                const hasPrice = Number(it.price) > 0;
                const lineTotal = hasPrice ? it.price * it.qty : 0;

                return (
                  <div
                    key={`${it.id}-${it.variant || ""}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* image */}
                      <div className="shrink-0">
                        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white">
                          {it.image ? (
                            <Image
                              src={it.image}
                              alt={it.name}
                              width={96}
                              height={96}
                              className="h-full w-full object-contain p-3"
                            />
                          ) : null}
                        </div>
                      </div>

                      {/* content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-extrabold text-white">{it.name}</div>
                            {it.variant ? (
                              <div className="mt-0.5 text-sm text-white/80">{it.variant}</div>
                            ) : null}

                            {/* ✅ Price pill: hide ₹0 */}
                            {hasPrice ? (
                              <div className="mt-2 inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                                ₹ {formatINR(it.price)} each
                              </div>
                            ) : (
                              <div className="mt-2 inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-xs font-extrabold text-[#f7c25a]">
                                Price on Request
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(it.id, it.variant)}
                            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-black/30 hover:text-white transition"
                          >
                            Remove
                          </button>
                        </div>

                        {/* qty row */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center rounded-2xl border border-white/10 bg-black/20">
                            <button
                              onClick={() => updateQty(it.id, it.variant, it.qty - 1)}
                              className="h-10 w-10 rounded-l-2xl text-white hover:bg-white/5 transition"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <input
                              value={it.qty}
                              onChange={(e) => updateQty(it.id, it.variant, Number(e.target.value))}
                              className="h-10 w-16 bg-transparent text-center text-sm font-semibold text-white outline-none"
                              inputMode="numeric"
                            />

                            <button
                              onClick={() => updateQty(it.id, it.variant, it.qty + 1)}
                              className="h-10 w-10 rounded-r-2xl text-white hover:bg-white/5 transition"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="ml-auto text-sm text-white/70">Line total</div>

                          {/* ✅ Line total hide for price=0 */}
                          {hasPrice ? (
                            <div className="text-lg font-extrabold text-white">
                              ₹ {formatINR(lineTotal)}
                            </div>
                          ) : (
                            <div className="text-sm font-extrabold text-[#f7c25a]">
                              Price on Request
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* continue shopping */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/products"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  ← Continue shopping
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  Need fitment help?
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 h-fit">
              <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold text-white">Order Summary</div>
                <div className="text-xs text-white/60">Taxes extra (if applicable)</div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span className="text-white">
                    {hasQuoteItems ? `₹ ${formatINR(displaySubtotal)} + Quote Items` : `₹ ${formatINR(subtotal)}`}
                  </span>
                </div>

                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-white/80">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-white/70">
                  <span>Discount</span>
                  <span className="text-white/80">—</span>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white/80">Total</span>
                <span className="text-2xl font-extrabold text-white">
                  {hasQuoteItems ? "Price on Request" : `₹ ${formatINR(subtotal)}`}
                </span>
              </div>

              {/* ✅ Checkout button changes when quote items exist */}
              {hasQuoteItems ? (
                <Link
                  href="/contact"
                  className="mt-6 block w-full rounded-2xl bg-[#f7c25a] px-4 py-3 text-center text-sm font-extrabold text-black hover:brightness-110 transition"
                >
                  Request Quote / Contact
                </Link>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-2xl bg-[#f7c25a] px-4 py-3 text-center text-sm font-extrabold text-black hover:brightness-110 transition"
                >
                  Proceed to Checkout
                </Link>
              )}

              <div className="mt-3 text-xs text-white/60">
                Tip: Confirm tyre size before checkout (e.g.{" "}
                <span className="text-white/80 font-semibold">205/55R16</span>).
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/60">Support</div>
                <div className="mt-1 text-sm font-extrabold text-white">Need help choosing?</div>
                <Link href="/contact" className="mt-2 inline-flex text-sm font-semibold text-[#f7c25a] hover:underline">
                  Talk to us →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}