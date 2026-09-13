/** Server-only by convention — do not import from Client Components. */

import { getNeonAppPool } from "@/lib/db/neon";
import {
  buildUserCreatedEnvelope,
  getN8nConfig,
  postN8nWebhook,
  truncateError,
  type IntegrationEventRow,
} from "@/lib/integrations/n8n";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve the canonical user.created row created by the DB trigger.
 * After-hook runs post-commit, but allow a short retry for visibility lag.
 */
export async function findUserCreatedIntegrationEvent(
  userId: string
): Promise<IntegrationEventRow | null> {
  const pool = getNeonAppPool();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { rows } = await pool.query<IntegrationEventRow>(
      `SELECT
         id::text AS id,
         event_type,
         user_id::text AS user_id,
         payload,
         created_at,
         delivery_status,
         attempt_count
       FROM public.integration_events
       WHERE user_id = $1::uuid
         AND event_type = 'user.created'
       ORDER BY id ASC
       LIMIT 1`,
      [userId]
    );
    if (rows[0]) return rows[0];
    await sleep(40 * (attempt + 1));
  }
  return null;
}

/**
 * Atomically claim a pending user.created event for delivery.
 * Returns null if already delivered / skipped / failed / missing.
 */
export async function claimPendingUserCreatedEvent(
  eventId: string
): Promise<IntegrationEventRow | null> {
  const pool = getNeonAppPool();
  const { rows } = await pool.query<IntegrationEventRow>(
    `UPDATE public.integration_events
     SET
       attempt_count = attempt_count + 1,
       last_attempt_at = now(),
       last_error = NULL
     WHERE id = $1::bigint
       AND event_type = 'user.created'
       AND delivery_status = 'pending'
     RETURNING
       id::text AS id,
       event_type,
       user_id::text AS user_id,
       payload,
       created_at,
       delivery_status,
       attempt_count`,
    [eventId]
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

function displayNameFromPayload(
  payload: Record<string, unknown>,
  fallbackName: string | null | undefined
): string | null {
  const fromPayload = payload.display_name;
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim();
  }
  if (typeof fallbackName === "string" && fallbackName.trim()) {
    return fallbackName.trim();
  }
  return null;
}

export type DispatchUserCreatedResult =
  | { outcome: "delivered"; eventId: string; status: number }
  | { outcome: "failed"; eventId: string | null; error: string }
  | { outcome: "skipped"; reason: string };

/**
 * Dispatch canonical user.created → n8n.
 * Never throws for webhook/config failures (caller must still swallow).
 * Does NOT insert a second integration_events row.
 */
export async function dispatchUserCreatedToN8n(opts: {
  userId: string;
  name?: string | null;
  fetchImpl?: typeof fetch;
}): Promise<DispatchUserCreatedResult> {
  const config = getN8nConfig();
  if (!config) {
    console.error(
      "[n8n] misconfigured: MLINI_N8N_WEBHOOK_URL and/or MLINI_N8N_WEBHOOK_SECRET missing — skip user.created"
    );
    return { outcome: "skipped", reason: "missing_env" };
  }

  const event = await findUserCreatedIntegrationEvent(opts.userId);
  if (!event) {
    console.error(
      "[n8n] user.created integration_events row missing",
      { userId: opts.userId }
    );
    return { outcome: "skipped", reason: "event_missing" };
  }

  if (event.delivery_status !== "pending") {
    return {
      outcome: "skipped",
      reason: `status_${event.delivery_status}`,
    };
  }

  const claimed = await claimPendingUserCreatedEvent(event.id);
  if (!claimed) {
    return { outcome: "skipped", reason: "not_claimable" };
  }

  const envelope = buildUserCreatedEnvelope({
    eventId: claimed.id,
    occurredAt: claimed.created_at,
    userId: claimed.user_id,
    name: displayNameFromPayload(claimed.payload, opts.name),
  });

  // Privacy: never put secret / email / tokens in body.
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

/**
 * Better Auth user.create.after entrypoint — never throws.
 */
export async function onBetterAuthUserCreated(user: {
  id: string;
  name?: string | null;
}): Promise<void> {
  try {
    await dispatchUserCreatedToN8n({
      userId: user.id,
      name: user.name ?? null,
    });
  } catch (err) {
    console.error("[n8n] unexpected dispatch error (ignored)", {
      userId: user.id,
      error: truncateError(
        err instanceof Error ? err.message : "unexpected_error"
      ),
    });
  }
}
