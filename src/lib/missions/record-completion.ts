import "server-only";

import { recordNeonMissionCompletion } from "@/lib/data/missions";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export type RecordMissionCompletionResult = {
  completed: true;
  alreadyCompleted: boolean;
  missionSlug: string;
  kingdomSlug: string;
  xpAwarded: number;
  totalXp: number;
};

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
  return recordNeonMissionCompletion({
    userId: opts.userId,
    missionId: opts.missionId,
    locale: opts.locale ?? DEFAULT_LOCALE,
  });
}
