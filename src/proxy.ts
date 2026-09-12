import { NextResponse } from "next/server";

/**
 * Request proxy — passthrough.
 * Better Auth manages its own cookies via /api/auth/*.
 * Keep this thin unless MLINI needs more later.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
