import { z } from "zod";

/** ISO-8601 timestamp from the API (always UTC with an offset) parsed into a Date. */
export const apiDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

/** FastAPI error body: a message, or a list of validation issues. */
export const apiErrorBody = z.object({
  detail: z.union([
    z.string(),
    z.array(z.object({ loc: z.array(z.union([z.string(), z.number()])).optional(), msg: z.string() })),
  ]),
});
