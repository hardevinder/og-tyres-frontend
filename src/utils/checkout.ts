// src/utils/checkout.ts
export type CheckoutPayload = {
  cartId?: number | null;
  sessionId?: string | null;
  paymentMethod?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
};

export type CheckoutResponse = {
  orderNumber?: string;
  data?: any;
  guestAccessToken?: string | null;
  error?: string;
};

function apiBase() {
  const env = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "") : "";
  const raw = env || (typeof window !== "undefined" ? window.location.origin : "");
  return raw.replace(/\/+$/u, "").replace(/\/api(?:\/)?$/u, "");
}

/**
 * Place checkout
 */
export async function placeCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const url = `${apiBase()}/checkout`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({ error: "Invalid response" }));
  if (!res.ok) {
    return { error: json?.error || `Status ${res.status}` };
  }
  return json as CheckoutResponse;
}

/**
 * Save guest token (simple localStorage wrapper).
 * We key by orderNumber so we can later look it up (safe).
 */
export function saveGuestToken(orderNumber: string, token: string) {
  try {
    const key = "guestOrderTokens";
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    const map = raw ? JSON.parse(raw) : {};
    map[orderNumber] = token;
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    // ignore
  }
}

export function getGuestTokenForOrder(orderNumber: string): string | null {
  try {
    const key = "guestOrderTokens";
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map?.[orderNumber] ?? null;
  } catch (e) {
    return null;
  }
}
