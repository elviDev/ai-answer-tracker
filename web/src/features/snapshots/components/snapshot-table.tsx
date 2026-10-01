"use client";

import { Fragment, useState } from "react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { LocalTime } from "@/components/ui/local-time";
import type { Tracker } from "@/features/trackers/schemas";
import { cn } from "@/lib/utils/cn";

import type { Snapshot, SnapshotStatus } from "../schemas";
import { SnapshotDetail } from "./snapshot-detail";

const STATUS: Record<SnapshotStatus, { label: string; tone: BadgeTone }> = {
  success: { label: "Answered", tone: "good" },
  no_answer: { label: "No answer", tone: "warn" },
  error: { label: "Failed", tone: "bad" },
};

const COLUMNS = ["When", "Engine", "Status", "Mentioned", "Rank", "Cited", "Changed"];

export function SnapshotTable({
  snapshots,
  tracker,
  engineLabel,
}: {
  snapshots: Snapshot[];
  tracker: Tracker;
  engineLabel: (name: string) => string;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const toggle = (id: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!snapshots.length) {
    return <p className="border-t border-line py-10 text-sm text-fg-subtle">No answers yet for this filter.</p>;
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-rule text-left">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="eyebrow py-2 pr-6 font-normal whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshots.map((snapshot) => {
            const open = expanded.has(snapshot.id);
            const ok = snapshot.status === "success";
            return (
              <Fragment key={snapshot.id}>
                <tr className={cn("border-b border-line transition-colors hover:bg-surface", open && "bg-surface")}>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    <button
                      onClick={() => toggle(snapshot.id)}
                      aria-expanded={open}
                      aria-controls={`snapshot-${snapshot.id}`}
                      className="flex items-center gap-2 font-mono text-xs text-fg hover:text-accent"
                    >
                      <span aria-hidden className={cn("text-fg-subtle transition-transform", open && "rotate-90")}>
                        ›
                      </span>
                      <LocalTime date={snapshot.created_at} />
                    </button>
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap text-fg">{engineLabel(snapshot.engine)}</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    <Badge tone={STATUS[snapshot.status].tone}>{STATUS[snapshot.status].label}</Badge>
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs tabular-nums">
                    {ok ? (
                      snapshot.brand_mentioned ? (
                        <mark className="rounded-[2px] bg-mark px-1 text-mark-fg">{snapshot.mention_count}×</mark>
                      ) : (
                        <span className="text-fg-subtle">No</span>
                      )
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs tabular-nums">{snapshot.brand_rank ? `#${snapshot.brand_rank}` : "–"}</td>
                  <td className="py-3 pr-6 font-mono text-xs">{ok ? (snapshot.brand_cited ? "Yes" : "No") : "–"}</td>
                  <td className="py-3 font-mono text-xs whitespace-nowrap">
                    {snapshot.changed == null
                      ? "–"
                      : snapshot.changed
                        ? `Yes · ${Math.round((snapshot.similarity ?? 0) * 100)}% similar`
                        : "No"}
                  </td>
                </tr>
                {open && (
                  <tr id={`snapshot-${snapshot.id}`} className="border-b border-line">
                    <td colSpan={COLUMNS.length} className="py-6">
                      <SnapshotDetail snapshot={snapshot} tracker={tracker} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
