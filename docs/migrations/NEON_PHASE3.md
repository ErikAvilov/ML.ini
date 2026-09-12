# Neon Phase 3 — application data layer + Better Auth switch

## Backend switch

```bash
# Production / default
MLINI_BACKEND=supabase

# Local Neon E2E
MLINI_BACKEND=neon
```

Unknown values fail at server init. No dual-write.

## Architecture

```
Browser → Next.js → Better Auth session (neon) | Supabase session (supabase)
                 → getCurrentUser()
                 → src/lib/data/* → getNeonAppPool()   (neon only)
```

## Key routes

| Concern | Neon | Supabase |
|---------|------|----------|
| OAuth | `/api/auth/callback/*` → `/auth/continue` | `/auth/callback` |
| Username | `/api/username/*` → Neon | `/api/username/*` → Supabase RPC/tables |
| Missions | `recordMissionCompletion` → Neon | same → Supabase admin |
| Delete | Better Auth `deleteUser` | Supabase admin deleteUser |

## Local OAuth prep (manual)

### Google
Add redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub (OAuth App recommended)
1. Create/use a **GitHub OAuth App** (not a GitHub App) for localhost testing if the production callback is locked.
2. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Put `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` in `.env.local` (server-only).
4. Better Auth requests `read:user` + `user:email` by default (private emails via `/user/emails`).
5. Do **not** remove the Supabase GitHub callback.

If the same email exists on Google already, Better Auth will **not** auto-link
(`disableImplicitLinking: true`) — use Google for the migrated account, or a distinct GitHub test user.

