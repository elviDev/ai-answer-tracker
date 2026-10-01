import { describe, expect, it } from "vitest";

import type { EngineStats, TimelinePoint } from "../schemas";
import { dailyMentionRate } from "./daily-mention-rate";

const point = (iso: string, mentioned: boolean, status: TimelinePoint["status"] = "success"): TimelinePoint => ({
  snapshot_id: Math.random(),
  created_at: new Date(iso),
  status,
  brand_mentioned: mentioned,
  mention_count: mentioned ? 1 : 0,
  brand_rank: null,
  brand_cited: false,
  changed: null,
});

const engine = (name: string, timeline: TimelinePoint[]): EngineStats => ({
  engine: name,
  total_runs: timeline.length,
  successful_runs: timeline.length,
  mention_rate: null,
  citation_rate: null,
  avg_rank: null,
  changes: 0,
  competitor_mention_rate: {},
  last_run_at: null,
  timeline,
});

describe("dailyMentionRate", () => {
  it("buckets per local day, ignores failed runs and leaves gaps as null", () => {
    const rows = dailyMentionRate([
      engine("a", [point("2026-09-01T10:00:00", true), point("2026-09-01T12:00:00", false), point("2026-09-02T10:00:00", true)]),
      engine("b", [point("2026-09-02T09:00:00", false), point("2026-09-02T11:00:00", true, "error")]),
    ]);
    expect(rows).toEqual([
      { day: "2026-09-01", a: 50, b: null },
      { day: "2026-09-02", a: 100, b: 0 },
    ]);
  });
});
