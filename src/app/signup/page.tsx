import { Suspense } from "react";
import SignupClient from "./SignupClient";

function SignupFallback() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_18%_22%,rgba(247,194,90,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(247,194,90,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-14">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur md:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-32 rounded-full bg-white/10" />
              <div className="h-10 w-72 rounded-xl bg-white/10" />
              <div className="h-4 w-96 max-w-full rounded bg-white/10" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-12 rounded-2xl bg-white/10" />
                <div className="h-12 rounded-2xl bg-white/10" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-12 rounded-2xl bg-white/10" />
                <div className="h-12 rounded-2xl bg-white/10" />
              </div>

              <div className="h-12 rounded-2xl bg-white/10" />
              <div className="h-12 rounded-2xl bg-white/10" />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-12 rounded-2xl bg-white/10" />
                <div className="h-12 rounded-2xl bg-white/10" />
                <div className="h-12 rounded-2xl bg-white/10" />
              </div>

              <div className="h-12 rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupClient />
    </Suspense>
  );
}