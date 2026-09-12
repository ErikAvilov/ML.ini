/**
 * Ensure Neon schema `better_auth` exists (idempotent).
 * Uses DATABASE_URL_DIRECT when available.
 *
 * Run: npx tsx --env-file=.env --env-file=.env.local scripts/ensure-better-auth-schema.ts
 */
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL_DIRECT / DATABASE_URL");
  }

  // Do not force search_path here — we create the schema itself.
  const pool = new Pool({ connectionString, max: 1 });
  try {
    await pool.query("CREATE SCHEMA IF NOT EXISTS better_auth");
    const check = await pool.query<{ n: string }>(
      `SELECT nspname AS n FROM pg_namespace WHERE nspname = 'better_auth'`
    );
    if (!check.rows.length) {
      throw new Error("Failed to create schema better_auth");
    }
    console.log("better_auth schema: ok");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
