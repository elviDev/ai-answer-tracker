import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("blocks after the limit and resets after the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limiter.hit("ip", 0)).toBe(0);
    expect(limiter.hit("ip", 10)).toBe(0);
    expect(limiter.hit("ip", 20)).toBeGreaterThan(0);
    expect(limiter.hit("other", 20)).toBe(0);
    expect(limiter.hit("ip", 1001)).toBe(0);
  });

  it("reset clears a key", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.hit("ip", 0);
    limiter.reset("ip");
    expect(limiter.hit("ip", 1)).toBe(0);
  });
});
