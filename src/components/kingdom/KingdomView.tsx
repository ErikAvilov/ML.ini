"use client";

import { useMemo } from "react";
import { getKingdomById } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useLocale } from "@/i18n/locale-context";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { resolveKingdomSnapshot } from "@/lib/kingdom/resolve-kingdom";
import { KingdomHeader } from "@/components/kingdom/KingdomHeader";
import { KingdomMissionPath } from "@/components/kingdom/KingdomMissionPath";
import { KingdomContext } from "@/components/kingdom/KingdomContext";
import { KingdomSkeleton } from "@/components/kingdom/KingdomSkeleton";

interface KingdomViewProps {
  kingdomId: string;
}

export function KingdomView({ kingdomId }: KingdomViewProps) {
  const { locale } = useLocale();
  const { progress, ready } = useEffectiveProgress();

  const kingdom = useMemo(
    () => getKingdomById(kingdomId, locale),
    [kingdomId, locale]
  );

  const missions = useMemo(() => getMissions(locale), [locale]);

  const snapshot = useMemo(() => {
    if (!ready || !kingdom) return null;
    return resolveKingdomSnapshot({
      kingdom,
      missions,
      progress,
      locale,
    });
  }, [ready, kingdom, missions, progress, locale]);

  if (!kingdom) {
    return null;
  }

  if (!ready || !snapshot) {
    return (
      <div className="min-h-full">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="h-3 w-28 rounded-sm bg-ml-border/80" />
          <div className="mt-4 h-8 w-64 max-w-full rounded-sm bg-ml-border/80" />
          <div className="mt-3 h-4 w-full max-w-xl rounded-sm bg-ml-border/50" />
        </div>
        <KingdomSkeleton hideHeader />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <KingdomHeader
          kingdom={snapshot.kingdom}
          completedCoreCount={snapshot.completedCoreCount}
          totalCoreCount={snapshot.totalCoreCount}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(15rem,0.75fr)] lg:items-start lg:gap-10">
          {/* Mobile: path (with current + CTA) first; context after */}
          <div className="order-1 min-w-0">
            <KingdomMissionPath
              missions={snapshot.missions}
              isNewLearner={snapshot.isNewLearner}
            />
          </div>
          <div className="order-2 min-w-0">
            <KingdomContext snapshot={snapshot} />
          </div>
        </div>
      </div>
    </div>
  );
}
