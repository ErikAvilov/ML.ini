/**
 * Verify Better Auth Neon foundation (Phase 1).
 * Run: npx tsx --env-file=.env --env-file=.env.local scripts/verify-better-auth-neon.ts
 */
import assert from "node:assert/strict";
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("Missing DATABASE_URL_DIRECT / DATABASE_URL");

  const pool = new Pool({ connectionString, max: 1 });
  try {
    const schemas = await pool.query<{ nspname: string }>(
      `SELECT nspname FROM pg_namespace WHERE nspname = 'better_auth'`
    );
    assert.equal(schemas.rowCount, 1, "better_auth schema missing");

    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'better_auth'
       ORDER BY table_name`
    );
    const names = tables.rows.map((r) => r.table_name);
    for (const required of ["user", "session", "account", "verification"]) {
      assert.ok(names.includes(required), `missing table better_auth.${required}`);
    }

    const publicAuth = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('user', 'session', 'account', 'verification')`
    );
    assert.equal(
      publicAuth.rowCount,
      0,
      "Better Auth tables leaked into public schema"
    );

    const publicMlini = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN (
           'profiles',
           'user_progress',
           'mission_completions',
           'integration_events'
         )
       ORDER BY table_name`
    );
    // Phase 2+: MLINI public tables are expected on Neon (parallel copy).
    assert.equal(
      publicMlini.rowCount,
      4,
      "MLINI public tables missing on Neon (apply db/migrations/001_neon_mlini_public.sql)"
    );

    const fk = await pool.query<{ def: string }>(
      `SELECT pg_get_constraintdef(oid) AS def
       FROM pg_constraint
       WHERE conrelid = 'public.profiles'::regclass
         AND contype = 'f'`
    );
    assert.ok(
      fk.rows.some((r) => r.def.includes("better_auth") && r.def.includes("user")),
      "profiles.id must FK to better_auth.user"
    );

    const ids = await pool.query<{ table_name: string; data_type: string }>(
      `SELECT table_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'better_auth' AND column_name = 'id'
       ORDER BY table_name`
    );
    for (const row of ids.rows) {
      assert.equal(
        row.data_type,
        "uuid",
        `${row.table_name}.id expected uuid, got ${row.data_type}`
      );
    }

    // Smoke write/read on verification (safe ephemeral row)
    await pool.query(`SET search_path TO better_auth`);
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO verification (identifier, value, "expiresAt")
       VALUES ($1, $2, NOW() + interval '1 minute')
       RETURNING id`,
      [`phase1-verify-${Date.now()}`, "ok"]
    );
    assert.match(inserted.rows[0].id, /^[0-9a-f-]{36}$/i);
    await pool.query(`DELETE FROM verification WHERE id = $1`, [
      inserted.rows[0].id,
    ]);

    console.log("better-auth-neon: ok");
    console.log("tables:", names.join(", "));
    console.log(
      "id types:",
      ids.rows.map((r) => `${r.table_name}:${r.data_type}`).join(", ")
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
