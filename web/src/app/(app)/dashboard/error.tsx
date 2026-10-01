"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-xl border border-bad/40 bg-surface p-6">
      <h1 className="font-semibold text-fg">Something went wrong</h1>
      <p className="mt-2 text-sm text-fg-muted">
        {error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")
          ? "The tracker API is unreachable. Is the FastAPI server running?"
          : "The dashboard hit an unexpected error."}
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-fg-subtle">Ref: {error.digest}</p>}
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
