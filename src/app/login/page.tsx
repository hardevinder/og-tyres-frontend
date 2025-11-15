// app/login/page.tsx
import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // optional: if you rely on runtime behavior

export default function LoginPageServer() {
  return (
    <main>
      {/* Suspense ensures client-only hooks (useSearchParams) are executed inside a client boundary */}
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        {/* LoginClient is a "use client" file (see LoginClient.tsx) */}
        <LoginClient />
      </Suspense>
    </main>
  );
}
