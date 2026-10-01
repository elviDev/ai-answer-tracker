import type { z } from "zod";

import { apiErrorBody } from "./zod";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

/**
 * Transport abstraction. Feature APIs depend on this interface, not on fetch details,
 * so the same API module runs in the browser (via the BFF) and on the server (direct).
 */
export interface HttpClient {
  request<S extends z.ZodType>(path: string, schema: S, options?: RequestOptions): Promise<z.output<S>>;
  send(path: string, options?: RequestOptions): Promise<void>;
}

type HttpClientConfig = {
  baseUrl: string;
  headers?: () => HeadersInit | Promise<HeadersInit>;
  init?: RequestInit;
};

function errorMessage(body: unknown, fallback: string) {
  const parsed = apiErrorBody.safeParse(body);
  if (!parsed.success) return fallback;
  const { detail } = parsed.data;
  return typeof detail === "string" ? detail : detail.map((d) => d.msg.replace(/^Value error, /, "")).join("; ");
}

export function createHttpClient({ baseUrl, headers, init }: HttpClientConfig): HttpClient {
  async function call(path: string, { method = "GET", body, query, signal }: RequestOptions = {}) {
    const url = new URL(`${baseUrl}${path}`, typeof window === "undefined" ? undefined : window.location.origin);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const response = await fetch(url, {
      ...init,
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(await headers?.()),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(errorMessage(payload, response.statusText || "Request failed"), response.status);
    }
    return response;
  }

  return {
    async request(path, schema, options) {
      const response = await call(path, options);
      return schema.parse(await response.json());
    },
    async send(path, options) {
      await call(path, options);
    },
  };
}
