"use client";

import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-dialog";
import { useSnapshots } from "@/features/snapshots/hooks";
import { useActiveRun } from "@/stores/run-store";

import { useDeleteTracker, useRunTracker, useUpdateTracker } from "../hooks";
import type { Tracker } from "../schemas";

export function TrackerActions({ tracker }: { tracker: Tracker }) {
  const { data: snapshots } = useSnapshots(tracker.id);
  const activeRun = useActiveRun(tracker.id);
  const run = useRunTracker(tracker.id, snapshots?.[0]?.id ?? 0);
  const update = useUpdateTracker(tracker.id);
  const remove = useDeleteTracker(tracker.id);
  const running = run.isPending || Boolean(activeRun);

  return (
    <div className="flex shrink-0 flex-wrap gap-2 lg:pt-2">
      <Button variant="accent" onClick={() => run.mutate()} loading={running}>
        {running ? "Running…" : "Run now"}
      </Button>
      <Button variant="secondary" onClick={() => update.mutate({ active: !tracker.active })}>
        {tracker.active ? "Pause" : "Resume"}
      </Button>
      <ConfirmButton
        title={`Delete “${tracker.name}”?`}
        description="This permanently deletes the tracker and every stored answer. This can’t be undone."
        confirmLabel="Delete tracker"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      >
        Delete
      </ConfirmButton>
    </div>
  );
}
