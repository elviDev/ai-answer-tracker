import { queryOptions } from "@tanstack/react-query";

import type { HttpClient } from "@/lib/api/http";
import { queryKeys, type SnapshotFilters } from "@/lib/query/keys";

import { snapshotListSchema } from "./schemas";

export const DEFAULT_SNAPSHOT_LIMIT = 100;

export function createSnapshotsApi(http: HttpClient) {
  return {
    list: (trackerId: number, { engine, limit = DEFAULT_SNAPSHOT_LIMIT }: SnapshotFilters = {}, signal?: AbortSignal) =>
      http.request(`/trackers/${trackerId}/snapshots`, snapshotListSchema, { query: { engine, limit }, signal }),
  };
}

export type SnapshotsApi = ReturnType<typeof createSnapshotsApi>;

export const snapshotQueries = {
  list: (api: SnapshotsApi, trackerId: number, filters: SnapshotFilters = {}) =>
    queryOptions({
      queryKey: queryKeys.trackers.snapshots(trackerId, filters),
      queryFn: ({ signal }) => api.list(trackerId, filters, signal),
    }),
};
