import "server-only";

import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ensureNeonUsername } from "@/lib/data/profiles";
import { getNeonProfileAndProgress } from "@/lib/data/progress";
import { loadCloudPlayerProgress } from "@/lib/data/cloud-player-progress";
import { buildDefaultUsername } from "@/lib/auth/username";
import { emptyCloudProgress } from "@/lib/progress/effective";
import type { AuthIdentity, ProfileRow } from "@/lib/auth/types";
import type { PlayerProgress } from "@/lib/types";
import { timed, perfLog, perfCount } from "@/lib/perf";

export type AppSessionState =
  | {
      status: "authenticated";
      identity: AuthIdentity;
      cloudProgress: PlayerProgress;
    }
  | {
      status: "anonymous";
    };

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

function fallbackIdentity(user: {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}): AuthIdentity {
  return {
    userId: user.id,
    email: user.email,
    profile: {
      id: user.id,
      username: buildDefaultUsername(user.name, user.id),
      display_name: user.name,
      avatar_url: user.image,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    },
    progress: {
      user_id: user.id,
      total_xp: 0,
      current_kingdom_slug: null,
      current_mission_slug: null,
    },
  };
}

/**
 * Canonical request-scoped session bootstrap for shared UI.
 * Session presence is authoritative — Neon failures never downgrade to anonymous.
 */
export const getAppSessionState = cache(async (): Promise<AppSessionState> => {
  const totalStart = performance.now();
  const user = await getCurrentUser();
  if (!user) {
    perfLog("getAppSessionState(anon)", performance.now() - totalStart);
    return { status: "anonymous" };
  }

  try {
    const n = perfCount("profileProgress");
    const [{ profile: profileRaw, progress }, cloudProgress] = await Promise.all([
      timed(`neon.profile+progress#${n}`, () =>
        getNeonProfileAndProgress(user.id)
      ),
      timed("neon.cloudPlayerProgress", () =>
        loadCloudPlayerProgress(user.id)
      ),
    ]);

    let profile = profileRaw ? mapProfile(profileRaw) : null;
    if (profile) {
      profile = await timed("neon.ensureUsername", () =>
        ensureNeonUsername({
          ...profile!,
          display_name: profile!.display_name ?? user.name,
        })
      );
      // OAuth image lives on better_auth.user; profiles.avatar_url can lag/null.
      if (!profile.avatar_url && user.image) {
        profile = { ...profile, avatar_url: user.image };
      }
    } else {
      profile = fallbackIdentity(user).profile;
    }

    const identity: AuthIdentity = {
      userId: user.id,
      email: user.email,
      profile,
      progress:
        progress ??
        ({
          user_id: user.id,
          total_xp: cloudProgress.xp,
          current_kingdom_slug: null,
          current_mission_slug: null,
        } satisfies AuthIdentity["progress"]),
    };

    perfLog("getAppSessionState(auth)", performance.now() - totalStart);
    return { status: "authenticated", identity, cloudProgress };
  } catch (err) {
    console.error("[getAppSessionState] neon degraded; session kept", err);
    perfLog("getAppSessionState(degraded)", performance.now() - totalStart);
    return {
      status: "authenticated",
      identity: fallbackIdentity(user),
      cloudProgress: emptyCloudProgress(),
    };
  }
});
