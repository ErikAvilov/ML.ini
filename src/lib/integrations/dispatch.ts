/** Server-only by convention — do not import from Client Components. */

import { getNeonAppPool } from "@/lib/db/neon";
import {
  buildMissionCompletedEnvelope,
  buildUserCreatedEnvelope,
  getN8nConfig,
  isSupportedN8nEvent,
  postN8nWebhook,
  truncateError,
  type IntegrationEventRow,
  type N8nEventName,
  type N8nWebhookEnvelopeV1,
} from "@/lib/integrations/n8n";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DispatchResult =
  | { outcome: "delivered"; eventId: string; status: number }
  | { outcome: "failed"; eventId: string | null; error: string }
  | { outcome: "skipped"; reason: string };

export type MissionCompletedExtras = {
  username: string | null;
  totalXp: number;
  missionTitle?: string | null;
};

export type DispatchExtras = {
  /** Fallback display name for user.created */
  name?: string | null;
  missionCompleted?: MissionCompletedExtras;
};

function payloadString(
  payload: Record<string, unknown>,
  key: string
): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function payloadNumber(
  payload: Record<string, unknown>,
  key: string
): number | null {
  const value = payload[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Build a versioned n8n envelope from a whitelist-only event type.
 * Returns null for unknown types (never post arbitrarily).
 */
export function buildEnvelopeForEvent(
  event: IntegrationEventRow,
  extras: DispatchExtras = {}
): N8nWebhookEnvelopeV1 | null {
  if (!isSupportedN8nEvent(event.event_type)) return null;

  if (event.event_type === "user.created") {
    const fromPayload = payloadString(event.payload, "display_name");
    const name =
      fromPayload ??
      (typeof extras.name === "string" && extras.name.trim()
        ? extras.name.trim()
        : null);
    return buildUserCreatedEnvelope({
      eventId: event.id,
      occurredAt: event.created_at,
      userId: event.user_id,
      name,
    });
  }

  // mission.completed
  const kingdom =
    payloadString(event.payload, "kingdom_slug") ??
    payloadString(event.payload, "kingdom");
  const mission =
    payloadString(event.payload, "mission_slug") ??
    payloadString(event.payload, "mission");
  const xpAwarded = payloadNumber(event.payload, "xp_awarded");

  if (!kingdom || !mission || xpAwarded == null) {
    return null;
  }

  const mc = extras.missionCompleted;
  return buildMissionCompletedEnvelope({
    eventId: event.id,
    occurredAt: event.created_at,
    userId: event.user_id,
    username: mc?.username ?? null,
    kingdom,
    mission,
    missionTitle: mc?.missionTitle ?? null,
    xpAwarded,
    totalXp: mc?.totalXp ?? 0,
  });
}

export async function findIntegrationEvent(opts: {
  userId: string;
  eventType: N8nEventName;
  /** For mission.completed: match payload mission_slug */
  missionSlug?: string;
  retries?: number;
}): Promise<IntegrationEventRow | null> {
  const pool = getNeonAppPool();
  const retries = opts.retries ?? 5;

  for (let attempt = 0; attempt < retries; attempt++) {
    const { rows } = await pool.query<IntegrationEventRow>(
      opts.missionSlug
        ? `SELECT
             id::text AS id,
             event_type,
             user_id::text AS user_id,
             payload,
             created_at,
             delivery_status,
             attempt_count
           FROM public.integration_events
           WHERE user_id = $1::uuid
             AND event_type = $2
             AND payload->>'mission_slug' = $3
           ORDER BY id DESC
           LIMIT 1`
        : `SELECT
             id::text AS id,
             event_type,
             user_id::text AS user_id,
             payload,
             created_at,
             delivery_status,
             attempt_count
           FROM public.integration_events
           WHERE user_id = $1::uuid
             AND event_type = $2
           ORDER BY id ASC
           LIMIT 1`,
      opts.missionSlug
        ? [opts.userId, opts.eventType, opts.missionSlug]
        : [opts.userId, opts.eventType]
    );
    if (rows[0]) return rows[0];
    await sleep(40 * (attempt + 1));
  }
  return null;
}

/**
 * Atomically claim a pending whitelisted event for delivery.
 */
export async function claimPendingIntegrationEvent(
  eventId: string,
  eventType: N8nEventName
): Promise<IntegrationEventRow | null> {
  if (!isSupportedN8nEvent(eventType)) return null;

  const pool = getNeonAppPool();
  const { rows } = await pool.query<IntegrationEventRow>(
    `UPDATE public.integration_events
     SET
       attempt_count = attempt_count + 1,
       last_attempt_at = now(),
       last_error = NULL
     WHERE id = $1::bigint
       AND event_type = $2
       AND delivery_status = 'pending'
     RETURNING
       id::text AS id,
       event_type,
       user_id::text AS user_id,
       payload,
       created_at,
       delivery_status,
       attempt_count`,
    [eventId, eventType]
  );
  return rows[0] ?? null;
}

export async function markIntegrationEventDelivered(
  eventId: string
): Promise<void> {
  const pool = getNeonAppPool();
  await pool.query(
    `UPDATE public.integration_events
     SET
       delivery_status = 'delivered',
       delivered_at = now(),
       last_error = NULL
     WHERE id = $1::bigint`,
    [eventId]
  );
}

export async function markIntegrationEventFailed(
  eventId: string,
  error: string
): Promise<void> {
  const pool = getNeonAppPool();
  await pool.query(
    `UPDATE public.integration_events
     SET
       delivery_status = 'failed',
       last_error = $2
     WHERE id = $1::bigint`,
    [eventId, truncateError(error)]
  );
}

/**
 * Generic dispatcher for whitelist event types.
 * Never throws for webhook/config failures.
 * Does NOT insert integration_events rows.
 */
export async function dispatchIntegrationEvent(opts: {
  event: IntegrationEventRow;
  extras?: DispatchExtras;
  fetchImpl?: typeof fetch;
}): Promise<DispatchResult> {
  const { event } = opts;

  if (!isSupportedN8nEvent(event.event_type)) {
    console.error("[n8n] unsupported event type — not dispatched", {
      eventId: event.id,
      eventType: event.event_type,
    });
    return { outcome: "skipped", reason: "unsupported_event" };
  }

  const config = getN8nConfig();
  if (!config) {
    console.error(
      "[n8n] misconfigured: MLINI_N8N_WEBHOOK_URL and/or MLINI_N8N_WEBHOOK_SECRET missing — skip",
      { eventType: event.event_type, eventId: event.id }
    );
    return { outcome: "skipped", reason: "missing_env" };
  }

  if (event.delivery_status !== "pending") {
    return {
      outcome: "skipped",
      reason: `status_${event.delivery_status}`,
    };
  }

  const claimed = await claimPendingIntegrationEvent(
    event.id,
    event.event_type
  );
  if (!claimed) {
    return { outcome: "skipped", reason: "not_claimable" };
  }

  const envelope = buildEnvelopeForEvent(claimed, opts.extras ?? {});
  if (!envelope) {
    await markIntegrationEventFailed(claimed.id, "envelope_build_failed");
    return {
      outcome: "failed",
      eventId: claimed.id,
      error: "envelope_build_failed",
    };
  }

  const result = await postN8nWebhook({
    url: config.url,
    secret: config.secret,
    body: envelope,
    fetchImpl: opts.fetchImpl,
  });

  if (result.ok) {
    await markIntegrationEventDelivered(claimed.id);
    console.info("[n8n] delivered", {
      event: envelope.event,
      eventId: envelope.eventId,
      status: result.status,
    });
    return {
      outcome: "delivered",
      eventId: claimed.id,
      status: result.status,
    };
  }

  await markIntegrationEventFailed(claimed.id, result.error);
  console.error("[n8n] delivery failed", {
    event: envelope.event,
    eventId: envelope.eventId,
    status: result.status,
    error: result.error,
  });
  return {
    outcome: "failed",
    eventId: claimed.id,
    error: result.error,
  };
}
