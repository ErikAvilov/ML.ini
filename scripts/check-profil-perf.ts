/**
 * Measure Neon pool reuse vs fresh Pool cost (no secrets logged).
 * Run: MLINI_PERF_LOG=1 npx tsx --env-file=.env --env-file=.env.local scripts/check-profil-perf.ts
 */
import assert from "node:assert/strict";
import { Pool } from "pg";

async function timeQuery(label: string, pool: Pool): Promise<number> {
  const start = performance.now();
  await pool.query("SELECT 1");
  const ms = performance.now() - start;
  console.info(`[perf] ${label} ${ms.toFixed(1)}ms`);
  return ms;
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("Missing DATABASE_URL");

  // Simulate OLD production bug: new Pool every call
  const freshSamples: number[] = [];
  for (let i = 0; i < 3; i++) {
    const pool = new Pool({ connectionString: url, max: 1 });
    try {
      freshSamples.push(await timeQuery(`freshPool.query#${i + 1}`, pool));
    } finally {
      await pool.end();
    }
  }

  // Simulate FIXED: reused Pool
  const reused = new Pool({ connectionString: url, max: 2 });
  try {
    // warm
    await reused.query("SELECT 1");
    const reusedSamples: number[] = [];
    for (let i = 0; i < 3; i++) {
      reusedSamples.push(await timeQuery(`reusedPool.query#${i + 1}`, reused));
    }

    const avgFresh =
      freshSamples.reduce((a, b) => a + b, 0) / freshSamples.length;
    const avgReuse =
      reusedSamples.reduce((a, b) => a + b, 0) / reusedSamples.length;

    console.info(
      `[perf] avg freshPool=${avgFresh.toFixed(1)}ms avg reusedPool=${avgReuse.toFixed(1)}ms`
    );
    assert.ok(
      avgReuse < avgFresh,
      "reused pool should be faster than fresh pool (cold handshake)"
    );
  } finally {
    await reused.end();
  }

  // Parallel vs sequential on reused pool
  const p = new Pool({ connectionString: url, max: 5 });
  try {
    await p.query("SELECT 1");
    const seqStart = performance.now();
    await p.query("SELECT 1");
    await p.query("SELECT 1");
    const seqMs = performance.now() - seqStart;

    const parStart = performance.now();
    await Promise.all([p.query("SELECT 1"), p.query("SELECT 1")]);
    const parMs = performance.now() - parStart;

    console.info(
      `[perf] sequential 2 queries ${seqMs.toFixed(1)}ms | parallel 2 queries ${parMs.toFixed(1)}ms`
    );
  } finally {
    await p.end();
  }

  console.log("profil-perf: ok");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
