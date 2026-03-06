import { Suspense } from "react";
import BookPageClient from "@/components/booking/BookPageClient";

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
          <div className="text-[#f7c25a] tracking-widest text-sm">
            Loading booking page...
          </div>
        </main>
      }
    >
      <BookPageClient />
    </Suspense>
  );
}