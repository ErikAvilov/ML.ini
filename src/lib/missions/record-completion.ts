import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCanonicalMission } from "@/lib/missions/canonical";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export type RecordMissionCompletionResult = {
  completed: true;
  alreadyCompleted: boolean;
  missionSlug: string;
  kingdomSlug: string;
  xpAwarded: number;
  totalXp: number;
};

function isUniqueConflict(error: { code?: string; message?: string }): boolean {
  if (error.code === "23505") return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("duplicate") || msg.includes("unique");
}

async function readTotalXp(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<number> {
  const { data } = await admin
    .from("user_progress")
    .select("total_xp")
    .eq("user_id", userId)
    .maybeSingle();
  return typeof data?.total_xp === "number" ? data.total_xp : 0;
}

/**
 * Persist a validated mission completion. XP comes only from mission definitions.
 * Idempotent via UNIQUE(user_id, kingdom_slug, mission_slug).
 * Does NOT insert integration_events (DB trigger owns that).
 */
export async function recordMissionCompletion(opts: {
  userId: string;
  missionId: string;
  locale?: Locale;
}): Promise<RecordMissionCompletionResult> {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  const canonical = resolveCanonicalMission(opts.missionId, locale);
  if (!canonical) {
    throw new Error("UNKNOWN_MISSION");
  }

  const { kingdomSlug, missionSlug, xpReward } = canonical;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("mission_completions")
    .select("user_id")
    .eq("user_id", opts.userId)
    .eq("kingdom_slug", kingdomSlug)
    .eq("mission_slug", missionSlug)
    .maybeSingle();

  if (existing) {
    return {
      completed: true,
      alreadyCompleted: true,
      missionSlug,
      kingdomSlug,
      xpAwarded: 0,
      totalXp: await readTotalXp(admin, opts.userId),
    };
  }

  const { error } = await admin.from("mission_completions").insert({
    user_id: opts.userId,
    kingdom_slug: kingdomSlug,
    mission_slug: missionSlug,
    xp_awarded: xpReward,
  });

  if (error) {
    if (isUniqueConflict(error)) {
      return {
        completed: true,
        alreadyCompleted: true,
        missionSlug,
        kingdomSlug,
        xpAwarded: 0,
        totalXp: await readTotalXp(admin, opts.userId),
      };
    }
    throw error;
  }

  return {
    completed: true,
    alreadyCompleted: false,
    missionSlug,
    kingdomSlug,
    xpAwarded: xpReward,
    totalXp: await readTotalXp(admin, opts.userId),
  };
}
