import { queryOptions } from "@tanstack/react-query";

import type { HttpClient } from "@/lib/api/http";
import { queryKeys } from "@/lib/query/keys";

import { trackerStatsSchema } from "./schemas";

export function createStatsApi(http: HttpClient) {
  return {
    get: (trackerId: number, signal?: AbortSignal) =>
      http.request(`/trackers/${trackerId}/stats`, trackerStatsSchema, { signal }),
  };
}

export type StatsApi = ReturnType<typeof createStatsApi>;

export const statsQueries = {
  tracker: (api: StatsApi, trackerId: number) =>
    queryOptions({ queryKey: queryKeys.trackers.stats(trackerId), queryFn: ({ signal }) => api.get(trackerId, signal) }),
};
