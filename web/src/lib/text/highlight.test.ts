import { describe, expect, it } from "vitest";

import { highlightTerms } from "./highlight";

describe("highlightTerms", () => {
  it("marks brand and competitor mentions as whole words, case-insensitively", () => {
    const segments = highlightTerms("notion beats Coda; Notionville is not Notion.", {
      brand: ["Notion"],
      competitors: ["Coda"],
    });
    expect(segments.filter((s) => s.kind)).toEqual([
      { text: "notion", kind: "brand" },
      { text: "Coda", kind: "competitor" },
      { text: "Notion", kind: "brand" },
    ]);
    expect(segments.map((s) => s.text).join("")).toBe("notion beats Coda; Notionville is not Notion.");
  });

  it("prefers the longest alias at the same position", () => {
    const segments = highlightTerms("Try Notion AI today", { brand: ["Notion", "Notion AI"], competitors: [] });
    expect(segments).toContainEqual({ text: "Notion AI", kind: "brand" });
  });

  it("returns the text untouched when there is nothing to find", () => {
    expect(highlightTerms("hello", { brand: [], competitors: [] })).toEqual([{ text: "hello" }]);
  });
});
