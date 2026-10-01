import "server-only";

import { serverEnv } from "@/lib/env";

import { createHttpClient } from "./http";

/** Server transport: talks to FastAPI directly with the shared API token. */
export function serverHttp() {
  const { API_URL, API_TOKEN } = serverEnv();
  return createHttpClient({
    baseUrl: `${API_URL.replace(/\/$/, "")}/api`,
    headers: (): HeadersInit => (API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    init: { cache: "no-store" },
  });
}
