/**
 * HISTORICAL MIGRATION TOOLING — not imported by the MLINI runtime.
 * Phase 2: Supabase (read-only) → Neon (write). Kept for audit / DR context.
 *
 * Usage:
 *   npx tsx --env-file=.env --env-file=.env.local scripts/migrate-supabase-to-neon.ts --dry-run
 *   npx tsx --env-file=.env --env-file=.env.local scripts/migrate-supabase-to-neon.ts --apply
 *   npx tsx ... --apply --reset-dest-dev   # wipe Neon MLINI+BA data first (DEV ONLY)
 *   npx tsx ... --apply --install-triggers # apply 002 after import
 *
 * Does NOT mutate Supabase. Runtime auth is Better Auth + Neon only (Phase 5).
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import {
  assertDistinctMigrationTargets,
  createPgPool,
  createSupabaseSourcePool,
  hostHint,
  resolveSupabaseSourceUrl,
} from "./lib/pg-migration";
import {
  isSupportedOAuthProvider,
  mapSupabaseIdentityToBetterAuthAccount,
  mapSupabaseUserToBetterAuth,
  type SupabaseAuthUser,
  type SupabaseIdentity,
} from "./lib/supabase-to-better-auth";

type Counts = {
  users: number;
  identities: number;
  google: number;
  github: number;
  profiles: number;
  progress: number;
  completions: number;
  events: number;
};

type Report = {
  dryRun: boolean;
  usersMigrated: number;
  accountsMigrated: number;
  profiles: number;
  progress: number;
  completions: number;
  events: number;
  skippedIdentities: number;
  conflicts: string[];
  orphans: string[];
  existingNeonUsers: number;
  existingNeonAccounts: number;
  warnings: string[];
};

function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function countSource(source: Pool): Promise<Counts> {
  const r = await source.query<{
    users: number;
    identities: number;
    google: number;
    github: number;
    profiles: number;
    progress: number;
    completions: number;
    events: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM auth.users) AS users,
      (SELECT COUNT(*)::int FROM auth.identities) AS identities,
      (SELECT COUNT(*)::int FROM auth.identities WHERE provider = 'google') AS google,
      (SELECT COUNT(*)::int FROM auth.identities WHERE provider = 'github') AS github,
      (SELECT COUNT(*)::int FROM public.profiles) AS profiles,
      (SELECT COUNT(*)::int FROM public.user_progress) AS progress,
      (SELECT COUNT(*)::int FROM public.mission_completions) AS completions,
      (SELECT COUNT(*)::int FROM public.integration_events) AS events
  `);
  return r.rows[0];
}

async function neonExisting(dest: Pool): Promise<{
  users: number;
  accounts: number;
}> {
  const r = await dest.query<{ users: number; accounts: number }>(`
    SELECT
      (SELECT COUNT(*)::int FROM better_auth."user") AS users,
      (SELECT COUNT(*)::int FROM better_auth.account) AS accounts
  `);
  return r.rows[0];
}

async function ensurePublicSchema(dest: Pool) {
  const r = await dest.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('profiles','user_progress','mission_completions','integration_events')
  `);
  if ((r.rowCount ?? 0) < 4) {
    throw new Error(
      "Neon public MLINI tables missing. Apply db/migrations/001_neon_mlini_public.sql first."
    );
  }
}

async function disableRuntimeTriggers(dest: Pool) {
  const sql = fs.readFileSync(
    path.join(process.cwd(), "db/migrations/000_disable_runtime_triggers.sql"),
    "utf8"
  );
  await dest.query(sql);
}

async function installRuntimeTriggers(dest: Pool) {
  // 002 = XP / user.created triggers; 003 replaces new-user init with auto-username.
  for (const file of [
    "002_neon_runtime_triggers.sql",
    "003_auto_username_on_signup.sql",
  ]) {
    const sql = fs.readFileSync(
      path.join(process.cwd(), "db/migrations", file),
      "utf8"
    );
    await dest.query(sql);
  }
}

async function resetDestDev(client: PoolClient) {
  // Order: app tables first (FK to user), then BA account/session/verification/user.
  await client.query(`
    TRUNCATE TABLE
      public.integration_events,
      public.mission_completions,
      public.user_progress,
      public.profiles
    RESTART IDENTITY CASCADE
  `);
  await client.query(`
    TRUNCATE TABLE
      better_auth.session,
      better_auth.account,
      better_auth.verification,
      better_auth."user"
    CASCADE
  `);
}

async function verifyOrphans(dest: Pool): Promise<string[]> {
  const orphans: string[] = [];
  const checks = [
    [
      "profiles",
      `SELECT COUNT(*)::int AS n FROM public.profiles p
       LEFT JOIN better_auth."user" u ON u.id = p.id
       WHERE u.id IS NULL`,
    ],
    [
      "user_progress",
      `SELECT COUNT(*)::int AS n FROM public.user_progress p
       LEFT JOIN better_auth."user" u ON u.id = p.user_id
       WHERE u.id IS NULL`,
    ],
    [
      "mission_completions",
      `SELECT COUNT(*)::int AS n FROM public.mission_completions m
       LEFT JOIN better_auth."user" u ON u.id = m.user_id
       WHERE u.id IS NULL`,
    ],
    [
      "integration_events",
      `SELECT COUNT(*)::int AS n FROM public.integration_events e
       LEFT JOIN better_auth."user" u ON u.id = e.user_id
       WHERE e.user_id IS NOT NULL AND u.id IS NULL`,
    ],
  ] as const;

  for (const [label, sql] of checks) {
    const r = await dest.query<{ n: number }>(sql);
    if (r.rows[0].n > 0) orphans.push(`${label}: ${r.rows[0].n}`);
  }
  return orphans;
}

async function compareCounts(
  source: Pool,
  dest: Pool
): Promise<{ source: Counts; dest: Counts }> {
  const sourceCounts = await countSource(source);
  const d = await dest.query<{
    users: number;
    accounts: number;
    profiles: number;
    progress: number;
    completions: number;
    events: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM better_auth."user") AS users,
      (SELECT COUNT(*)::int FROM better_auth.account) AS accounts,
      (SELECT COUNT(*)::int FROM public.profiles) AS profiles,
      (SELECT COUNT(*)::int FROM public.user_progress) AS progress,
      (SELECT COUNT(*)::int FROM public.mission_completions) AS completions,
      (SELECT COUNT(*)::int FROM public.integration_events) AS events
  `);
  const row = d.rows[0];
  return {
    source: sourceCounts,
    dest: {
      users: row.users,
      identities: row.accounts,
      google: 0,
      github: 0,
      profiles: row.profiles,
      progress: row.progress,
      completions: row.completions,
      events: row.events,
    },
  };
}

async function main() {
  const dryRun = argFlag("--dry-run") || !argFlag("--apply");
  const apply = argFlag("--apply");
  const reset = argFlag("--reset-dest-dev");
  const installTriggers = argFlag("--install-triggers");

  if (apply && dryRun && argFlag("--dry-run")) {
    // --apply wins only if not also --dry-run; if both, dry-run wins.
  }
  const mutate = apply && !argFlag("--dry-run");

  const sourceRaw = process.env.SUPABASE_SOURCE_DATABASE_URL?.trim();
  const destUrl =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!sourceRaw) throw new Error("Missing SUPABASE_SOURCE_DATABASE_URL");
  if (!destUrl) throw new Error("Missing DATABASE_URL_DIRECT / DATABASE_URL");

  const resolvedSource = resolveSupabaseSourceUrl(sourceRaw);
  const { sourceHost, destHost } = assertDistinctMigrationTargets(
    sourceRaw,
    destUrl
  );

  console.log("MODE:", mutate ? "APPLY" : "DRY-RUN");
  console.log("SOURCE (configured):", sourceHost);
  console.log("SOURCE (resolved):", hostHint(resolvedSource));
  console.log("DEST:", destHost);

  const source = createSupabaseSourcePool(sourceRaw);
  const dest = createPgPool(destUrl);

  const report: Report = {
    dryRun: !mutate,
    usersMigrated: 0,
    accountsMigrated: 0,
    profiles: 0,
    progress: 0,
    completions: 0,
    events: 0,
    skippedIdentities: 0,
    conflicts: [],
    orphans: [],
    existingNeonUsers: 0,
    existingNeonAccounts: 0,
    warnings: [
      "Neon is a rehearsal snapshot; Supabase remains live and will drift until final cut-over migration.",
    ],
  };

  try {
    const sourceCounts = await countSource(source);
    const existing = await neonExisting(dest);
    report.existingNeonUsers = existing.users;
    report.existingNeonAccounts = existing.accounts;

    console.log("\n--- Source counts ---");
    console.log(`Users: ${sourceCounts.users}`);
    console.log(`Google identities: ${sourceCounts.google}`);
    console.log(`GitHub identities: ${sourceCounts.github}`);
    console.log(`Profiles: ${sourceCounts.profiles}`);
    console.log(`Progress rows: ${sourceCounts.progress}`);
    console.log(`Mission completions: ${sourceCounts.completions}`);
    console.log(`Integration events: ${sourceCounts.events}`);

    console.log("\n--- Existing Neon Better Auth ---");
    console.log(`Users: ${existing.users}`);
    console.log(`Accounts: ${existing.accounts}`);

    const usersRes = await source.query<SupabaseAuthUser>(`
      SELECT id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data
      FROM auth.users
      ORDER BY created_at NULLS LAST
    `);

    const identitiesRes = await source.query<SupabaseIdentity>(`
      SELECT id, user_id, provider, provider_id, identity_data, created_at, updated_at
      FROM auth.identities
      ORDER BY created_at NULLS LAST
    `);

    const plannedUsers = usersRes.rows.map((u) => mapSupabaseUserToBetterAuth(u));
    const plannedAccounts = [];
    for (const identity of identitiesRes.rows) {
      if (!isSupportedOAuthProvider(identity.provider)) {
        report.skippedIdentities += 1;
        report.warnings.push(
          `Skipped unsupported provider identity (${identity.provider})`
        );
        continue;
      }
      plannedAccounts.push(
        mapSupabaseIdentityToBetterAuthAccount(identity, randomUUID())
      );
    }

    // Collision detection vs existing Neon rows
    if (existing.users > 0 || existing.accounts > 0) {
      report.warnings.push(
        "Existing Neon Better Auth rows detected — upsert will overwrite matching UUIDs/provider accounts; use --reset-dest-dev for a clean DEV replay."
      );
      const overlap = await dest.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM better_auth."user" WHERE id = ANY($1::uuid[])`,
        [plannedUsers.map((u) => u.id)]
      );
      if (overlap.rows[0].n > 0) {
        report.conflicts.push(
          `UUID overlap with existing Neon users: ${overlap.rows[0].n}`
        );
      }
    }

    console.log("\n--- Planned ---");
    console.log(`Better Auth users upsert: ${plannedUsers.length}`);
    console.log(`Better Auth OAuth accounts upsert: ${plannedAccounts.length}`);
    console.log(`Conflicts reported: ${report.conflicts.length}`);

    if (!mutate) {
      report.usersMigrated = plannedUsers.length;
      report.accountsMigrated = plannedAccounts.length;
      report.profiles = sourceCounts.profiles;
      report.progress = sourceCounts.progress;
      report.completions = sourceCounts.completions;
      report.events = sourceCounts.events;
      console.log("\nDRY-RUN complete — no Neon mutations.");
      printReport(report, sourceCounts, null);
      return;
    }

    await ensurePublicSchema(dest);
    await disableRuntimeTriggers(dest);

    const client = await dest.connect();
    try {
      await client.query("BEGIN");

      if (reset) {
        console.log("\n--reset-dest-dev: truncating Neon MLINI + Better Auth tables...");
        await resetDestDev(client);
      }

      for (const user of plannedUsers) {
        await client.query(
          `INSERT INTO better_auth."user"
             (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             "emailVerified" = EXCLUDED."emailVerified",
             image = EXCLUDED.image,
             "updatedAt" = EXCLUDED."updatedAt"`,
          [
            user.id,
            user.name,
            user.email,
            user.emailVerified,
            user.image,
            user.createdAt,
            user.updatedAt,
          ]
        );
        report.usersMigrated += 1;
      }

      for (const account of plannedAccounts) {
        const existingAcc = await client.query<{ id: string }>(
          `SELECT id FROM better_auth.account
           WHERE "providerId" = $1 AND "accountId" = $2
           LIMIT 1`,
          [account.providerId, account.accountId]
        );
        if (existingAcc.rowCount) {
          await client.query(
            `UPDATE better_auth.account
             SET "userId" = $1, "updatedAt" = $2,
                 "accessToken" = NULL, "refreshToken" = NULL, "idToken" = NULL,
                 "accessTokenExpiresAt" = NULL, "refreshTokenExpiresAt" = NULL,
                 scope = NULL, password = NULL
             WHERE id = $3`,
            [account.userId, account.updatedAt, existingAcc.rows[0].id]
          );
        } else {
          await client.query(
            `INSERT INTO better_auth.account
               (id, "accountId", "providerId", "userId",
                "accessToken", "refreshToken", "idToken",
                "accessTokenExpiresAt", "refreshTokenExpiresAt",
                scope, password, "createdAt", "updatedAt")
             VALUES ($1,$2,$3,$4, NULL,NULL,NULL, NULL,NULL, NULL,NULL, $5,$6)`,
            [
              account.id,
              account.accountId,
              account.providerId,
              account.userId,
              account.createdAt,
              account.updatedAt,
            ]
          );
        }
        report.accountsMigrated += 1;
      }

      // App data — copy verbatim (no side-effect triggers)
      const profiles = await source.query(`
        SELECT id, username, display_name, avatar_url, created_at, updated_at
        FROM public.profiles
      `);
      for (const p of profiles.rows) {
        await client.query(
          `INSERT INTO public.profiles
             (id, username, display_name, avatar_url, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO UPDATE SET
             username = EXCLUDED.username,
             display_name = EXCLUDED.display_name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = EXCLUDED.updated_at`,
          [
            p.id,
            p.username,
            p.display_name,
            p.avatar_url,
            p.created_at,
            p.updated_at,
          ]
        );
        report.profiles += 1;
      }

      const progress = await source.query(`
        SELECT user_id, total_xp, current_kingdom_slug, current_mission_slug,
               created_at, updated_at
        FROM public.user_progress
      `);
      for (const row of progress.rows) {
        await client.query(
          `INSERT INTO public.user_progress
             (user_id, total_xp, current_kingdom_slug, current_mission_slug,
              created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (user_id) DO UPDATE SET
             total_xp = EXCLUDED.total_xp,
             current_kingdom_slug = EXCLUDED.current_kingdom_slug,
             current_mission_slug = EXCLUDED.current_mission_slug,
             updated_at = EXCLUDED.updated_at`,
          [
            row.user_id,
            row.total_xp,
            row.current_kingdom_slug,
            row.current_mission_slug,
            row.created_at,
            row.updated_at,
          ]
        );
        report.progress += 1;
      }

      const completions = await source.query(`
        SELECT id, user_id, kingdom_slug, mission_slug, xp_awarded,
               completed_at, metadata
        FROM public.mission_completions
      `);
      for (const row of completions.rows) {
        await client.query(
          `INSERT INTO public.mission_completions
             (id, user_id, kingdom_slug, mission_slug, xp_awarded,
              completed_at, metadata)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (user_id, kingdom_slug, mission_slug) DO UPDATE SET
             xp_awarded = EXCLUDED.xp_awarded,
             completed_at = EXCLUDED.completed_at,
             metadata = EXCLUDED.metadata`,
          [
            row.id,
            row.user_id,
            row.kingdom_slug,
            row.mission_slug,
            row.xp_awarded,
            row.completed_at,
            row.metadata,
          ]
        );
        report.completions += 1;
      }

      // Keep identity sequence ahead of imported ids
      await client.query(`
        SELECT setval(
          pg_get_serial_sequence('public.mission_completions', 'id'),
          COALESCE((SELECT MAX(id) FROM public.mission_completions), 1),
          true
        )
      `);

      const events = await source.query(`
        SELECT id, event_type, user_id, payload, created_at
        FROM public.integration_events
      `);
      for (const row of events.rows) {
        await client.query(
          `INSERT INTO public.integration_events
             (id, event_type, user_id, payload, created_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id) DO UPDATE SET
             event_type = EXCLUDED.event_type,
             user_id = EXCLUDED.user_id,
             payload = EXCLUDED.payload,
             created_at = EXCLUDED.created_at`,
          [row.id, row.event_type, row.user_id, row.payload, row.created_at]
        );
        report.events += 1;
      }

      await client.query(`
        SELECT setval(
          pg_get_serial_sequence('public.integration_events', 'id'),
          COALESCE((SELECT MAX(id) FROM public.integration_events), 1),
          true
        )
      `);

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    report.orphans = await verifyOrphans(dest);
    if (report.orphans.length) {
      throw new Error(`Orphan rows after migration: ${report.orphans.join(", ")}`);
    }

    if (installTriggers) {
      console.log("\nInstalling runtime triggers (002 + 003)...");
      await installRuntimeTriggers(dest);
    } else {
      report.warnings.push(
        "Runtime triggers not installed. Re-run with --install-triggers after verification."
      );
    }

    const compared = await compareCounts(source, dest);

    // Classify expected upsert overlaps before reporting.
    report.conflicts = report.conflicts.filter(
      (c) => !c.startsWith("UUID overlap with existing Neon users")
    );
    if (compared.dest.users > compared.source.users) {
      report.warnings.push(
        `Neon has ${compared.dest.users - compared.source.users} Better Auth–native user(s) beyond Supabase source (kept).`
      );
    }

    printReport(report, compared.source, compared.dest);

    // Neon may contain extra Better Auth–native users (local GitHub tests).
    // Require full source coverage, not equal totals.
    const coverage = await verifySourceCoverage(source, dest);
    if (coverage.length) {
      throw new Error(
        `Source rows missing or mismatched on Neon: ${coverage.join("; ")}`
      );
    }
    if (compared.dest.users < compared.source.users) {
      throw new Error("Neon has fewer Better Auth users than Supabase source");
    }
    console.log(
      "Source coverage: OK (Neon may contain additional native users)"
    );

    const oauthExpected = compared.source.google + compared.source.github;
    if (oauthExpected !== report.accountsMigrated) {
      report.warnings.push(
        `OAuth account count ${report.accountsMigrated} vs supported identities ${oauthExpected}`
      );
    }

    if (report.conflicts.length) {
      throw new Error(`Unresolved conflicts: ${report.conflicts.join("; ")}`);
    }
  } finally {
    await source.end();
    await dest.end();
  }
}

/** Every Supabase-owned row must exist on Neon with matching identity keys. */
async function verifySourceCoverage(
  source: Pool,
  dest: Pool
): Promise<string[]> {
  const problems: string[] = [];

  const users = await source.query<{ id: string }>(
    `SELECT id::text AS id FROM auth.users`
  );
  for (const u of users.rows) {
    const r = await dest.query(
      `SELECT 1 FROM better_auth."user" WHERE id = $1::uuid`,
      [u.id]
    );
    if (!r.rowCount) problems.push(`user missing ${u.id}`);
  }

  const identities = await source.query<{
    provider: string;
    provider_id: string;
    user_id: string;
  }>(
    `SELECT provider, provider_id, user_id::text AS user_id
     FROM auth.identities
     WHERE provider IN ('google', 'github')`
  );
  for (const i of identities.rows) {
    const r = await dest.query(
      `SELECT "userId"::text AS uid FROM better_auth.account
       WHERE "providerId" = $1 AND "accountId" = $2`,
      [i.provider, i.provider_id]
    );
    if (!r.rowCount) {
      problems.push(`account missing ${i.provider}:${i.provider_id}`);
    } else if (r.rows[0].uid !== i.user_id) {
      problems.push(
        `account user mismatch ${i.provider}:${i.provider_id}`
      );
    }
  }

  const profiles = await source.query<{
    id: string;
    username: string | null;
  }>(`SELECT id::text AS id, username FROM public.profiles`);
  for (const p of profiles.rows) {
    const r = await dest.query<{ username: string | null }>(
      `SELECT username FROM public.profiles WHERE id = $1::uuid`,
      [p.id]
    );
    if (!r.rowCount) problems.push(`profile missing ${p.id}`);
    else if ((r.rows[0].username ?? null) !== (p.username ?? null)) {
      problems.push(`profile username mismatch ${p.id}`);
    }
  }

  const progress = await source.query<{
    user_id: string;
    total_xp: number;
  }>(`SELECT user_id::text AS user_id, total_xp FROM public.user_progress`);
  for (const p of progress.rows) {
    const r = await dest.query<{ total_xp: number }>(
      `SELECT total_xp FROM public.user_progress WHERE user_id = $1::uuid`,
      [p.user_id]
    );
    if (!r.rowCount) problems.push(`progress missing ${p.user_id}`);
    else if (Number(r.rows[0].total_xp) !== Number(p.total_xp)) {
      problems.push(`progress xp mismatch ${p.user_id}`);
    }
  }

  const completions = await source.query<{
    user_id: string;
    kingdom_slug: string;
    mission_slug: string;
    xp_awarded: number;
  }>(
    `SELECT user_id::text AS user_id, kingdom_slug, mission_slug, xp_awarded
     FROM public.mission_completions`
  );
  for (const c of completions.rows) {
    const r = await dest.query<{ xp_awarded: number }>(
      `SELECT xp_awarded FROM public.mission_completions
       WHERE user_id = $1::uuid AND kingdom_slug = $2 AND mission_slug = $3`,
      [c.user_id, c.kingdom_slug, c.mission_slug]
    );
    if (!r.rowCount) {
      problems.push(
        `completion missing ${c.user_id}/${c.kingdom_slug}/${c.mission_slug}`
      );
    } else if (Number(r.rows[0].xp_awarded) !== Number(c.xp_awarded)) {
      problems.push(
        `completion xp mismatch ${c.user_id}/${c.mission_slug}`
      );
    }
  }

  const events = await source.query<{ id: string; event_type: string }>(
    `SELECT id::text AS id, event_type FROM public.integration_events`
  );
  for (const e of events.rows) {
    const r = await dest.query<{ event_type: string }>(
      `SELECT event_type FROM public.integration_events WHERE id = $1::bigint`,
      [e.id]
    );
    if (!r.rowCount) problems.push(`event missing ${e.id}`);
    else if (r.rows[0].event_type !== e.event_type) {
      problems.push(`event type mismatch ${e.id}`);
    }
  }

  return problems;
}

