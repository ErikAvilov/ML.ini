import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/auth/safe-next";
import { isUsernameConfigured } from "@/lib/auth/username";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(`${origin}/auth?error=oauth_callback`);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        return NextResponse.redirect(`${origin}/auth?error=profile_missing`);
      }

      if (!isUsernameConfigured(profile.username)) {
        const onboarding = new URL("/onboarding/username", origin);
        onboarding.searchParams.set("next", next);
        return NextResponse.redirect(onboarding);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth_callback`);
}
