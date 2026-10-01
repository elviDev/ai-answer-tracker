import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions, shouldRefresh, signSession, verifySessionToken } from "@/lib/auth/token";

/**
 * Optimistic auth routing + sliding sessions. Authoritative checks still happen in the
 * Data Access Layer (requireSession) and in the BFF route handler.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(login);
    response.cookies.delete(SESSION_COOKIE); // drop stale/forged cookies
    return response;
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  if (session && shouldRefresh(session)) {
    response.cookies.set(SESSION_COOKIE, await signSession(), sessionCookieOptions());
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/backend/:path*"],
};
