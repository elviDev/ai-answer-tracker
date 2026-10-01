"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys, type SnapshotFilters } from "@/lib/query/keys";
import { useApi } from "@/providers/api-provider";
import { useActiveRun, useRunStore } from "@/stores/run-store";
import { toast } from "@/stores/toast-store";

import { snapshotQueries } from "./api";

const POLL_MS = 2500;
const RUN_TIMEOUT_MS = 5 * 60_000;

export function useSnapshots(trackerId: number, filters: SnapshotFilters = {}) {
  const api = useApi();
  const running = Boolean(useActiveRun(trackerId));
  return useQuery({
    ...snapshotQueries.list(api.snapshots, trackerId, filters),
    // Keep the table steady while switching filters.
    placeholderData: keepPreviousData,
    refetchInterval: running ? POLL_MS : false,
  });
}

/**
 * Watches an active run: once every engine has a snapshot newer than the run's baseline
 * (or the run times out) it ends the run and refreshes the tracker's stats.
 */
export function useRunCompletion(trackerId: number) {
  const run = useActiveRun(trackerId);
  const finish = useRunStore((s) => s.finish);
  const queryClient = useQueryClient();
  const { data: snapshots } = useSnapshots(trackerId);

  useEffect(() => {
    if (!run || !snapshots) return;
    const answered = new Set(snapshots.filter((s) => s.id > run.baselineId).map((s) => s.engine));
    const done = run.engines.every((engine) => answered.has(engine));
    const timedOut = Date.now() - run.startedAt > RUN_TIMEOUT_MS;
    if (!done && !timedOut) return;

    finish(trackerId);
    void queryClient.invalidateQueries({ queryKey: queryKeys.trackers.scope(trackerId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.trackers.list() });
    const failed = snapshots.filter((s) => s.id > run.baselineId && s.status !== "success").length;
    if (timedOut && !done) toast.error("Some engines are still running. Results will appear when they finish.");
    else if (failed) toast.error(`Run finished: ${failed} engine${failed === 1 ? "" : "s"} failed`);
    else toast.success("Run finished");
  }, [run, snapshots, finish, queryClient, trackerId]);

  return run;
}
