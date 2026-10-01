import { createEnginesApi } from "@/features/engines/api";
import { createSnapshotsApi } from "@/features/snapshots/api";
import { createStatsApi } from "@/features/stats/api";
import { createTrackersApi } from "@/features/trackers/api";

import type { HttpClient } from "./http";

/** Composition root: wires every feature API to one transport. */
export function createApiClients(http: HttpClient) {
  return {
    engines: createEnginesApi(http),
    trackers: createTrackersApi(http),
    snapshots: createSnapshotsApi(http),
    stats: createStatsApi(http),
  };
}

export type ApiClients = ReturnType<typeof createApiClients>;
