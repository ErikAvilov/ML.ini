/** Server-only by convention — do not import from Client Components. */

import { getNeonProfile } from "@/lib/data/profiles";
import {
  dispatchIntegrationEvent,
  findIntegrationEvent,
} from "@/lib/integrations/dispatch";
import { truncateError } from "@/lib/integrations/n8n";

/**
 * Dispatch canonical mission.completed → n8n after a NEW completion insert.
 * Call only when alreadyCompleted === false.
 * Never throws into the mission result path (caller should still swallow).
 */
export async function dispatchMissionCompletedToN8n(opts: {
  userId: string;
  missionSlug: string;
  totalXp: number;
  missionTitle?: string | null;
  fetchImpl?: typeof fetch;
}) {
  const event = await findIntegrationEvent({
    userId: opts.userId,
    eventType: "mission.completed",
    missionSlug: opts.missionSlug,
  });
  if (!event) {
    console.error("[n8n] mission.completed integration_events row missing", {
      userId: opts.userId,
      missionSlug: opts.missionSlug,
    });
    return { outcome: "skipped" as const, reason: "event_missing" };
  }

  let username: string | null = null;
  try {
    const profile = await getNeonProfile(opts.userId);
    username = profile?.username?.trim() || null;
  } catch {
    username = null;
  }

  return dispatchIntegrationEvent({
    event,
    extras: {
      missionCompleted: {
        username,
        totalXp: opts.totalXp,
        missionTitle: opts.missionTitle ?? null,
      },
    },
    fetchImpl: opts.fetchImpl,
  });
}

/**
 * Fire-and-await mission.completed delivery; never throws.
 */
export async function onMissionCompletedPersisted(opts: {
  userId: string;
  missionSlug: string;
  totalXp: number;
  missionTitle?: string | null;
}): Promise<void> {
  try {
    await dispatchMissionCompletedToN8n(opts);
  } catch (err) {
    console.error(
      "[n8n] unexpected mission.completed dispatch error (ignored)",
      {
        userId: opts.userId,
        missionSlug: opts.missionSlug,
        error: truncateError(
          err instanceof Error ? err.message : "unexpected_error"
        ),
      }
    );
  }
}
