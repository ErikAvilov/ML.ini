/**
 * Server runtime only — never import from Client Components.
 * (No `server-only` import: Node/tsx admin scripts also load this module.)
 */

/** Bounded webhook timeout — keep auth / mission paths responsive. */
export const N8N_WEBHOOK_TIMEOUT_MS = 4_000;

export const N8N_WEBHOOK_SECRET_HEADER = "X-MLINI-WEBHOOK-SECRET";

export const SUPPORTED_N8N_EVENTS = [
  "user.created",
  "mission.completed",
] as const;

export type N8nEventName = (typeof SUPPORTED_N8N_EVENTS)[number];

export function isSupportedN8nEvent(value: string): value is N8nEventName {
  return (SUPPORTED_N8N_EVENTS as readonly string[]).includes(value);
}

export type UserCreatedData = {
  userId: string;
  name: string | null;
};

export type MissionCompletedData = {
  userId: string;
  username: string | null;
  kingdom: string;
  mission: string;
  missionTitle: string | null;
  xpAwarded: number;
  totalXp: number;
};

export type N8nWebhookEnvelopeV1 =
  | {
      version: 1;
      event: "user.created";
      eventId: string;
      occurredAt: string;
      data: UserCreatedData;
    }
  | {
      version: 1;
      event: "mission.completed";
      eventId: string;
      occurredAt: string;
      data: MissionCompletedData;
    };

export type DeliveryStatus = "pending" | "delivered" | "failed" | "skipped";

export type IntegrationEventRow = {
  id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  created_at: Date | string;
  delivery_status: DeliveryStatus;
  attempt_count: number;
};

export function getN8nConfig(): { url: string; secret: string } | null {
  const url = process.env.MLINI_N8N_WEBHOOK_URL?.trim();
  const secret = process.env.MLINI_N8N_WEBHOOK_SECRET?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

function toIso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function buildUserCreatedEnvelope(opts: {
  eventId: string | number;
  occurredAt: Date | string;
  userId: string;
  name: string | null | undefined;
}): N8nWebhookEnvelopeV1 {
  const name =
    typeof opts.name === "string" && opts.name.trim()
      ? opts.name.trim()
      : null;

  return {
    version: 1,
    event: "user.created",
    eventId: String(opts.eventId),
    occurredAt: toIso(opts.occurredAt),
    data: {
      userId: opts.userId,
      name,
    },
  };
}

export function buildMissionCompletedEnvelope(opts: {
  eventId: string | number;
  occurredAt: Date | string;
  userId: string;
  username: string | null | undefined;
  kingdom: string;
  mission: string;
  missionTitle?: string | null;
  xpAwarded: number;
  totalXp: number;
}): N8nWebhookEnvelopeV1 {
  const username =
    typeof opts.username === "string" && opts.username.trim()
      ? opts.username.trim()
      : null;
  const missionTitle =
    typeof opts.missionTitle === "string" && opts.missionTitle.trim()
      ? opts.missionTitle.trim()
      : null;

  return {
    version: 1,
    event: "mission.completed",
    eventId: String(opts.eventId),
    occurredAt: toIso(opts.occurredAt),
    data: {
      userId: opts.userId,
      username,
      kingdom: opts.kingdom,
      mission: opts.mission,
      missionTitle,
      xpAwarded: opts.xpAwarded,
      totalXp: opts.totalXp,
    },
  };
}

export function truncateError(message: string, max = 400): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

export type PostN8nResult =
  | { ok: true; status: number }
  | { ok: false; status: number | null; error: string };

/**
 * POST JSON to the configured n8n webhook.
 * Secret goes in header only — never in the body.
 */
export async function postN8nWebhook(opts: {
  url: string;
  secret: string;
  body: unknown;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<PostN8nResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? N8N_WEBHOOK_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(opts.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [N8N_WEBHOOK_SECRET_HEADER]: opts.secret,
      },
      body: JSON.stringify(opts.body),
      signal: controller.signal,
    });

    if (res.status >= 200 && res.status < 300) {
      return { ok: true, status: res.status };
    }
    return {
      ok: false,
      status: res.status,
      error: truncateError(`http_${res.status}`),
    };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : "network_error";
    if (name === "AbortError" || /aborted/i.test(message)) {
      return {
        ok: false,
        status: null,
        error: truncateError(`timeout_${timeoutMs}ms`),
      };
    }
    return { ok: false, status: null, error: truncateError(message) };
  } finally {
    clearTimeout(timer);
  }
}
