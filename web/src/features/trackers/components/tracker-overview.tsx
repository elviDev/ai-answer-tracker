"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LocalTime } from "@/components/ui/local-time";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngineLabel } from "@/features/engines/hooks";
import { formatInterval } from "@/lib/utils/format";

import { usePrefetchTracker, useTrackers } from "../hooks";

const pad = (n: number) => String(n).padStart(2, "0");

export function TrackerOverview() {
  const { data: trackers, isPending } = useTrackers();
  const engineLabel = useEngineLabel();
  const prefetch = usePrefetchTracker();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Index</p>
          <h1 className="display mt-2 text-5xl text-fg">Trackers</h1>
        </div>
        <Link href="/dashboard/trackers/new" className={buttonClasses({ variant: "accent" })}>
          New tracker
        </Link>
      </div>

      {isPending ? (
        <Skeleton className="mt-10 h-64" />
      ) : !trackers?.length ? (
        <EmptyState
          className="mt-10"
          title="Nothing tracked yet."
          description="A tracker is one question asked to AI engines on a schedule: your brand, a few competitors, and the way a customer would phrase it."
          action={
            <Link href="/dashboard/trackers/new" className={buttonClasses({ variant: "accent" })}>
              Create your first tracker
            </Link>
          }
        />
      ) : (
        <ol className="mt-10 border-t border-ink-rule">
          {trackers.map((tracker, i) => (
            <li key={tracker.id} className="border-b border-line">
              <Link
                href={`/dashboard/trackers/${tracker.id}`}
                onMouseEnter={() => prefetch(tracker.id)}
                className="group grid gap-x-6 gap-y-2 py-5 transition-colors hover:bg-surface md:grid-cols-[2.5rem_1.2fr_1fr_11rem] md:px-2"
              >
                <span className="font-mono text-sm text-fg-subtle">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <h2 className="display text-2xl text-fg group-hover:text-accent">{tracker.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-fg-muted italic">“{tracker.prompt}”</p>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="text-fg">
                    <mark className="rounded-[2px] bg-mark px-1 text-mark-fg">{tracker.brand}</mark>
                    {tracker.competitors.length > 0 && (
                      <span className="text-fg-subtle"> vs {tracker.competitors.slice(0, 3).join(", ")}{tracker.competitors.length > 3 ? "…" : ""}</span>
                    )}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-fg-subtle uppercase">{tracker.engines.map(engineLabel).join(" · ")}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-fg-subtle md:items-end md:text-right">
                  <Badge tone={tracker.active ? "good" : "neutral"} dot>
                    {tracker.active ? formatInterval(tracker.interval_minutes) : "Paused"}
                  </Badge>
                  <span>
                    Last run <LocalTime date={tracker.last_run_at} relative />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
