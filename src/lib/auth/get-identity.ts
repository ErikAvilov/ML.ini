import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureNeonUsername } from "@/lib/data/profiles";
import { getNeonProfileAndProgress } from "@/lib/data/progress";
import { buildDefaultUsername } from "@/lib/auth/username";
import type { AuthIdentity, ProfileRow } from "@/lib/auth/types";
import { timed, perfLog, perfCount } from "@/lib/perf";

function mapProfile(row: {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}): ProfileRow {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

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

    const n = perfCount("profileProgress");
    const { profile: profileRaw, progress } = await timed(
      `neon.profile+progress#${n}`,
      () => getNeonProfileAndProgress(user.id)
    );

    let profile = profileRaw ? mapProfile(profileRaw) : null;

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
