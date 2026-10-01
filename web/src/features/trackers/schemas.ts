import { z } from "zod";

import { apiDate } from "@/lib/api/zod";

export const trackerSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  aliases: z.array(z.string()),
  competitors: z.array(z.string()),
  prompt: z.string(),
  engines: z.array(z.string()),
  interval_minutes: z.number(),
  active: z.boolean(),
  created_at: apiDate,
  last_run_at: apiDate.nullable(),
});

export type Tracker = z.infer<typeof trackerSchema>;
export const trackerListSchema = z.array(trackerSchema);

export const runAcceptedSchema = z.object({ tracker_id: z.number(), engines: z.array(z.string()) });

const commaList = z
  .string()
  .transform((value) => [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))]);

/** What the "new tracker" form collects. Comma lists are split into arrays for the API. */
export const trackerFormSchema = z.object({
  name: z.string().trim().min(1, "Give the tracker a name").max(200),
  brand: z.string().trim().min(1, "Which brand or keyword should we look for?").max(200),
  aliases: commaList,
  competitors: commaList,
  prompt: z.string().trim().min(10, "Ask a full question (at least 10 characters)"),
  engines: z.array(z.string()).min(1, "Pick at least one engine"),
  interval_minutes: z.coerce.number<string | number>().int().min(5, "Minimum is 5 minutes").max(43_200),
});

export type TrackerFormInput = z.input<typeof trackerFormSchema>;
export type TrackerInput = z.output<typeof trackerFormSchema>;

export const trackerPatchSchema = trackerFormSchema.partial().extend({ active: z.boolean().optional() });
export type TrackerPatch = z.output<typeof trackerPatchSchema>;
