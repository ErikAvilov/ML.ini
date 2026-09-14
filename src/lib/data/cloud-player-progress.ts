import "server-only";

import { getNeonAppPool } from "@/lib/db/neon";
import { getNeonProgress } from "@/lib/data/progress";
import { getMissionBySlug } from "@/data/missions";
import {
  buildCloudPlayerProgress,
  emptyCloudProgress,
} from "@/lib/progress/effective";
import type { PlayerProgress } from "@/lib/types";

/** Mission ids completed in Neon for this user (canonical cloud unlock source). */
export async function getNeonCompletedMissionIds(
  userId: string
): Promise<string[]> {
  const pool = getNeonAppPool();
  const res = await pool.query<{ mission_slug: string }>(
    `SELECT mission_slug
     FROM mission_completions
     WHERE user_id = $1`,
    [userId]
  );

  const ids: string[] = [];
  for (const row of res.rows) {
    const mission = getMissionBySlug(row.mission_slug);
    if (mission) ids.push(mission.id);
  }
  return ids;
}

/**
 * Canonical authenticated PlayerProgress from Neon.
 * Missing user_progress row ⇒ 0 XP (not local fallback).
 */
export async function loadCloudPlayerProgress(
  userId: string
): Promise<PlayerProgress> {
  const [row, completedMissionIds] = await Promise.all([
    getNeonProgress(userId),
    getNeonCompletedMissionIds(userId),
  ]);

  if (!row && completedMissionIds.length === 0) {
    return emptyCloudProgress();
  }

  const lastPlayed = row?.current_mission_slug
    ? getMissionBySlug(row.current_mission_slug)?.id ?? null
    : null;

  return buildCloudPlayerProgress({
    totalXp: row?.total_xp ?? 0,
    completedMissionIds,
    lastPlayedMissionId: lastPlayed,
  });
}
