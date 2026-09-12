# Neon Phase 4 — Production cut-over

**Migration data status:** final Supabase → Neon upsert completed (source coverage OK).  
**Production traffic status:** pending manual Vercel + OAuth callback steps below.

Do **not** delete Supabase in this phase. Do **not** implement n8n.

---

## Timestamp

- Final data migration applied: **2026-09-13** (local operator run)
- Source: Supabase Postgres (pooler)
- Destination: Neon (`neondb`)

## Final migration counts

| Entity | Supabase source | Neon after upsert |
|--------|-----------------|-------------------|
| Auth users / Better Auth users | 1 | 2* |
| OAuth Google | 1 | 1 (+1 GitHub native*) |
| Profiles | 1 | 2* |
| user_progress | 1 | 2* |
| mission_completions | 1 | 1 |
| integration_events | 2 | 3* |

\* Extra Neon row(s) = Better Auth–native GitHub test user from pre-cutover local testing (`5225570c-…`). Kept. Not from Supabase.

### Production user (preserved)

- UUID: `8fc7d18b-2248-4c5e-987b-e14599b35c51`
- Username: `Dave`
- XP: `100`
- Mission completions: `1`
- Google `accountId` length: 21 (mapped)

Conflicts (hard): **0**  
Orphans: **0**  
Source coverage: **OK**

---

## Production deploy order (mandatory)

1. **Register OAuth callbacks** (keep Supabase callbacks too)
   - Google: `https://mlini.dev/api/auth/callback/google`
   - GitHub: `https://mlini.dev/api/auth/callback/github`
2. Keep existing Supabase callbacks for rollback.
3. Confirm Neon data (re-run dry-run / apply if Supabase received new activity since this doc).
4. Set **Vercel Production** env (see below).
5. Deploy.
6. Run production smoke tests immediately.

Do **not** set `MLINI_BACKEND=neon` on Vercel before step 1.

---

## Vercel Production env

Set (server-only — never `NEXT_PUBLIC_` for secrets):

```bash
MLINI_BACKEND=neon
DATABASE_URL=…                 # Neon pooled
DATABASE_URL_DIRECT=…          # Neon direct
BETTER_AUTH_SECRET=…           # strong secret
BETTER_AUTH_URL=https://mlini.dev
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
GITHUB_CLIENT_ID=…
GITHUB_CLIENT_SECRET=…
```

**Keep** (rollback):

```bash
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
```

Optional: leave `SUPABASE_SOURCE_DATABASE_URL` unset on Vercel (migration-script-only).

---

## Smoke tests (immediately after deploy)

### Anonymous
- [ ] `https://mlini.dev` loads
- [ ] Kingdom I playable without login

### Google
- [ ] Login → callback on `mlini.dev` (not `*.supabase.co`)
- [ ] Same UUID `8fc7d18b-…`
- [ ] Username `Dave`
- [ ] XP `100` / missions preserved
- [ ] **No duplicate** Better Auth user

### GitHub
- [ ] Login works with production callback
- [ ] Mapping correct (new or existing native account)

### Session
- [ ] Refresh keeps session
- [ ] Logout clears session / navbar anonymous

### Mission (authenticated)
- [ ] Complete one new mission → +1 completion, XP += canonical, one `mission.completed`
- [ ] Replay → no second XP / no second event

### Username
- [ ] Existing username loads
- [ ] Click-to-edit on `/profil` works
- [ ] Case-insensitive uniqueness (`Dave` / `dave`)

### Abuse (spot-check)
- [ ] Body `userId` / `xp` / `totalXp` ignored on `/api/missions/complete`

---

## Rollback (emergency only)

```bash
# Vercel Production
MLINI_BACKEND=supabase
# Redeploy
```

Effects:

- App reads/writes Supabase again.
- Neon-mode activity since cut-over is **not** in Supabase → divergence.
- Use only for immediate incidents within the rollback window (several days).

Do **not** delete Supabase tables/users/OAuth apps during Phase 4.

---

## Architecture after cut-over

```
Browser → Next.js (mlini.dev) → Better Auth session → Neon (getNeonAppPool / getNeonAuthPool)
```

- Neon mode: `proxy.ts` skips Supabase session refresh.
- No dual-write.
- No automatic fallback to Supabase on Neon errors.
- Old Supabase cookies ignored when `MLINI_BACKEND=neon`.
- Users may need to log in again (sessions not migrated) — expected.

---

## Phase 5 (later — not now)

Only after stable production:

- Remove Supabase packages / routes / env
- Remove Supabase OAuth callbacks
- Optionally delete Supabase project

---

## Operator commands (data)

```bash
npm run migrate:supabase-to-neon:dry
npx tsx --env-file=.env --env-file=.env.local scripts/migrate-supabase-to-neon.ts --apply --install-triggers
npm run auth:verify
npx tsx --env-file=.env --env-file=.env.local scripts/check-neon-phase2.ts
```
