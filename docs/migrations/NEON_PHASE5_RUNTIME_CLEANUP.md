# Neon Phase 5 — Remove Supabase from MLINI runtime

**Status:** complete (code). Supabase cloud project is intentionally retained as an archival snapshot — do not delete it in this phase.

## Runtime architecture (sole)

```
User → mlini.dev → Next.js / Vercel → Better Auth → Neon PostgreSQL
  ├── better_auth.*
  ├── public.profiles
  ├── public.user_progress
  ├── public.mission_completions
  └── public.integration_events
```

No `MLINI_BACKEND` switch. Rollback = Git / Vercel deployment history.

## Removed from runtime

- `@supabase/ssr`, `@supabase/supabase-js`
- `src/lib/supabase/*`
- `getMliniBackend` / `BackendModeProvider`
- `/auth/callback`, `/auth/signout`
- `/dev/auth-neon`

## Kept (historical)

- `scripts/migrate-supabase-to-neon.ts`
- `scripts/lib/supabase-to-better-auth.ts`
- `docs/migrations/NEON_PHASE{2,3,4}_*.md`
- `db/migrations/*`

## Manual cleanup (operator)

After validating production on this build:

1. Remove obsolete Vercel env: `MLINI_BACKEND`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
2. Remove old OAuth redirect URIs pointing at Supabase hosted callback / `https://mlini.dev/auth/callback`
3. Keep only Better Auth callbacks on Google / GitHub consoles
4. Keep Supabase project for now
