"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-context";

const SESSION_KEY = "mlini-app-welcome-v1";

function claimWelcomeSlot(): boolean {
  try {
    if (typeof sessionStorage === "undefined") return false;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

let claimed: boolean | null = null;
function getSnapshot(): boolean {
  if (claimed === null) claimed = claimWelcomeSlot();
  return claimed;
}
function getServerSnapshot(): boolean {
  return false;
}
function subscribe(): () => void {
  return () => {};
}

export type WorldWelcomeBackProps = {
  username: string;
  kingdomName: string | null;
  missionsDone: number;
  missionsTotal: number;
  continueTitle: string | null;
  continueHref: string | null;
  isNewLearner: boolean;
};

/**
 * Session-scoped return surface for authenticated users on `/app`.
 * UX only — not durable progression. Once per browser session.
 */
export function WorldWelcomeBack({
  username,
  kingdomName,
  missionsDone,
  missionsTotal,
  continueTitle,
  continueHref,
  isNewLearner,
}: WorldWelcomeBackProps) {
  const { messages, t } = useLocale();
  const shouldShow = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShow || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto w-[min(100%,22rem)] border border-ml-border bg-ml-surface-1 p-4 shadow-[0_8px_24px_color-mix(in_srgb,black_35%,transparent)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      {isNewLearner ? (
        <>
          <p className="font-mono text-[11px] tracking-[0.08em] text-ml-state-active uppercase">
            {messages.worldWelcomeNewEyebrow}
          </p>
          <p className="mt-1 font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
            {t(messages.worldWelcomeNewTitle, { name: username })}
          </p>
          <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.worldWelcomeNewLead}
          </p>
        </>
      ) : (
        <>
          <p className="font-mono text-[11px] tracking-[0.08em] text-ml-state-active uppercase">
            {t(messages.worldWelcomeBackEyebrow, { name: username })}
          </p>
          {kingdomName ? (
            <p className="mt-2 font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
              {kingdomName}
            </p>
          ) : null}
          {missionsTotal > 0 ? (
            <p className="mt-0.5 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
              {t(messages.worldMissionsProgress, {
                done: missionsDone,
                total: missionsTotal,
              })}
            </p>
          ) : null}
          {continueTitle ? (
            <p className="mt-2 text-[length:var(--ml-text-xs)] text-ml-text-muted">
              {messages.worldWelcomeContinueLabel}{" "}
              <span className="text-ml-text-primary">{continueTitle}</span>
            </p>
          ) : null}
        </>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-2 py-1 text-[length:var(--ml-text-xs)] text-ml-text-muted hover:text-ml-text-primary"
        >
          {messages.worldWelcomeDismiss}
        </button>
        {continueHref ? (
          <Link
            href={continueHref}
            onClick={() => setDismissed(true)}
            className="inline-flex items-center border border-ml-state-active bg-ml-state-active px-3 py-1.5 text-[length:var(--ml-text-xs)] font-semibold text-ml-text-inverse hover:bg-ml-state-active-hover"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {isNewLearner
              ? messages.worldStartMission
              : messages.worldContinueMission}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
