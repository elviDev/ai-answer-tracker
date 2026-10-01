import { z } from "zod";

import { apiDate } from "@/lib/api/zod";

export const snapshotStatus = z.enum(["success", "no_answer", "error"]);
export type SnapshotStatus = z.infer<typeof snapshotStatus>;

export const sourceSchema = z.object({ title: z.string().nullable().default(""), url: z.string() });
export type Source = z.infer<typeof sourceSchema>;

export const snapshotSchema = z.object({
  id: z.number(),
  tracker_id: z.number(),
  engine: z.string(),
  prompt: z.string(),
  status: snapshotStatus,
  error: z.string().nullable(),
  duration_ms: z.number(),
  created_at: apiDate,
  answer_text: z.string().nullable(),
  sources: z.array(sourceSchema),
  brand_mentioned: z.boolean(),
  mention_count: z.number(),
  first_mention_offset: z.number().nullable(),
  brand_rank: z.number().nullable(),
  brand_cited: z.boolean(),
  competitor_mentions: z.record(z.string(), z.number()),
  changed: z.boolean().nullable(),
  similarity: z.number().nullable(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
export const snapshotListSchema = z.array(snapshotSchema);
