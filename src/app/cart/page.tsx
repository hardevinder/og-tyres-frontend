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

function categoryLabel(cat?: string) {
  const value = String(cat || "").trim().toLowerCase();

  if (value === "all-terrain") return "All Terrain";
  if (value === "all-season") return "All Season";
  if (value === "winter") return "Winter";
  if (value === "performance") return "Performance";
  if (value === "light-truck") return "Light Truck";
  return value ? value : "Tire";
}

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart();

  const hasMissingPrice = items.some((it: any) => !(Number(it.price) > 0));

  const pricedSubtotal = items.reduce((sum: number, it: any) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.qty) || 0;
    if (price > 0) return sum + price * qty;
    return sum;
  }, 0);

  const displaySubtotal = hasMissingPrice ? pricedSubtotal : subtotal;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.18]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                Secure Cart
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Your{" "}
                <span className="bg-gradient-to-r from-[#f7c25a] to-[#d79b2b] bg-clip-text text-transparent">
                  Cart
                </span>
              </h1>

              <p className="mt-2 text-sm text-white/80 md:text-base">
                Review selected tires, update quantities, then proceed to book.
              </p>

              {hasMissingPrice ? (
                <div className="mt-3 text-sm text-[#f7c25a]/90">
                  Some items are missing price, but you can still continue to
                  the booking page.
                </div>
              ) : null}
            </div>

            {items.length > 0 ? (
              <button
                onClick={clear}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Clear cart
              </button>
            ) : (
              <Link
                href="/products"
                className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Browse Tires
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="text-xl font-extrabold text-white">
              Cart is empty
            </div>
            <div className="mt-2 text-sm text-white/80">
              Add tires from the catalogue and they’ll show up here.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-[#f7c25a] px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Get Fitment Help
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Easy Updates</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  Change qty anytime
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Fast Support</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  Size & fitment help
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Secure Checkout</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  Safe purchase flow
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((it: any) => {
                const hasPrice = Number(it.price) > 0;
                const qty = Number(it.qty) || 1;
                const lineTotal = hasPrice ? Number(it.price) * qty : 0;
                const title = `${it.brand ? `${it.brand} ` : ""}${it.name || "Tire"}`;

                return (
                  <div
                    key={`${it.id}-${it.variant || it.size || ""}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="shrink-0">
                        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white">
                          {it.image ? (
                            <Image
                              src={it.image}
                              alt={title}
                              width={96}
                              height={96}
                              className="h-full w-full object-contain p-3"
                            />
                          ) : null}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-extrabold text-white">
                              {title}
                            </div>

                            {it.size ? (
                              <div className="mt-1 text-sm text-white/80">
                                Size: {it.size}
                              </div>
                            ) : null}

                            {!it.size && it.variant ? (
                              <div className="mt-1 text-sm text-white/80">
                                {it.variant}
                              </div>
                            ) : null}

                            <div className="mt-2 flex flex-wrap gap-2">
                              {it.category ? (
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-white/75">
                                  {categoryLabel(it.category)}
                                </span>
                              ) : null}

                              {hasPrice ? (
                                <span className="inline-flex items-center rounded-full border border-[#f7c25a]/35 bg-[#f7c25a]/10 px-3 py-1 text-xs font-semibold text-[#f7c25a]">
                                  ₹ {formatINR(Number(it.price))} each
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-[#f7c25a]/30 bg-[#f7c25a]/10 px-3 py-1 text-xs font-extrabold text-[#f7c25a]">
                                  Price not added
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(it.id, it.variant)}
                            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-black/30 hover:text-white"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center rounded-2xl border border-white/10 bg-black/20">
                            <button
                              onClick={() =>
                                updateQty(it.id, it.variant, qty - 1)
                              }
                              className="h-10 w-10 rounded-l-2xl text-white transition hover:bg-white/5"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <input
                              value={qty}
                              onChange={(e) =>
                                updateQty(
                                  it.id,
                                  it.variant,
                                  Number(e.target.value)
                                )
                              }
                              className="h-10 w-16 bg-transparent text-center text-sm font-semibold text-white outline-none"
                              inputMode="numeric"
                            />

                            <button
                              onClick={() =>
                                updateQty(it.id, it.variant, qty + 1)
                              }
                              className="h-10 w-10 rounded-r-2xl text-white transition hover:bg-white/5"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="ml-auto text-sm text-white/70">
                            Line total
                          </div>

                          {hasPrice ? (
                            <div className="text-lg font-extrabold text-white">
                              ₹ {formatINR(lineTotal)}
                            </div>
                          ) : (
                            <div className="text-sm font-extrabold text-[#f7c25a]">
                              —
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/products"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  ← Continue shopping
                </Link>

                <Link
                  href="/contact"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Need fitment help?
                </Link>
              </div>
            </div>

            <div className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold text-white">
                  Order Summary
                </div>
                <div className="text-xs text-white/60">
                  Taxes extra (if applicable)
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span className="text-white">
                    ₹ {formatINR(displaySubtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-white/80">Calculated later</span>
                </div>

                <div className="flex justify-between text-white/70">
                  <span>Discount</span>
                  <span className="text-white/80">—</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm font-semibold text-white/80">
                  Total
                </span>
                <span className="text-2xl font-extrabold text-white">
                  ₹ {formatINR(displaySubtotal)}
                </span>
              </div>

              <Link
                href="/book"
                className="mt-6 block w-full rounded-2xl bg-[#f7c25a] px-4 py-3 text-center text-sm font-extrabold text-black transition hover:brightness-110"
              >
                Proceed to Book
              </Link>

              <div className="mt-3 text-xs text-white/60">
                Tip: Confirm tyre size before placing your order, for example{" "}
                <span className="font-semibold text-white/80">205/55R16</span>.
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/60">Support</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  Need help choosing?
                </div>
                <Link
                  href="/contact"
                  className="mt-2 inline-flex text-sm font-semibold text-[#f7c25a] hover:underline"
                >
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