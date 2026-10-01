/**
 * Hierarchical query keys. Everything about one tracker lives under ["trackers", id],
 * so a single invalidation refreshes its detail, stats and snapshots together.
 */
export type SnapshotFilters = { engine?: string; limit?: number };

export const queryKeys = {
  engines: () => ["engines"] as const,
  trackers: {
    all: () => ["trackers"] as const,
    list: () => ["trackers", "list"] as const,
    scope: (id: number) => ["trackers", id] as const,
    detail: (id: number) => ["trackers", id, "detail"] as const,
    stats: (id: number) => ["trackers", id, "stats"] as const,
    snapshots: (id: number, filters: SnapshotFilters = {}) => ["trackers", id, "snapshots", filters] as const,
  },
};
