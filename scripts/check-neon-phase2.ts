/**
 * Phase 2 Neon schema + trigger smoke tests (DEV Neon only).
 * Does not touch Supabase.
 *
 * Run: npx tsx --env-file=.env --env-file=.env.local scripts/check-neon-phase2.ts
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createPgPool, hostHint } from "./lib/pg-migration";

async function main() {
  const destUrl =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!destUrl) throw new Error("Missing DATABASE_URL_DIRECT");
  assert.ok(hostHint(destUrl).includes("neon"), "dest must be Neon");

  const pool = createPgPool(destUrl);
  const a = randomUUID();
  const b = randomUUID();
  const testUserId = randomUUID();

  try {
    const trig = await pool.query<{ n: number }>(`
      SELECT COUNT(*)::int AS n
      FROM information_schema.triggers
      WHERE event_object_schema = 'public'
        AND trigger_name = 'on_mission_completed'
    `);
    assert.ok(
      trig.rows[0].n > 0,
      "on_mission_completed trigger missing — apply 002"
    );

    const userTrig = await pool.query<{ n: number }>(`
      SELECT COUNT(*)::int AS n
      FROM information_schema.triggers
      WHERE event_object_schema = 'better_auth'
        AND trigger_name = 'on_better_auth_user_created'
    `);
    assert.ok(
      userTrig.rows[0].n > 0,
      "on_better_auth_user_created trigger missing — apply 002"
    );

    // Future user init trigger
    await pool.query(
      `INSERT INTO better_auth."user"
         (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
       VALUES ($1, 'Phase2 Init', $2, true, 'https://example.com/x.png', now(), now())`,
      [testUserId, `phase2-test-${testUserId}@example.com`]
    );

    const profile = await pool.query<{
      display_name: string | null;
      avatar_url: string | null;
      username: string | null;
    }>(`SELECT display_name, avatar_url, username FROM public.profiles WHERE id = $1`, [
      testUserId,
    ]);
    assert.equal(profile.rowCount, 1);
    assert.equal(profile.rows[0].display_name, "Phase2 Init");
    assert.equal(profile.rows[0].avatar_url, "https://example.com/x.png");
    assert.ok(
      profile.rows[0].username &&
        /^[A-Za-z0-9_]{3,20}$/.test(profile.rows[0].username),
      "username must be auto-assigned"
    );
    assert.ok(
      String(profile.rows[0].username).endsWith(
        testUserId.replace(/-/g, "").slice(0, 8)
      ),
      "username suffix must come from user uuid"
    );

    const progress = await pool.query<{ total_xp: number }>(
      `SELECT total_xp FROM public.user_progress WHERE user_id = $1`,
      [testUserId]
    );
    assert.equal(progress.rows[0].total_xp, 0);

    const createdEvents = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM public.integration_events
       WHERE user_id = $1 AND event_type = 'user.created'`,
      [testUserId]
    );
    assert.equal(createdEvents.rows[0].n, 1);

    // Username case-insensitive uniqueness
    await pool.query(
      `INSERT INTO better_auth."user"
         (id, name, email, "emailVerified", "createdAt", "updatedAt")
       VALUES
         ($1, 'A', $3, true, now(), now()),
         ($2, 'B', $4, true, now(), now())`,
      [
        a,
        b,
        `phase2-a-${a}@example.com`,
        `phase2-b-${b}@example.com`,
      ]
    );
    await pool.query(`UPDATE public.profiles SET username = 'Erik' WHERE id = $1`, [
      a,
    ]);

    let conflict = false;
    try {
      await pool.query(
        `UPDATE public.profiles SET username = 'erik' WHERE id = $1`,
        [b]
      );
    } catch (e) {
      const err = e as { code?: string };
      conflict = err.code === "23505";
    }
    assert.equal(conflict, true, "lower(username) must conflict Erik vs erik");

    // Mission completion + idempotency
    await pool.query(
      `UPDATE public.user_progress SET total_xp = 0 WHERE user_id = $1`,
      [testUserId]
    );

    await pool.query(
      `INSERT INTO public.mission_completions
         (user_id, kingdom_slug, mission_slug, xp_awarded)
       VALUES ($1, 'veyra', 'phase2-test-mission', 10)`,
      [testUserId]
    );

    const xp = await pool.query<{ total_xp: number }>(
      `SELECT total_xp FROM public.user_progress WHERE user_id = $1`,
      [testUserId]
    );
    assert.equal(xp.rows[0].total_xp, 10);

    const missionEvents = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM public.integration_events
       WHERE user_id = $1 AND event_type = 'mission.completed'`,
      [testUserId]
    );
    assert.equal(missionEvents.rows[0].n, 1);

    let dupBlocked = false;
    try {
      await pool.query(
        `INSERT INTO public.mission_completions
           (user_id, kingdom_slug, mission_slug, xp_awarded)
         VALUES ($1, 'veyra', 'phase2-test-mission', 10)`,
        [testUserId]
      );
    } catch (e) {
      const err = e as { code?: string };
      dupBlocked = err.code === "23505";
    }
    assert.equal(dupBlocked, true);

    const xp2 = await pool.query<{ total_xp: number }>(
      `SELECT total_xp FROM public.user_progress WHERE user_id = $1`,
      [testUserId]
    );
    assert.equal(xp2.rows[0].total_xp, 10);

    const missionEvents2 = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM public.integration_events
       WHERE user_id = $1 AND event_type = 'mission.completed'`,
      [testUserId]
    );
    assert.equal(missionEvents2.rows[0].n, 1);

    console.log("neon-phase2: ok");
  } finally {
    await pool
      .query(
        `DELETE FROM better_auth."user"
         WHERE email LIKE 'phase2-%@example.com'`
      )
      .catch(() => undefined);
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
