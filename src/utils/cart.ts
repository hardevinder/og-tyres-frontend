// src/utils/cart.ts

/** ✅ Get backend API base */
export function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const loc = window.location.origin;
    if (loc.includes("localhost:3000"))
      return loc.replace(":3000", ":5000") + "/api";
    return loc + "/api";
  }
  return "";
}

const API = getApiBase();

/** ✅ Local storage key for session */
const SESSION_KEY = "cartSessionId";

/** ✅ Read existing sessionId */
export function readSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** ✅ Store new sessionId */
export function storeSessionId(id: string) {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {}
}

/**
 * ✅ Add item to cart.
 * - Sends variantId + quantity
 * - Stores sessionId (guest cart)
 * - Dispatches `cart-updated` event on success
 */
export async function addToCartApi({
  variantId,
  quantity = 1,
}: {
  variantId: number;
  quantity?: number;
}) {
  const sessionId = readSessionId();
  const body: any = { variantId, quantity };
  if (sessionId) body.sessionId = sessionId;

  const res = await fetch(`${API}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Add to cart failed (${res.status}): ${txt}`);
  }

  const j = await res.json();

  // ✅ Store session if server gives a new one
  if (j?.sessionId) storeSessionId(j.sessionId);

  // ✅ Fire global event so Navbar or Cart badge can refresh live
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: j }));
  }

  return j;
}

/**
 * ✅ Fetch current cart (guest or user)
 */
export async function getCartApi() {
  const sessionId = readSessionId();
  const url = new URL(`${API}/cart`);
  if (sessionId) url.searchParams.set("sessionId", sessionId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cart");

  return res.json();
}
