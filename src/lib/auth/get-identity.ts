import { createClient } from "@/lib/supabase/server";
import type { AuthIdentity, ProfileRow, UserProgressRow } from "@/lib/auth/types";

export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const [{ data: profile }, { data: progress }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_progress")
        .select(
          "user_id, total_xp, current_kingdom_slug, current_mission_slug"
        )
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    return {
      userId: user.id,
      email: user.email ?? null,
      profile: (profile as ProfileRow | null) ?? null,
      progress: (progress as UserProgressRow | null) ?? null,
    };
  } catch {
    return null;
  }
}
