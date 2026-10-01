import { describe, expect, it } from "vitest";

import { loginSchema } from "./schemas";

describe("loginSchema next-path guard", () => {
  const next = (value?: string) => loginSchema.parse({ password: "x", next: value }).next;

  it("keeps same-site relative paths", () => {
    expect(next("/dashboard/trackers/3?engine=gemini")).toBe("/dashboard/trackers/3?engine=gemini");
  });

  it.each(["https://evil.example", "//evil.example", "javascript:alert(1)", "", undefined])(
    "falls back to /dashboard for %s",
    (value) => {
      expect(next(value)).toBe("/dashboard");
    },
  );
});
