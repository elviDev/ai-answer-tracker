import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySessionToken } from "./token";

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(), sessionCookieOptions());
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Current session or null. Memoized per request so layouts and pages share one verification. */
export const getSession = cache(async () => {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
});

/**
 * Data Access Layer guard: the authoritative check for protected Server Components.
 * (proxy.ts only does an optimistic redirect; this verifies the signature and expiry.)
 */
export async function requireSession(next?: string) {
  const session = await getSession();
  if (!session) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return session;
}
