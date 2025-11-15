// frontend/src/utils/resolveImageUrl.ts
export function getApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost:3000") || origin.includes("127.0.0.1:3000")) {
      return origin.replace(":3000", ":5000").replace(/\/$/, "");
    }
    return origin.replace(/\/$/, "");
  }

  return "";
}

export function resolveImageUrl(imgUrl?: string | null): string {
  if (!imgUrl) return "";
  if (/^https?:\/\//i.test(imgUrl)) return imgUrl;
  if (imgUrl.startsWith("//") && typeof window !== "undefined") return window.location.protocol + imgUrl;

  const apiBase = getApiBase();
  const root = apiBase.replace(/\/api$/, "").replace(/\/$/, "");
  const cleaned = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
  const origin = root || (typeof window !== "undefined" ? window.location.origin : "");
  return origin + cleaned;
}
