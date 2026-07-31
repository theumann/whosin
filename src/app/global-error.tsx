"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Catches errors in the root layout itself, which error.tsx can't — Next.js
// requires this to render its own <html>/<body> since the layout is gone.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
          <h1>Something went wrong</h1>
          <p>Sorry about that! Please refresh the page.</p>
        </main>
      </body>
    </html>
  );
}