function printReport(
  report: Report,
  source: Counts,
  dest: Counts | null
) {
  console.log("\n======== MIGRATION REPORT ========");
  console.log(report.dryRun ? "DRY-RUN" : "Migration complete");
  console.log(`Users migrated: ${report.usersMigrated || source.users}`);
  console.log(`OAuth accounts migrated: ${report.accountsMigrated}`);
  console.log(`Profiles: ${report.profiles || source.profiles}`);
  console.log(`Progress: ${report.progress || source.progress}`);
  console.log(`Mission completions: ${report.completions || source.completions}`);
  console.log(`Integration events: ${report.events || source.events}`);
  console.log(`Skipped identities: ${report.skippedIdentities}`);
  console.log(`Conflicts: ${report.conflicts.length}`);
  console.log(`Orphans: ${report.orphans.length || 0}`);
  console.log(
    `EXISTING NEON TEST DATA FOUND: users=${report.existingNeonUsers}, accounts=${report.existingNeonAccounts}`
  );
  if (dest) {
    console.log("\n--- Counts source vs dest ---");
    console.log(
      `users ${source.users} → ${dest.users}; profiles ${source.profiles} → ${dest.profiles}; progress ${source.progress} → ${dest.progress}; completions ${source.completions} → ${dest.completions}; events ${source.events} → ${dest.events}`
    );
  }
  if (report.conflicts.length) {
    console.log("\nCONFLICTS:");
    for (const c of report.conflicts) console.log(`- ${c}`);
  }
  if (report.warnings.length) {
    console.log("\nMIGRATION WARNINGS:");
    for (const w of report.warnings) console.log(`- ${w}`);
  }
  console.log("==================================\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
