import { createHttpClient } from "./http";

/** Browser transport: same-origin BFF route, authenticated by the session cookie. */
export const browserHttp = createHttpClient({
  baseUrl: "/api/backend",
  init: { credentials: "same-origin", cache: "no-store" },
});
