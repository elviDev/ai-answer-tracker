import { beforeEach, describe, expect, it, vi } from "vitest";

describe("session tokens", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SESSION_SECRET", "x".repeat(32));
    vi.stubEnv("ADMIN_PASSWORD", "first-password");
  });

  it("round-trips a signed session", async () => {
    const { signSession, verifySessionToken } = await import("./token");
    const session = await verifySessionToken(await signSession());
    expect(session?.sub).toBe("admin");
  });

  it("rejects tampered and missing tokens", async () => {
    const { signSession, verifySessionToken } = await import("./token");
    const token = await signSession();
    expect(await verifySessionToken(`${token.slice(0, -2)}xx`)).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it("invalidates sessions when the admin password changes", async () => {
    const first = await import("./token");
    const token = await first.signSession();

    vi.resetModules();
    vi.stubEnv("ADMIN_PASSWORD", "second-password");
    const second = await import("./token");
    expect(await second.verifySessionToken(token)).toBeNull();
  });
});
