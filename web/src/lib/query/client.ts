import { isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/http";

/** Called when the BFF reports an expired session: send the user to log in, then back here. */
function onUnauthorized(error: unknown) {
  if (!isServer && error instanceof ApiError && error.isUnauthorized) {
    const next = `${window.location.pathname}${window.location.search}`;
    // A full navigation (not router.push) on purpose: it drops all in-memory client state after the session ends.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: onUnauthorized }),
    mutationCache: new MutationCache({ onError: onUnauthorized }),
    defaultOptions: {
      queries: {
        // Serve cached data instantly and refresh in the background after 30s.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        // Client errors (4xx) won't fix themselves on retry.
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** New client per server request (no cross-user leaks); one shared client in the browser. */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}
