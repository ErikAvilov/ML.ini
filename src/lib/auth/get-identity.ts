import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureNeonUsername, getNeonProfile } from "@/lib/data/profiles";
import { getNeonProgress } from "@/lib/data/progress";
import { buildDefaultUsername } from "@/lib/auth/username";
import type { AuthIdentity, ProfileRow } from "@/lib/auth/types";
import { timed, perfLog } from "@/lib/perf";

/**
 * Full MLINI identity for SSR shell (navbar, profile, gates).
 * Better Auth session + Neon public tables only.
 * Request-scoped via React cache() so layout + page share one resolution.
 */
export const getAuthIdentity = cache(async (): Promise<AuthIdentity | null> => {
  const totalStart = performance.now();
  try {
    const user = await getCurrentUser();
    if (!user) {
      perfLog("getAuthIdentity(anon)", performance.now() - totalStart);
      return null;
    }

    // Independent once user.id is known — avoid sequential Neon waterfall.
    const [profileRaw, progress] = await Promise.all([
      timed("neon.profile", () => getNeonProfile(user.id)),
      timed("neon.progress", () => getNeonProgress(user.id)),
    ]);

    let profile = profileRaw;

    if (profile) {
      profile = await timed("neon.ensureUsername", () =>
        ensureNeonUsername({
          ...profile!,
          display_name: profile!.display_name ?? user.name,
        })
      );
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

    perfLog("getAuthIdentity(total)", performance.now() - totalStart);
    return {
      userId: user.id,
      email: user.email,
      profile,
      progress,
    };
  } catch {
    perfLog("getAuthIdentity(error)", performance.now() - totalStart);
    return null;
  }
});
