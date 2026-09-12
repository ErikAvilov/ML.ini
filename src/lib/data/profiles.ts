import "server-only";

import { getNeonAppPool } from "@/lib/db/neon";
import type { ProfileRow } from "@/lib/auth/types";
import {
  buildDefaultUsername,
  isUsernameConfigured,
  validateUsernameFormat,
} from "@/lib/auth/username";

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

export async function getNeonProfile(
  userId: string
): Promise<ProfileRow | null> {
  const pool = getNeonAppPool();
  const res = await pool.query<{
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `SELECT id, username, display_name, avatar_url, created_at, updated_at
     FROM profiles
     WHERE id = $1`,
    [userId]
  );
  if (!res.rowCount) return null;
  return mapProfile(res.rows[0]);
}

/**
 * If username is still NULL (legacy rows), assign default once.
 * No-op when already set. Safe under concurrent requests (WHERE username IS NULL).
 */
export async function ensureNeonUsername(
  profile: ProfileRow
): Promise<ProfileRow> {
  if (isUsernameConfigured(profile.username)) return profile;

  const candidate = buildDefaultUsername(profile.display_name, profile.id);
  if (validateUsernameFormat(candidate)) return profile;

  const pool = getNeonAppPool();
  try {
    const res = await pool.query<{
      id: string;
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `UPDATE profiles
       SET username = $1, updated_at = now()
       WHERE id = $2 AND username IS NULL
       RETURNING id, username, display_name, avatar_url, created_at, updated_at`,
      [candidate, profile.id]
    );
    if (res.rowCount) return mapProfile(res.rows[0]);
  } catch {
    // Unique race: re-read whatever won.
  }

  return (await getNeonProfile(profile.id)) ?? profile;
}

/** UX check only — DB unique index remains authority. */
export async function isNeonUsernameAvailable(
  username: string
): Promise<boolean> {
  if (validateUsernameFormat(username)) return false;
  const pool = getNeonAppPool();
  const res = await pool.query<{ available: boolean }>(
    `SELECT NOT EXISTS (
       SELECT 1 FROM profiles WHERE lower(username) = lower($1)
     ) AS available`,
    [username]
  );
  return Boolean(res.rows[0]?.available);
}

export type UpdateUsernameResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "taken" | "missing" | "failed" };

export async function updateNeonUsername(
  userId: string,
  username: string
): Promise<UpdateUsernameResult> {
  if (validateUsernameFormat(username)) {
    return { ok: false, error: "invalid" };
  }

  const pool = getNeonAppPool();
  try {
    const res = await pool.query<{ id: string }>(
      `UPDATE profiles
       SET username = $1, updated_at = now()
       WHERE id = $2
       RETURNING id`,
      [username, userId]
    );
    if (!res.rowCount) return { ok: false, error: "missing" };
    return { ok: true };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") return { ok: false, error: "taken" };
    if (code === "23514") return { ok: false, error: "invalid" };
    return { ok: false, error: "failed" };
  }
}
