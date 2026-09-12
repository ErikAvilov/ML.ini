# Neon Phase 2 — schema + data rehearsal (no production cut-over)

## What this phase does

- Creates MLINI `public.*` tables on Neon with FKs to `better_auth."user"(id)`.
- Migrates a **snapshot** of Supabase Auth users/identities + MLINI public data.
- Preserves existing user UUIDs.
- Installs runtime triggers **after** historical import.

## What this phase does NOT do

- Does not switch the live app off Supabase.
- Does not change Google/GitHub callback URLs.
- Does not remove Supabase.
- Does not dual-write. After rehearsal, **Neon drifts** until a final pre-cut-over migration.

## Pools

- `getNeonAuthPool()` → `search_path=better_auth`
- `getNeonAppPool()` → `search_path=public`

## Commands

```bash
# 1. Create public schema (no XP/user.created triggers yet)
npm run db:migrate:neon

# 2. Dry-run (read Supabase, no Neon writes)
npm run migrate:supabase-to-neon:dry

# 3. Rehearsal import (optional clean slate on DEV Neon)
npx tsx --env-file=.env --env-file=.env.local scripts/migrate-supabase-to-neon.ts --apply --reset-dest-dev --install-triggers
```

## Safe import order

1. `001_neon_mlini_public.sql`
2. Disable runtime triggers (`000_…`)
3. Import Better Auth users + OAuth accounts
4. Import profiles → progress → mission_completions → integration_events
5. `002_neon_runtime_triggers.sql`

## OAuth mapping

- Supabase `auth.identities.provider_id` (= `identity_data.sub`) → Better Auth `account.accountId`
- `provider` → `account.providerId` (`google` / `github`)
- Tokens / sessions are **not** migrated
