import "server-only";

import { dehydrate, type QueryClient } from "@tanstack/react-query";

import { createApiClients } from "@/lib/api/clients";
import { serverHttp } from "@/lib/api/server";

import { getQueryClient } from "./client";

/**
 * Server-side prefetch: fill a request-scoped QueryClient straight from FastAPI and hand the
 * dehydrated cache to <HydrationBoundary>, so the client renders with data on first paint.
 */
export async function prefetch(load: (client: QueryClient, api: ReturnType<typeof createApiClients>) => Promise<unknown>) {
  const queryClient = getQueryClient();
  await load(queryClient, createApiClients(serverHttp()));
  return { queryClient, state: dehydrate(queryClient) };
}
