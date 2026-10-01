"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SnapshotSection } from "@/features/snapshots/components/snapshot-section";
import { useRunCompletion } from "@/features/snapshots/hooks";
import { StatsOverview } from "@/features/stats/components/stats-overview";

import { useTracker } from "../hooks";
import { TrackerHeader } from "./tracker-header";

/** Composes the tracker page; each section owns its own data and loading state. */
export function TrackerDetail({ trackerId }: { trackerId: number }) {
  const { data: tracker } = useTracker(trackerId);
  useRunCompletion(trackerId);

  if (!tracker) return <Skeleton className="h-96" />;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14">
      <TrackerHeader tracker={tracker} />
      <StatsOverview trackerId={trackerId} />
      <SnapshotSection trackerId={trackerId} />
    </div>
  );
}
