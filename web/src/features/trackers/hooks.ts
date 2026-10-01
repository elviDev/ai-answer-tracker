"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryKeys } from "@/lib/query/keys";
import { useApi } from "@/providers/api-provider";
import { useRunStore } from "@/stores/run-store";
import { toast } from "@/stores/toast-store";

import { trackerQueries } from "./api";
import type { Tracker, TrackerInput, TrackerPatch } from "./schemas";

export function useTrackers() {
  const api = useApi();
  return useQuery(trackerQueries.list(api.trackers));
}

export function useTracker(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    ...trackerQueries.detail(api.trackers, id),
    // Show the row from the list cache instantly while the detail request is in flight.
    placeholderData: () =>
      queryClient.getQueryData<Tracker[]>(queryKeys.trackers.list())?.find((t) => t.id === id),
  });
}

/** Warm the cache on hover/focus so opening a tracker feels instant. */
export function usePrefetchTracker() {
  const api = useApi();
  const queryClient = useQueryClient();
  return (id: number) => {
    void queryClient.prefetchQuery(trackerQueries.detail(api.trackers, id));
  };
}

export function useCreateTracker() {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: TrackerInput) => api.trackers.create(input),
    onSuccess: (tracker) => {
      queryClient.setQueryData<Tracker[]>(queryKeys.trackers.list(), (list) => [...(list ?? []), tracker]);
      queryClient.setQueryData(queryKeys.trackers.detail(tracker.id), tracker);
      toast.success(`Tracker “${tracker.name}” created`);
      router.push(`/dashboard/trackers/${tracker.id}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Optimistically patches the tracker in every cache, rolling back if the API rejects it. */
export function useUpdateTracker(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: TrackerPatch) => api.trackers.update(id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trackers.all() });
      const previousList = queryClient.getQueryData<Tracker[]>(queryKeys.trackers.list());
      const previousDetail = queryClient.getQueryData<Tracker>(queryKeys.trackers.detail(id));
      const apply = (t: Tracker): Tracker => ({ ...t, ...patch }) as Tracker;
      queryClient.setQueryData<Tracker[]>(queryKeys.trackers.list(), (list) =>
        list?.map((t) => (t.id === id ? apply(t) : t)),
      );
      queryClient.setQueryData<Tracker>(queryKeys.trackers.detail(id), (t) => (t ? apply(t) : t));
      return { previousList, previousDetail };
    },
    onError: (error, _patch, context) => {
      queryClient.setQueryData(queryKeys.trackers.list(), context?.previousList);
      queryClient.setQueryData(queryKeys.trackers.detail(id), context?.previousDetail);
      toast.error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.trackers.list() }),
  });
}

export function useDeleteTracker(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.trackers.remove(id),
    onSuccess: () => {
      queryClient.setQueryData<Tracker[]>(queryKeys.trackers.list(), (list) => list?.filter((t) => t.id !== id));
      queryClient.removeQueries({ queryKey: queryKeys.trackers.scope(id) });
      toast.success("Tracker deleted");
      router.replace("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Starts a run and registers it so the detail view polls until every engine has answered. */
export function useRunTracker(id: number, latestSnapshotId: number) {
  const api = useApi();
  const start = useRunStore((s) => s.start);
  return useMutation({
    mutationFn: () => api.trackers.run(id),
    onSuccess: ({ engines }) => {
      start(id, { engines, baselineId: latestSnapshotId, startedAt: Date.now() });
      toast.info(`Asking ${engines.length} engine${engines.length === 1 ? "" : "s"}…`);
    },
    onError: (error) => toast.error(error.message),
  });
}
