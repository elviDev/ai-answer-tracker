import { queryOptions } from "@tanstack/react-query";

import type { HttpClient } from "@/lib/api/http";
import { queryKeys } from "@/lib/query/keys";

import { engineListSchema } from "./schemas";

export function createEnginesApi(http: HttpClient) {
  return {
    list: (signal?: AbortSignal) => http.request("/engines", engineListSchema, { signal }),
  };
}

export type EnginesApi = ReturnType<typeof createEnginesApi>;

export const engineQueries = {
  // Availability only changes when the backend restarts with new keys.
  list: (api: EnginesApi) =>
    queryOptions({ queryKey: queryKeys.engines(), queryFn: ({ signal }) => api.list(signal), staleTime: 5 * 60_000 }),
};
