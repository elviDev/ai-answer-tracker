import { queryOptions } from "@tanstack/react-query";

import type { HttpClient } from "@/lib/api/http";
import { queryKeys } from "@/lib/query/keys";

import {
  runAcceptedSchema,
  trackerListSchema,
  trackerSchema,
  type TrackerInput,
  type TrackerPatch,
} from "./schemas";

export function createTrackersApi(http: HttpClient) {
  return {
    list: (signal?: AbortSignal) => http.request("/trackers", trackerListSchema, { signal }),
    get: (id: number, signal?: AbortSignal) => http.request(`/trackers/${id}`, trackerSchema, { signal }),
    create: (input: TrackerInput) => http.request("/trackers", trackerSchema, { method: "POST", body: input }),
    update: (id: number, patch: TrackerPatch) =>
      http.request(`/trackers/${id}`, trackerSchema, { method: "PATCH", body: patch }),
    remove: (id: number) => http.send(`/trackers/${id}`, { method: "DELETE" }),
    run: (id: number) => http.request(`/trackers/${id}/run`, runAcceptedSchema, { method: "POST" }),
  };
}

export type TrackersApi = ReturnType<typeof createTrackersApi>;

export const trackerQueries = {
  list: (api: TrackersApi) =>
    queryOptions({ queryKey: queryKeys.trackers.list(), queryFn: ({ signal }) => api.list(signal) }),
  detail: (api: TrackersApi, id: number) =>
    queryOptions({ queryKey: queryKeys.trackers.detail(id), queryFn: ({ signal }) => api.get(id, signal) }),
};
