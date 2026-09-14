/**
 * Self-check: Neon pooler may RESET session vars between checkouts while
 * node-pg reuses Client objects — search_path must be set on every checkout.
 * Run: npx tsx --env-file=.env --env-file=.env.local scripts/check-neon-search-path.ts
 */
import assert from "node:assert/strict";
import { getNeonAuthPool, getNeonAppPool } from "../src/lib/db/neon";

async function assertSchema(
  label: string,
  connect: () => Promise<{
    query: (sql: string) => Promise<{ rows: Array<Record<string, unknown>> }>;
    release: () => void;
  }>,
  expected: string,
  probeSql: string
) {
  const a = await connect();
  try {
    await a.query("RESET ALL");
  } finally {
    a.release();
  }

  const b = await connect();
  try {
    const path = await b.query("show search_path");
    assert.equal(
      path.rows[0]?.search_path,
      expected,
      `${label}: search_path after recycle`
    );
    await b.query(probeSql);
  } finally {
    b.release();
  }
}

async function main() {
  const auth = getNeonAuthPool();
  const app = getNeonAppPool();

  await assertSchema(
    "auth",
    () => auth.connect(),
    "better_auth",
    "select 1 from session limit 1"
  );
  await assertSchema(
    "app",
    () => app.connect(),
    "public",
    "select 1 from profiles limit 1"
  );

  await auth.end();
  await app.end();
  console.log("neon-search-path: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
