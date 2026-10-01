"use server";

import { createHash, timingSafeEqual } from "node:crypto";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginLimiter } from "@/lib/auth/rate-limit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { serverEnv } from "@/lib/env";

import { loginSchema, type LoginState } from "./schemas";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time comparison so response timing doesn't leak how much of the password matched. */
const passwordMatches = (candidate: string) => timingSafeEqual(digest(candidate), digest(serverEnv().ADMIN_PASSWORD));

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldError: parsed.error.issues[0]?.message };
  }

  const key = await clientKey();
  const retryAfter = loginLimiter.hit(key);
  if (retryAfter > 0) {
    return { error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} min.` };
  }
  if (!passwordMatches(parsed.data.password)) {
    return { fieldError: "That password is not correct" };
  }

  loginLimiter.reset(key);
  await createSession();
  redirect(parsed.data.next);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
