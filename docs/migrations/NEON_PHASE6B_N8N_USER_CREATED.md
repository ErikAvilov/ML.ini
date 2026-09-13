# Phase 6B — user.created → n8n webhook

**Scope:** dispatch `user.created` only. `mission.completed` stays in Neon, not sent yet.

## Flow

```
Better Auth OAuth signup
  → INSERT better_auth."user"
  → trigger handle_new_better_auth_user()
       → profiles + user_progress + integration_events(user.created)
  → commit
  → databaseHooks.user.create.after
       → claim pending integration_events row
       → POST MLINI_N8N_WEBHOOK_URL
            Header: X-MLINI-WEBHOOK-SECRET
```

Returning login does **not** insert a user → no webhook.

Webhook failure never fails signup. Event stays `failed` for later retry tooling.

## Env (Vercel / server)

```
MLINI_N8N_WEBHOOK_URL=https://hooks.mlini.dev/webhook/mlini-events
MLINI_N8N_WEBHOOK_SECRET=<same as n8n Header Auth>
```

## Migration

```bash
npm run db:migrate:neon:delivery
```

Marks all **existing** `integration_events` as `skipped` (no historical replay).
New rows default to `pending`.

## Payload (v1)

```json
{
  "version": 1,
  "event": "user.created",
  "eventId": "<integration_events.id>",
  "occurredAt": "<created_at ISO>",
  "data": {
    "userId": "<uuid>",
    "name": "<display name or null>"
  }
}
```

No email, tokens, or secret in the JSON body.
