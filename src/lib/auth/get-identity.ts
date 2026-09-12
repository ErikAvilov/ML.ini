import "server-only";

import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureNeonUsername, getNeonProfile } from "@/lib/data/profiles";
import { getNeonProgress } from "@/lib/data/progress";
import { buildDefaultUsername } from "@/lib/auth/username";
import type { AuthIdentity, ProfileRow } from "@/lib/auth/types";

/**
 * Full MLINI identity for SSR shell (navbar, profile, gates).
 * Better Auth session + Neon public tables only.
 */
export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    let profile = await getNeonProfile(user.id);
    const progress = await getNeonProgress(user.id);

    if (!profile) {
      profile = await getNeonProfile(user.id);
    }

    if (profile) {
      profile = await ensureNeonUsername({
        ...profile,
        display_name: profile.display_name ?? user.name,
      });
    } else {
      profile = {
        id: user.id,
        username: buildDefaultUsername(user.name, user.id),
        display_name: user.name,
        avatar_url: user.image,
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString(),
      } satisfies ProfileRow;
    }

    return {
      userId: user.id,
      email: user.email,
      profile,
      progress,
    };
  } catch {
    return null;
  }
}
