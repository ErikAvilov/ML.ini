"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AccountDeletionPanel } from "@/components/profile/AccountDeletionPanel";
import { AppProfileSkeleton } from "@/components/profile/AppProfileSkeleton";
import { EditableUsername } from "@/components/profile/EditableUsername";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MliniEmblem } from "@/components/ui/MliniEmblem";
import { getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { getSkillDefinitions } from "@/data/skills/tree";
import { useLocale } from "@/i18n/locale-context";
import type { AuthIdentity } from "@/lib/auth/types";
import { playerDisplayName } from "@/lib/auth/username";
import { betterAuthClient } from "@/lib/better-auth/client";
import { useAuthProgressState } from "@/lib/auth-progress-context";
import { isSkillUnlockedByProgress } from "@/lib/skills";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { xpProgressInLevel } from "@/lib/validation";
import { resolveWorldSnapshot } from "@/lib/world/resolve-world";

const surface =
  "border border-ml-border bg-ml-surface-1";

interface AppProfileViewProps {
  identity?: AuthIdentity | null;
}

export function AppProfileView({ identity = null }: AppProfileViewProps) {
  const { locale, messages, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { commit } = useAuthProgressState();
  const {
    progress,
    ready,
    authStatus,
    identity: liveIdentity,
    resetProgress,
  } = useEffectiveProgress();

  const [signingOut, setSigningOut] = useState(false);
  const [avatarBrokenUrl, setAvatarBrokenUrl] = useState<string | null>(null);

  const resolvedIdentity =
    authStatus === "authenticated"
      ? liveIdentity ?? identity
      : authStatus === "anonymous"
        ? null
        : identity;
  const isCloud = authStatus === "authenticated" || Boolean(resolvedIdentity);

  const kingdoms = useMemo(() => getKingdoms(locale), [locale]);
  const missions = useMemo(() => getMissions(locale), [locale]);

  const snapshot = useMemo(() => {
    if (!ready) return null;
    return resolveWorldSnapshot({
      kingdoms,
      missions,
      progress,
      locale,
    });
  }, [kingdoms, missions, locale, progress, ready]);

  const unlockedSkills = useMemo(() => {
    if (!ready) return [];
    return getSkillDefinitions(locale).filter((skill) =>
      isSkillUnlockedByProgress(skill, progress)
    );
  }, [locale, progress, ready]);

  const xp = xpProgressInLevel(progress.xp);
  const displayName = playerDisplayName(
    resolvedIdentity?.profile ?? null,
    messages.profileDefaultName
  );
  const avatarUrl = resolvedIdentity?.profile?.avatar_url;
  const showAvatar = Boolean(avatarUrl) && avatarBrokenUrl !== avatarUrl;

  async function signOut() {
    setSigningOut(true);
    try {
      await betterAuthClient.signOut();
    } catch {
      // Session may already be gone; still clear client state.
    }
    commit({ status: "anonymous", identity: null, cloudProgress: null });
    router.replace("/app");
    router.refresh();
  }

  if (!ready || !snapshot) {
    return (
      <div className="min-h-full">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ml-text-primary sm:text-4xl">
              {messages.profileTitle}
            </h1>
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted sm:text-[length:var(--ml-text-base)]">
              {messages.profileLead}
            </p>
          </header>
        </div>
        <AppProfileSkeleton hideHeader />
      </div>
    );
  }

  const curriculumPct =
    snapshot.curriculumTotal > 0
      ? Math.round(
          (snapshot.curriculumCompleted / snapshot.curriculumTotal) * 100
        )
      : 0;

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ml-text-primary sm:text-4xl">
            {messages.profileTitle}
          </h1>
          <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted sm:text-[length:var(--ml-text-base)]">
            {messages.profileLead}
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.9fr)] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-6">
            {/* Identity */}
            <section
              className={`${surface} relative overflow-hidden p-5 sm:p-6`}
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--ml-border) 1px, transparent 1px), linear-gradient(to bottom, var(--ml-border) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden
              />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative mx-auto w-fit shrink-0 pb-3 sm:mx-0">
                  <div
                    className="flex h-24 w-24 items-center justify-center overflow-hidden border border-ml-border-strong bg-ml-canvas"
                    style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
                  >
                    {showAvatar ? (
                      // Google avatars 403 when Referer is sent — omit it.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl!}
                        alt=""
                        width={96}
                        height={96}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarBrokenUrl(avatarUrl!)}
                      />
                    ) : (
                      <MliniEmblem size={52} title={displayName} />
                    )}
                  </div>
                  <span className="absolute inset-x-1 bottom-0 border border-ml-border bg-ml-surface-2 px-1.5 py-0.5 text-center font-mono text-[length:var(--ml-text-xs)] text-ml-state-active">
                    {t(messages.level, { level: xp.level })}
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
                    {isCloud
                      ? messages.profileMemberCloud
                      : messages.profileMemberSince}
                  </p>
                  {isCloud ? (
                    <EditableUsername
                      key={displayName}
                      initialUsername={displayName}
                    />
                  ) : (
                    <h2 className="mt-1 font-display text-2xl font-semibold text-ml-text-primary">
                      {displayName}
                    </h2>
                  )}

                  <div className="mt-4 w-full max-w-sm mx-auto sm:mx-0">
                    <div className="mb-2 flex justify-between gap-4 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                      <span>{t(messages.xpShort, { xp: progress.xp })}</span>
                      <span>
                        {t(messages.profileXpToNext, {
                          xp: xp.needed - xp.current,
                          level: xp.level + 1,
                        })}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ml-border">
                      <div
                        className="h-full rounded-full bg-ml-state-active transition-[width] duration-200 ease-out motion-reduce:transition-none"
                        style={{ width: `${Math.round(xp.ratio * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                      {isCloud
                        ? messages.profileCloudProgressNote
                        : messages.profileLocalProgressNote}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Progress */}
            <section
              className={`${surface} p-5 sm:p-6`}
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <h2 className="font-display text-[length:var(--ml-text-lg)] font-semibold text-ml-text-primary">
                {messages.profileProgressSection}
              </h2>

              {snapshot.curriculumTotal > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                    {t(messages.worldMissionsProgress, {
                      done: snapshot.curriculumCompleted,
                      total: snapshot.curriculumTotal,
                    })}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ml-border">
                    <div
                      className="h-full rounded-full bg-ml-state-completed transition-[width] duration-200 ease-out motion-reduce:transition-none"
                      style={{ width: `${curriculumPct}%` }}
                    />
                  </div>
                </div>
              )}

              <ul className="mt-5 space-y-3">
                {snapshot.kingdoms.map((entry) => {
                  const done = entry.completedCoreCount;
                  const total = entry.totalCoreCount;
                  const complete = entry.status === "completed";
                  const active = entry.status === "active";
                  return (
                    <li
                      key={entry.kingdom.id}
                      className="border border-ml-border bg-ml-canvas/40 px-4 py-3"
                      style={{ borderRadius: "var(--ml-frame-radius)" }}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-[length:var(--ml-text-base)] font-semibold text-ml-text-primary">
                          {entry.kingdom.name}
                        </h3>
                        <span
                          className={`shrink-0 font-mono text-[length:var(--ml-text-xs)] ${
                            complete
                              ? "text-ml-state-completed"
                              : active
                                ? "text-ml-state-active"
                                : "text-ml-text-muted"
                          }`}
                        >
                          {done} / {total}
                        </span>
                      </div>
                      <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                        {complete
                          ? messages.worldKingdomCompleted
                          : active
                            ? messages.worldKingdomActive
                            : messages.worldKingdomLocked}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {(progress.streak > 0 || progress.bestStreak > 0) && (
                <p className="mt-4 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {messages.profileStatsStreak}: {progress.streak}{" "}
                  {messages.days}
                  {progress.bestStreak > 0
                    ? ` · ${messages.profileStatsBestStreak}: ${progress.bestStreak} ${messages.days}`
                    : null}
                </p>
              )}
            </section>
          </div>

          <aside className="min-w-0 space-y-6 lg:sticky lg:top-4">
            {/* Skills */}
            <section
              className={`${surface} p-5`}
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
                  {messages.profileSkillsSection}
                </h2>
                <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-state-completed">
                  {unlockedSkills.length}
                </span>
              </div>

              {unlockedSkills.length === 0 ? (
                <p className="mt-3 text-[length:var(--ml-text-sm)] text-ml-text-muted">
                  {messages.profileSkillsEmpty}
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {unlockedSkills.map((skill) => (
                    <li
                      key={skill.id}
                      className="border-b border-ml-border/70 py-2 last:border-b-0"
                    >
                      <p className="text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary">
                        {skill.displayName}
                      </p>
                      <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                        {skill.category}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href="/app/tree"
                className="mt-4 inline-flex text-[length:var(--ml-text-sm)] text-ml-text-muted transition-colors hover:text-ml-state-active focus-visible:outline-none"
              >
                {messages.profileOpenSkillTree}
              </Link>
            </section>

            {/* Account */}
            <section
              className={`${surface} p-5`}
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <h2 className="font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
                {messages.profileAccountSection}
              </h2>

              {!isCloud ? (
                <div className="mt-3">
                  <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
                    {messages.profileSignInHelp}
                  </p>
                  <Link
                    href={`/auth?next=${encodeURIComponent(pathname || "/app/profile")}`}
                    className="mt-4 inline-flex items-center border border-ml-state-active bg-ml-state-active px-4 py-2.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse transition-colors duration-150 ease-out hover:bg-ml-state-active-hover focus-visible:outline-none"
                    style={{ borderRadius: "var(--ml-frame-radius)" }}
                  >
                    {messages.authSignIn}
                  </Link>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
                    {messages.profileCloudProgressNote}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={signingOut}
                    onClick={() => void signOut()}
                  >
                    {signingOut
                      ? messages.authSigningOut
                      : messages.authSignOut}
                  </Button>
                </div>
              )}

              <div className="mt-6 border-t border-ml-border pt-5">
                <h3 className="text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary">
                  {messages.profileLanguageTitle}
                </h3>
                <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {messages.profileLanguageHelp}
                </p>
                <LanguageSwitcher className="mt-3" />
              </div>

              <div className="mt-6 border-t border-ml-border pt-5">
                <h3 className="text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary">
                  {messages.profileResetTitle}
                </h3>
                <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {messages.profileResetHelp}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (!window.confirm(messages.profileResetConfirm)) return;
                    resetProgress();
                  }}
                >
                  {messages.profileResetAction}
                </Button>
              </div>
            </section>

            {isCloud ? <AccountDeletionPanel /> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
