import "server-only";

type Window = { count: number; resetAt: number };

/**
 * Fixed-window, in-memory limiter for login attempts. Good enough for a single
 * Node process; swap for Redis or similar when running several instances.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, Window>();

  return {
    /** Records an attempt; returns seconds to wait if the key is over the limit, else 0. */
    hit(key: string, now = Date.now()) {
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return 0;
      }
      current.count += 1;
      return current.count > limit ? Math.ceil((current.resetAt - now) / 1000) : 0;
    },
    reset(key: string) {
      windows.delete(key);
    },
  };
}

export const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
