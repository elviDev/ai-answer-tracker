import { dayKey } from "@/lib/utils/format";

import type { EngineStats } from "../schemas";

export type DailyRow = { day: string } & Record<string, number | null | string>;

/**
 * Buckets each engine's successful runs by local day and returns, per day,
 * the % of answers that mentioned the brand. Days an engine didn't run are null.
 */
export function dailyMentionRate(stats: EngineStats[]): DailyRow[] {
  const buckets = new Map<string, Map<string, { hits: number; runs: number }>>();

  for (const { engine, timeline } of stats) {
    for (const point of timeline) {
      if (point.status !== "success") continue;
      const day = dayKey(point.created_at);
      const perEngine = buckets.get(day) ?? new Map();
      const bucket = perEngine.get(engine) ?? { hits: 0, runs: 0 };
      bucket.runs += 1;
      bucket.hits += point.brand_mentioned ? 1 : 0;
      perEngine.set(engine, bucket);
      buckets.set(day, perEngine);
    }
  }

  return [...buckets.keys()].sort().map((day) => {
    const row: DailyRow = { day };
    for (const { engine } of stats) {
      const bucket = buckets.get(day)?.get(engine);
      row[engine] = bucket ? Math.round((100 * bucket.hits) / bucket.runs) : null;
    }
    return row;
  });
}
