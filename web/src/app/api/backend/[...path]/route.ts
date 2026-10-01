import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";
import { serverEnv } from "@/lib/env";

/**
 * Backend-for-frontend: the browser calls /api/backend/*, we verify the session cookie
 * and forward to FastAPI with the server-held API token. FastAPI is never exposed publicly.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;
const NO_STORE = { "Cache-Control": "private, no-store" };

async function forward(request: NextRequest, { params }: RouteContext<"/api/backend/[...path]">) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ detail: "Your session has expired. Sign in again." }, { status: 401, headers: NO_STORE });
  }

  const { path } = await params;
  if (!path.every((segment) => SAFE_SEGMENT.test(segment))) {
    return NextResponse.json({ detail: "Invalid path" }, { status: 400, headers: NO_STORE });
  }

  const { API_URL, API_TOKEN } = serverEnv();
  const target = new URL(`/api/${path.join("/")}${request.nextUrl.search}`, API_URL);
  const hasBody = !["GET", "HEAD"].includes(request.method);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "The tracker API is unreachable." }, { status: 502, headers: NO_STORE });
  }

  return new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", ...NO_STORE },
  });
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST };
