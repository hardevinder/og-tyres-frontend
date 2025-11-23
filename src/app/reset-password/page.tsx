// app/reset-password/page.tsx
import { Suspense } from "react";
import { ResetPasswordContent } from "./ResetPasswordContent";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-600">Loading reset page...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
