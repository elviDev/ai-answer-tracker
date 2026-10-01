"use client";

import { useSyncExternalStore } from "react";

import { formatDateTime, formatRelative } from "@/lib/utils/format";

const subscribe = () => () => {};

/** true only after hydration, so server HTML and the first client render always match. */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Timestamps depend on the viewer's timezone and locale, which the server doesn't know.
 * Render a stable placeholder on the server, then the local time after hydration.
 */
export function LocalTime({ date, relative = false, fallback = "never" }: { date: Date | null; relative?: boolean; fallback?: string }) {
  const isClient = useIsClient();
  if (!date) return <span>{fallback}</span>;
  return (
    <time dateTime={date.toISOString()} title={isClient ? formatDateTime(date) : undefined}>
      {isClient ? (relative ? formatRelative(date) : formatDateTime(date)) : "…"}
    </time>
  );
}
