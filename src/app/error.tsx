"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { btnSecondary } from "@/lib/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-[22px] font-bold">Something went wrong</h1>
      <p className="mt-1 text-slate-500">
        Sorry about that! Please give it another try, or come back in a moment.
      </p>
      <button type="button" onClick={reset} className={`${btnSecondary} mt-4`}>
        Try again
      </button>
    </main>
  );
}
