import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "text-fg-muted",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  accent: "text-accent",
} as const;

export type BadgeTone = keyof typeof tones;

/** Status/tag as a mono label with a dot: reads like an instrument readout, not a pill. */
export function Badge({ tone = "neutral", dot = tone !== "neutral", className, children, ...props }: ComponentProps<"span"> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase", tones[tone], className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Bordered tag for lists of names (engines, competitors). */
export function Tag({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center rounded-[2px] border border-line px-1.5 py-0.5 font-mono text-[11px] text-fg-muted", className)} {...props} />;
}
