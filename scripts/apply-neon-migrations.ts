/**
 * Apply versioned SQL files under db/migrations/ to Neon (DATABASE_URL_DIRECT).
 *
 * Usage:
 *   npx tsx --env-file=.env --env-file=.env.local scripts/apply-neon-migrations.ts
 *   npx tsx ... scripts/apply-neon-migrations.ts --only 001
 *   npx tsx ... scripts/apply-neon-migrations.ts --only 002
 *   npx tsx ... scripts/apply-neon-migrations.ts --only 000
 */
import fs from "node:fs";
import path from "node:path";
import { createPgPool, hostHint } from "./lib/pg-migration";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

const FILES: Record<string, string> = {
  "000": "000_disable_runtime_triggers.sql",
  "001": "001_neon_mlini_public.sql",
  "002": "002_neon_runtime_triggers.sql",
  "003": "003_auto_username_on_signup.sql",
};

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const destUrl =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!destUrl) throw new Error("Missing DATABASE_URL_DIRECT / DATABASE_URL");

  console.log("DEST:", hostHint(destUrl));
  if (!hostHint(destUrl).includes("neon")) {
    throw new Error("Abort: destination does not look like Neon");
  }

  const keys = only ? [only] : ["001"];
  // Default apply only 001; 000/002 are explicit (ordering matters for migration).

  const pool = createPgPool(destUrl);
  try {
    for (const key of keys) {
      const file = FILES[key];
      if (!file) throw new Error(`Unknown migration key: ${key}`);
      const full = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(full, "utf8");
      console.log(`Applying ${file}...`);
      await pool.query(sql);
      console.log(`OK ${file}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
