"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MissionChromeBar } from "@/components/mission/MissionChromeBar";
import { useMissionRoutes } from "@/components/mission/MissionRouteProvider";
import { MiraMessage } from "@/components/mission/MiraMessage";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { requestCloudCompletion } from "@/lib/missions/cloud-completion-client";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition } from "@/lib/types";
import type { AuthIdentity } from "@/lib/auth/types";

interface MissionIntroProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  nextMissionId: string | null;
  isAuthenticated?: boolean;
  identity?: AuthIdentity | null;
}

/**
 * Lightweight Kingdom onboarding — no playground, no XP grind.
 */
export function MissionIntro({
  mission,
  missions,
  nextMissionId,
  isAuthenticated = false,
  identity = null,
}: MissionIntroProps) {
  const router = useRouter();
  const routes = useMissionRoutes();
  const { completeMissionAndUnlock, markMissionPlayed } = useEffectiveProgress();
  const { locale, messages } = useLocale();
  const intro = mission.intro;
  const [saving, setSaving] = useState(false);

  if (!intro) return null;

  const nextHref = routes.missionHref(intro.nextSlug);
  const ctaLabel = intro.ctaLabel || messages.introCompleteCta;
  const sections = intro.sections;

  async function startMission01() {
    if (saving) return;
    setSaving(true);
    markMissionPlayed(mission.id);

    if (isAuthenticated) {
      await requestCloudCompletion({
        missionId: mission.id,
        locale,
      });
      router.refresh();
    }

    completeMissionAndUnlock(mission.id, nextMissionId, mission.xpReward, {
      skillId: mission.completion?.skillUnlocked?.skillId,
      capabilityId: mission.completion?.capabilityUnlocked?.id,
    });
    setSaving(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MissionChromeBar
        mission={mission}
        missions={missions}
        identity={identity}
      />

      <div className="min-h-0 flex-1 overflow-y-auto bg-ml-canvas">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8">
          <header>
            <p className="ml-mission-section-label text-ml-state-active">
              {messages.introLabel}
            </p>
            <h1 className="mt-1 font-display text-[1.875rem] font-semibold leading-tight tracking-tight text-ml-text-primary sm:text-[2rem]">
              {mission.title}
            </h1>
            {mission.brief && (
              <div className="mt-3">
                <MiraMessage message={mission.brief} />
              </div>
            )}
          </header>

          <ol className="space-y-0">
            {sections.map((section, index) => (
              <li
                key={section.title}
                className="border-t border-ml-border/80 py-4"
              >
                <p className="ml-mission-section-label text-ml-state-active">
                  {String(index + 1).padStart(2, "0")} · {section.title}
                </p>
                <div className="mt-2 space-y-1.5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
                  {section.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="shrink-0 border-t border-ml-border bg-ml-surface-1">
        <div className="mx-auto flex max-w-2xl items-center justify-center px-5 py-3 sm:px-8">
          <Link
            href={nextHref}
            onClick={() => void startMission01()}
            aria-disabled={saving}
            className="inline-flex items-center justify-center border border-ml-state-active bg-ml-state-active px-4 py-2.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse hover:bg-ml-state-active-hover"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
