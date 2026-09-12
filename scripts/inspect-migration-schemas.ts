import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import {
  createPgPool,
  createSupabaseSourcePool,
  hostHint,
  resolveSupabaseSourceUrl,
} from "./lib/pg-migration";

function describeLabel(label: string, rowCount: number | null) {
  console.log(`\n=== ${label} (${rowCount ?? 0}) ===`);
}

async function describe(
  pool: ReturnType<typeof createPgPool>,
  label: string,
  sql: string,
  params: unknown[] = []
) {
  const res = await pool.query(sql, params);
  describeLabel(label, res.rowCount);
  for (const row of res.rows) {
    console.log(JSON.stringify(row));
  }
}

async function main() {
  const sourceUrl = process.env.SUPABASE_SOURCE_DATABASE_URL?.trim();
  const destUrl =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!sourceUrl) throw new Error("Missing SUPABASE_SOURCE_DATABASE_URL");
  if (!destUrl) throw new Error("Missing DATABASE_URL_DIRECT / DATABASE_URL");

  const resolvedSource = resolveSupabaseSourceUrl(sourceUrl);
  console.log("SOURCE host (configured):", hostHint(sourceUrl));
  console.log("SOURCE host (resolved):", hostHint(resolvedSource));
  console.log("DEST host:", hostHint(destUrl));

  const source = createSupabaseSourcePool(sourceUrl);
  const dest = createPgPool(destUrl);

  try {
    await describe(
      source,
      "SOURCE public tables",
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public' AND table_type='BASE TABLE'
       ORDER BY 1`
    );

    for (const table of [
      "profiles",
      "user_progress",
      "mission_completions",
      "integration_events",
    ]) {
      await describe(
        source,
        `SOURCE columns ${table}`,
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema='public' AND table_name=$1
         ORDER BY ordinal_position`,
        [table]
      );
      await describe(
        source,
        `SOURCE constraints ${table}`,
        `SELECT conname, pg_get_constraintdef(oid) AS def
         FROM pg_constraint
         WHERE conrelid = $1::regclass
         ORDER BY 1`,
        [`public.${table}`]
      );
      await describe(
        source,
        `SOURCE indexes ${table}`,
        `SELECT indexname, indexdef FROM pg_indexes
         WHERE schemaname='public' AND tablename=$1
         ORDER BY 1`,
        [table]
      );
    }

    await describe(
      source,
      "SOURCE triggers on public",
      `SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
       FROM information_schema.triggers
       WHERE trigger_schema='public'
       ORDER BY 1,2`
    );

    await describe(
      source,
      "SOURCE functions (public, relevant names)",
      `SELECT proname FROM pg_proc p
       JOIN pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='public'
         AND (proname ILIKE '%username%' OR proname ILIKE '%xp%' OR proname ILIKE '%mission%'
              OR proname ILIKE '%user%' OR proname ILIKE '%updated%' OR proname ILIKE '%integrat%')
       ORDER BY 1`
    );

    await describe(
      source,
      "SOURCE auth.users columns",
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema='auth' AND table_name='users'
       ORDER BY ordinal_position`
    );

    await describe(
      source,
      "SOURCE auth.identities columns",
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema='auth' AND table_name='identities'
       ORDER BY ordinal_position`
    );

    await describe(
      source,
      "SOURCE identity provider counts (no PII)",
      `SELECT provider, COUNT(*)::int AS n
       FROM auth.identities
       GROUP BY provider
       ORDER BY 1`
    );

    await describe(
      source,
      "SOURCE counts",
      `SELECT
         (SELECT COUNT(*)::int FROM auth.users) AS users,
         (SELECT COUNT(*)::int FROM auth.identities) AS identities,
         (SELECT COUNT(*)::int FROM public.profiles) AS profiles,
         (SELECT COUNT(*)::int FROM public.user_progress) AS progress,
         (SELECT COUNT(*)::int FROM public.mission_completions) AS completions,
         (SELECT COUNT(*)::int FROM public.integration_events) AS events`
    );

    // Sample identity_data keys only (structure), not values
    await describe(
      source,
      "SOURCE identity_data top-level keys sample",
      `SELECT provider,
              (SELECT array_agg(k) FROM jsonb_object_keys(identity_data) AS k) AS keys
       FROM auth.identities
       LIMIT 10`
    );

    await describe(
      dest,
      "DEST better_auth tables",
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='better_auth' ORDER BY 1`
    );

    for (const table of ["user", "account", "session", "verification"]) {
      await describe(
        dest,
        `DEST columns better_auth.${table}`,
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema='better_auth' AND table_name=$1
         ORDER BY ordinal_position`,
        [table]
      );
    }

    await describe(
      dest,
      "DEST better_auth row counts",
      `SELECT
         (SELECT COUNT(*)::int FROM better_auth."user") AS users,
         (SELECT COUNT(*)::int FROM better_auth.account) AS accounts,
         (SELECT COUNT(*)::int FROM better_auth.session) AS sessions,
         (SELECT COUNT(*)::int FROM better_auth.verification) AS verification`
    );

    await describe(
      dest,
      "DEST public app tables (expect none yet)",
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public'
         AND table_name IN ('profiles','user_progress','mission_completions','integration_events')
       ORDER BY 1`
    );
  } finally {
    await source.end();
    await dest.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
