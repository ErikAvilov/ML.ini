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

/** One round-trip for identity shell (profile + progress). */
export async function getNeonProfileAndProgress(userId: string): Promise<{
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  } | null;
  progress: UserProgressRow | null;
}> {
  const pool = getNeonAppPool();
  const res = await pool.query<{
    id: string | null;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    progress_user_id: string | null;
    total_xp: number | null;
    current_kingdom_slug: string | null;
    current_mission_slug: string | null;
  }>(
    `SELECT
       p.id,
       p.username,
       p.display_name,
       p.avatar_url,
       p.created_at,
       p.updated_at,
       up.user_id AS progress_user_id,
       up.total_xp,
       up.current_kingdom_slug,
       up.current_mission_slug
     FROM profiles p
     LEFT JOIN user_progress up ON up.user_id = p.id
     WHERE p.id = $1`,
    [userId]
  );

  const row = res.rows[0];
  if (!row?.id || !row.created_at || !row.updated_at) {
    return { profile: null, progress: null };
  }

  return {
    profile: {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    progress:
      row.progress_user_id != null && row.total_xp != null
        ? {
            user_id: row.progress_user_id,
            total_xp: row.total_xp,
            current_kingdom_slug: row.current_kingdom_slug,
            current_mission_slug: row.current_mission_slug,
          }
        : null,
  };
}

export async function getNeonTotalXp(userId: string): Promise<number> {
  const progress = await getNeonProgress(userId);
  return progress?.total_xp ?? 0;
}
