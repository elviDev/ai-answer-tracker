import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils/cn";

/** Wordmark: a highlighter stroke over a text line, the product in one glyph. */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} aria-label={`${site.name} home`} className={cn("group flex items-center gap-2.5 text-fg", className)}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect x="1" y="1" width="22" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="9" width="11" height="6" fill="var(--mark)" />
        <path d="M5 6.5h14M5 12h14M5 17.5h9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="display text-[22px] leading-none">
        Answer Tracker
      </span>
    </Link>
  );
}
