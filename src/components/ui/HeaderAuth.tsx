import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { HeaderAuthFallback } from "@/components/ui/HeaderAuthFallback";
import { HeaderSignInLink } from "@/components/ui/HeaderSignInLink";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { getCommonMessages } from "@/i18n/messages/common";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { xpProgressInLevel } from "@/lib/validation";

/**
 * Server-only header auth chrome.
 * Isolated so RootLayout does NOT block page RSC on Neon profile/progress.
 */
export async function HeaderAuth() {
  const identity = await getAuthIdentity();
  const messages = getCommonMessages(DEFAULT_LOCALE);

  if (!identity) {
    return <HeaderSignInLink />;
  }

  const cloudXp = identity.progress?.total_xp ?? 0;
  const xp = xpProgressInLevel(cloudXp);
  const pct = Math.round((xp.current / Math.max(xp.needed, 1)) * 100);
  const levelLabel = messages.levelShort.replace("{level}", String(xp.level));
  const xpLabel = messages.xpShort.replace("{xp}", String(cloudXp));

  return (
    <>
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
      <AuthUserMenu identity={identity} />
    </>
  );
}

export { HeaderAuthFallback };
