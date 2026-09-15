"use client";

import { useMemo } from "react";
import { getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useLocale } from "@/i18n/locale-context";
import { playerDisplayName } from "@/lib/auth/username";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { resolveWorldSnapshot } from "@/lib/world/resolve-world";
import { WorldPath } from "@/components/world/WorldPath";
import { WorldProgressSummary } from "@/components/world/WorldProgressSummary";
import {
  WorldNextKingdom,
  WorldSkillPreview,
} from "@/components/world/WorldContextColumn";
import { WorldSkeleton } from "@/components/world/WorldSkeleton";
import { WorldWelcomeBack } from "@/components/world/WorldWelcomeBack";

/** Authenticated World — canonical learning home at `/app`. */
export function WorldView() {
  const { locale, messages, t } = useLocale();
  const { progress, ready, authStatus, identity } = useEffectiveProgress();

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

  const displayName = playerDisplayName(
    identity?.profile ?? null,
    messages.profileDefaultName
  );
  const isAuthed = authStatus === "authenticated";

  if (!ready || !snapshot) {
    return (
      <div className="min-h-full">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ml-text-primary sm:text-4xl">
              {messages.worldLearningPath}
            </h1>
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted sm:text-[length:var(--ml-text-base)]">
              {messages.worldLearningPathLead}
            </p>
          </header>
        </div>
        <WorldSkeleton hideHeader />
      </div>
    );
  }

  if (snapshot.kingdoms.length === 0) {
    return (
      <div className="mx-auto min-h-full w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.worldEmptyKingdoms}
        </p>
      </div>
    );
  }

  const singleKingdom = snapshot.kingdoms.length === 1;
  const active = snapshot.activeKingdom;
  const continueMission = active?.continueMission ?? null;

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          {isAuthed ? (
            <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
              {t(messages.worldWelcomeBack, { name: displayName })}
            </p>
          ) : null}
          <h1
            className={`font-display text-3xl font-semibold tracking-tight text-ml-text-primary sm:text-4xl ${isAuthed ? "mt-1" : ""}`}
          >
            {messages.worldLearningPath}
          </h1>
          <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted sm:text-[length:var(--ml-text-base)]">
            {continueMission && isAuthed
              ? t(messages.worldWelcomeResume, {
                  mission: continueMission.title,
                })
              : messages.worldLearningPathLead}
          </p>
        </header>

        <div
          className={`mt-8 grid gap-8 lg:items-start lg:gap-10 ${
            singleKingdom
              ? "lg:grid-cols-[minmax(0,1.55fr)_minmax(15rem,0.75fr)]"
              : "lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.9fr)]"
          }`}
        >
          <div className="min-w-0">
            <WorldPath
              kingdoms={snapshot.kingdoms}
              isNewLearner={snapshot.isNewLearner}
            />
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
            <WorldProgressSummary snapshot={snapshot} />
            <WorldSkillPreview skills={snapshot.upcomingSkills} />
            {snapshot.nextKingdom && (
              <WorldNextKingdom next={snapshot.nextKingdom} />
            )}
          </aside>
        </div>
      </div>

      {isAuthed ? (
        <WorldWelcomeBack
          username={displayName}
          kingdomName={active?.kingdom.name ?? null}
          missionsDone={active?.completedCoreCount ?? 0}
          missionsTotal={active?.totalCoreCount ?? 0}
          continueTitle={continueMission?.title ?? null}
          continueHref={active?.continueHref ?? null}
          isNewLearner={snapshot.isNewLearner}
        />
      ) : null}
    </div>
  );
}
