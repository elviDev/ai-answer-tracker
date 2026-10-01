import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

import { serverEnv } from "@/lib/env";

export const SESSION_COOKIE = "aat_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
/** Sliding expiry: re-issue the cookie once a session is older than this. */
export const SESSION_REFRESH_AFTER_SECONDS = 60 * 60 * 24;

const sessionPayloadSchema = z.object({
  sub: z.string(),
  role: z.literal("admin"),
  /** Fingerprint of the admin password; changing ADMIN_PASSWORD invalidates every session. */
  pwv: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const encoder = new TextEncoder();
const secretKey = () => encoder.encode(serverEnv().SESSION_SECRET);

async function passwordFingerprint() {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`pwv:${serverEnv().ADMIN_PASSWORD}`));
  return Array.from(new Uint8Array(digest).subarray(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "admin", pwv: await passwordFingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** Returns the session payload, or null if the token is missing, forged, expired or stale. */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const session = sessionPayloadSchema.parse(payload);
    return session.pwv === (await passwordFingerprint()) ? session : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const shouldRefresh = (session: SessionPayload, now = Date.now() / 1000) =>
  now - session.iat > SESSION_REFRESH_AFTER_SECONDS;
