import { z } from "zod";

export const engineSchema = z.object({
  name: z.string(),
  label: z.string(),
  requires_browser: z.boolean(),
  available: z.boolean(),
  unavailable_reason: z.string().nullable(),
});

export type Engine = z.infer<typeof engineSchema>;

export const engineListSchema = z.array(engineSchema);
