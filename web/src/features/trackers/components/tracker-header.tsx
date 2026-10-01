"use client";

import { Badge, Tag } from "@/components/ui/badge";
import { LocalTime } from "@/components/ui/local-time";
import { useEngineLabel } from "@/features/engines/hooks";
import { formatInterval } from "@/lib/utils/format";

import type { Tracker } from "../schemas";
import { TrackerActions } from "./tracker-actions";

export function TrackerHeader({ tracker }: { tracker: Tracker }) {
  const engineLabel = useEngineLabel();
  return (
    <header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="eyebrow">Tracker № {tracker.id}</p>
        <Badge tone={tracker.active ? "good" : "neutral"} dot>
          {tracker.active ? `Scheduled ${formatInterval(tracker.interval_minutes)}` : "Paused"}
        </Badge>
        <span className="eyebrow">
          Last run <LocalTime date={tracker.last_run_at} relative />
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="display text-5xl text-fg sm:text-6xl">{tracker.name}</h1>
          <p className="display mt-4 max-w-3xl text-2xl text-fg-muted italic sm:text-3xl">“{tracker.prompt}”</p>
        </div>
        <TrackerActions tracker={tracker} />
      </div>

      <dl className="mt-8 grid border-y border-line sm:grid-cols-3">
        <div className="py-3 sm:pr-5">
          <dt className="eyebrow">Brand</dt>
          <dd className="mt-1 text-sm">
            <mark className="rounded-[2px] bg-mark px-1 text-mark-fg">{tracker.brand}</mark>
            {tracker.aliases.length > 0 && <span className="text-fg-subtle"> · also {tracker.aliases.join(", ")}</span>}
          </dd>
        </div>
        <div className="border-t border-line py-3 sm:border-t-0 sm:border-l sm:px-5">
          <dt className="eyebrow">Competitors</dt>
          <dd className="mt-1 text-sm text-fg">
            {tracker.competitors.length ? (
              tracker.competitors.map((c, i) => (
                <span key={c} className="underline decoration-fg-subtle decoration-dotted underline-offset-[3px]">
                  {c}
                  {i < tracker.competitors.length - 1 && <span className="no-underline">, </span>}
                </span>
              ))
            ) : (
              <span className="text-fg-subtle">None listed</span>
            )}
          </dd>
        </div>
        <div className="border-t border-line py-3 sm:border-t-0 sm:border-l sm:pl-5">
          <dt className="eyebrow">Engines</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1">
            {tracker.engines.map((engine) => (
              <Tag key={engine}>{engineLabel(engine)}</Tag>
            ))}
          </dd>
        </div>
      </dl>
    </header>
  );
}
