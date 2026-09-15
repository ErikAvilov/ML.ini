import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Request proxy — auth gate for `/app/**` + passthrough elsewhere.
 * Cookie presence only (fast, no flash). Layout validates real session.
 * Better Auth manages its own cookies via /api/auth/*.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/app")) {
    const sessionCookie = getSessionCookie(request);
    const nextTarget = `${pathname}${search}`;

    if (!sessionCookie) {
      const login = new URL("/auth", request.url);
      login.searchParams.set("next", nextTarget);
      return NextResponse.redirect(login);
    }

    const headers = new Headers(request.headers);
    headers.set("x-mlini-pathname", nextTarget);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
