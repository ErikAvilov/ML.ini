# Phase 6C — mission.completed → n8n

Extends Phase 6B. Same endpoint, same secret, same delivery state machine.

## Flow

```
POST /api/missions/complete (validated)
  → INSERT mission_completions (ON CONFLICT DO NOTHING)
  → DB trigger: XP + integration_events(mission.completed)
  → if row inserted (first completion only):
       claim pending event → POST n8n
  → if conflict (replay): no event, no webhook
```

## Payload example

```json
{
  "version": 1,
  "event": "mission.completed",
  "eventId": "123",
  "occurredAt": "2026-09-13T18:00:00.000Z",
  "data": {
    "userId": "8fc7d18b-2248-4c5e-987b-e14599b35c51",
    "username": "Dave",
    "kingdom": "construire-avec-ia",
    "mission": "the-fork",
    "missionTitle": "The Fork",
    "xpAwarded": 180,
    "totalXp": 300
  }
}
```

`xpAwarded` = canonical mission XP (DB row / definition).  
`totalXp` = Neon `user_progress.total_xp` after completion.

## Supported events (whitelist)

- `user.created`
- `mission.completed`

Same URL: `https://hooks.mlini.dev/webhook/mlini-events`
