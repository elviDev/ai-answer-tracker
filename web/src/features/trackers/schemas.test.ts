import { describe, expect, it } from "vitest";

import { trackerFormSchema, trackerSchema } from "./schemas";

describe("trackerFormSchema", () => {
  const valid = {
    name: "Note apps",
    brand: " Notion ",
    aliases: "Notion.so, , Notion AI, Notion.so",
    competitors: "Obsidian,Coda",
    prompt: "What is the best note-taking app?",
    engines: ["gemini"],
    interval_minutes: "1440",
  };

  it("trims, splits and de-duplicates comma lists and coerces the interval", () => {
    const parsed = trackerFormSchema.parse(valid);
    expect(parsed.brand).toBe("Notion");
    expect(parsed.aliases).toEqual(["Notion.so", "Notion AI"]);
    expect(parsed.competitors).toEqual(["Obsidian", "Coda"]);
    expect(parsed.interval_minutes).toBe(1440);
  });

  it("rejects an empty engine selection and short prompts", () => {
    const result = trackerFormSchema.safeParse({ ...valid, engines: [], prompt: "hi" });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["engines", "prompt"]));
  });
});

describe("trackerSchema", () => {
  it("parses API timestamps into Dates", () => {
    const tracker = trackerSchema.parse({
      id: 1,
      name: "x",
      brand: "y",
      aliases: [],
      competitors: [],
      prompt: "p",
      engines: ["mock"],
      interval_minutes: 60,
      active: true,
      created_at: "2026-09-30T17:21:10.926489Z",
      last_run_at: null,
    });
    expect(tracker.created_at).toBeInstanceOf(Date);
    expect(tracker.created_at.toISOString()).toBe("2026-09-30T17:21:10.926Z");
  });
});
