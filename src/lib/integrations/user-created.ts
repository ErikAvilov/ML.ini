/** Server-only by convention — do not import from Client Components. */

import {
  dispatchIntegrationEvent,
  findIntegrationEvent,
} from "@/lib/integrations/dispatch";
import { truncateError } from "@/lib/integrations/n8n";

/**
 * Dispatch canonical user.created → n8n.
 * Does NOT insert a second integration_events row.
 */
export async function dispatchUserCreatedToN8n(opts: {
  userId: string;
  name?: string | null;
  fetchImpl?: typeof fetch;
}) {
  const event = await findIntegrationEvent({
    userId: opts.userId,
    eventType: "user.created",
  });
  if (!event) {
    console.error("[n8n] user.created integration_events row missing", {
      userId: opts.userId,
    });
    return { outcome: "skipped" as const, reason: "event_missing" };
  }

  return dispatchIntegrationEvent({
    event,
    extras: { name: opts.name ?? null },
    fetchImpl: opts.fetchImpl,
  });
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
    console.error("[n8n] unexpected user.created dispatch error (ignored)", {
      userId: user.id,
      error: truncateError(
        err instanceof Error ? err.message : "unexpected_error"
      ),
    });
  }
}
