import "server-only";

import { getNeonAppPool } from "@/lib/db/neon";
import { getNeonTotalXp } from "@/lib/data/progress";
import { resolveCanonicalMission } from "@/lib/missions/canonical";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export type NeonMissionCompletionResult = {
  completed: true;
  alreadyCompleted: boolean;
  missionSlug: string;
  kingdomSlug: string;
  xpAwarded: number;
  totalXp: number;
};

/**
 * Trusted Neon persistence. XP only from mission definitions.
 * Side effects (XP + mission.completed event) owned by DB trigger.
 */
export async function recordNeonMissionCompletion(opts: {
  userId: string;
  missionId: string;
  locale?: Locale;
}): Promise<NeonMissionCompletionResult> {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  const canonical = resolveCanonicalMission(opts.missionId, locale);
  if (!canonical) {
    throw new Error("UNKNOWN_MISSION");
  }

  const { kingdomSlug, missionSlug, xpReward } = canonical;
  const pool = getNeonAppPool();

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO mission_completions
       (user_id, kingdom_slug, mission_slug, xp_awarded)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, kingdom_slug, mission_slug) DO NOTHING
     RETURNING id`,
    [opts.userId, kingdomSlug, missionSlug, xpReward]
  );

  const alreadyCompleted = (inserted.rowCount ?? 0) === 0;
  const totalXp = await getNeonTotalXp(opts.userId);

  return {
    completed: true,
    alreadyCompleted,
    missionSlug,
    kingdomSlug,
    xpAwarded: alreadyCompleted ? 0 : xpReward,
    totalXp,
  };
}
