import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { HeaderAuthFallback } from "@/components/ui/HeaderAuthFallback";
import { HeaderSignInLink } from "@/components/ui/HeaderSignInLink";
import { getAppSessionState, type AppSessionState } from "@/lib/auth/app-session";
import { getCommonMessages } from "@/i18n/messages/common";
import { getRequestLocale } from "@/i18n/get-request-locale";
import { xpProgressInLevel } from "@/lib/validation";

/** Header auth from an already-resolved AppSessionState (no extra getSession). */
export async function HeaderAuthFromSession({
  session,
  /** When false, omit XP chip (e.g. AppHeader already shows effective progress). */
  showProgress = true,
}: {
  session: AppSessionState;
  showProgress?: boolean;
}) {
  const messages = getCommonMessages(await getRequestLocale());

  if (session.status === "anonymous") {
    return <HeaderSignInLink />;
  }

  const cloudXp = session.cloudProgress.xp;
  const xp = xpProgressInLevel(cloudXp);
  const pct = Math.round((xp.current / Math.max(xp.needed, 1)) * 100);
  const levelLabel = messages.levelShort.replace("{level}", String(xp.level));
  const xpLabel = messages.xpShort.replace("{xp}", String(cloudXp));

  return (
    <>
      {showProgress ? (
        <div
          className="hidden items-center gap-2.5 border border-ml-border bg-ml-surface-1 px-2.5 py-1.5 sm:flex"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <span className="font-mono text-[length:var(--ml-text-xs)] font-semibold text-ml-secondary">
            {levelLabel}
          </span>
          <span className="text-ml-border-strong">·</span>
          <div className="flex items-center gap-2">
            <div className="h-1 w-14 overflow-hidden rounded-full bg-ml-border">
              <div
                className="h-full rounded-full bg-ml-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-ml-text-muted">
              {xpLabel}
            </span>
          </div>
        </div>
      ) : null}
      <AuthUserMenu identity={session.identity} />
    </>
  );
}

/**
 * Standalone entry — shares getAppSessionState cache with AppSessionShell.
 */
export async function HeaderAuth() {
  const session = await getAppSessionState();
  return <HeaderAuthFromSession session={session} />;
}

export { HeaderAuthFallback };
