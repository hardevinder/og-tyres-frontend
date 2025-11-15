"use client";

import React, { useEffect, useState } from "react";

type Toast = { id: string; text: string; type: "success" | "error" | "info" };

function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

export default function ToasterClient() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function add(t: Omit<Toast, "id">) {
      const id = uid("t_");
      setToasts((s) => [...s, { id, ...t }]);
      // auto-dismiss
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
    }

    const onUpdate = () => add({ text: "Added to cart", type: "success" });
    const onMessage = (e: any) => {
      const d = e?.detail ?? {};
      add({ text: d.text || "Message", type: d.type ?? "info" });
    };
    const onError = (e: any) => {
      const d = e?.detail ?? {};
      add({ text: d.text || "Something went wrong", type: "error" });
    };

    window.addEventListener("cart:update", onUpdate);
    window.addEventListener("cart:message", onMessage);
    window.addEventListener("cart:error", onError);
    return () => {
      window.removeEventListener("cart:update", onUpdate);
      window.removeEventListener("cart:message", onMessage);
      window.removeEventListener("cart:error", onError);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[220px] max-w-sm px-4 py-2 rounded-lg shadow-lg flex items-start gap-3 border ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="mt-0.5">
            {t.type === "success" ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            ) : t.type === "error" ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3a1 1 0 01-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 10a8 8 0 1016 0A8 8 0 002 10zm9-3a1 1 0 10-2 0v5a1 1 0 102 0V7zm0 7a1 1 0 10-2 0 1 1 0 002 0z" />
              </svg>
            )}
          </div>
          <div className="text-sm">{t.text}</div>
        </div>
      ))}
    </div>
  );
}
