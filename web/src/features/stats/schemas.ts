import { z } from "zod";

import { snapshotStatus } from "@/features/snapshots/schemas";
import { apiDate } from "@/lib/api/zod";

export const timelinePointSchema = z.object({
  snapshot_id: z.number(),
  created_at: apiDate,
  status: snapshotStatus,
  brand_mentioned: z.boolean(),
  mention_count: z.number(),
  brand_rank: z.number().nullable(),
  brand_cited: z.boolean(),
  changed: z.boolean().nullable(),
});

export const engineStatsSchema = z.object({
  engine: z.string(),
  total_runs: z.number(),
  successful_runs: z.number(),
  mention_rate: z.number().nullable(),
  citation_rate: z.number().nullable(),
  avg_rank: z.number().nullable(),
  changes: z.number(),
  competitor_mention_rate: z.record(z.string(), z.number().nullable()),
  last_run_at: apiDate.nullable(),
  timeline: z.array(timelinePointSchema),
});

export const trackerStatsSchema = z.object({
  tracker_id: z.number(),
  brand: z.string(),
  engines: z.array(engineStatsSchema),
});

export type TimelinePoint = z.infer<typeof timelinePointSchema>;
export type EngineStats = z.infer<typeof engineStatsSchema>;
export type TrackerStats = z.infer<typeof trackerStatsSchema>;
