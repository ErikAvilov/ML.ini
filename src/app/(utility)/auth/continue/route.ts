import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureNeonUsername, getNeonProfile } from "@/lib/data/profiles";
import { safeInternalPath } from "@/lib/auth/safe-next";

/**
 * Post-OAuth landing for Better Auth.
 * Username is auto-assigned — no forced onboarding gate.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeInternalPath(searchParams.get("next"), "/");

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth?error=oauth_callback`);
  }

  let profile = await getNeonProfile(user.id);
  if (!profile) {
    // Brief race with DB trigger — one retry.
    profile = await getNeonProfile(user.id);
  }
  if (!profile) {
    return NextResponse.redirect(`${origin}/auth?error=profile_missing`);
  }

  await ensureNeonUsername({
    ...profile,
    display_name: profile.display_name ?? user.name,
  });

  return NextResponse.redirect(`${origin}${next}`);
}
