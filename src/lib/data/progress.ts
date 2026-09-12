import "server-only";

import { getNeonAppPool } from "@/lib/db/neon";
import type { UserProgressRow } from "@/lib/auth/types";

export async function getNeonProgress(
  userId: string
): Promise<UserProgressRow | null> {
  const pool = getNeonAppPool();
  const res = await pool.query<{
    user_id: string;
    total_xp: number;
    current_kingdom_slug: string | null;
    current_mission_slug: string | null;
  }>(
    `SELECT user_id, total_xp, current_kingdom_slug, current_mission_slug
     FROM user_progress
     WHERE user_id = $1`,
    [userId]
  );
  if (!res.rowCount) return null;
  return res.rows[0];
}

export async function getNeonTotalXp(userId: string): Promise<number> {
  const progress = await getNeonProgress(userId);
  return progress?.total_xp ?? 0;
}
