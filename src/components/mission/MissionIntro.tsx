"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MissionNavBar } from "@/components/mission/MissionNavBar";
import { MiraMessage } from "@/components/mission/MiraMessage";
import { useProgress } from "@/lib/progress-context";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition } from "@/lib/types";

interface MissionIntroProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  nextMissionId: string | null;
}

/**
 * Lightweight Kingdom onboarding — no playground, no XP grind.
 */
export function MissionIntro({
  mission,
  missions,
  nextMissionId,
}: MissionIntroProps) {
  const router = useRouter();
  const { completeMissionAndUnlock, markMissionPlayed } = useProgress();
  const { messages } = useLocale();
  const intro = mission.intro;
  const [finishing, setFinishing] = useState(false);

  if (!intro) return null;

  const nextSlug = intro.nextSlug;
  const ctaLabel = intro.ctaLabel || messages.introCompleteCta;
  const sections = intro.sections;

  function finish() {
    if (finishing) return;
    setFinishing(true);
    markMissionPlayed(mission.id);
    completeMissionAndUnlock(mission.id, nextMissionId, mission.xpReward, {
      skillId: mission.completion?.skillUnlocked.skillId,
      capabilityId: mission.completion?.capabilityUnlocked.id,
    });
    router.push(`/missions/${nextSlug}`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MissionNavBar mission={mission} missions={missions} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8">
          <header>
            <p className="font-mono text-[11px] tracking-[0.14em] text-ml-reward uppercase">
              {messages.introLabel}
            </p>
            <h1 className="mt-1 font-display text-[1.875rem] leading-tight text-ml-text sm:text-[2rem]">
              {mission.title}
            </h1>
            {mission.brief && (
              <div className="mt-3">
                <MiraMessage message={mission.brief} />
              </div>
            )}
          </header>

          <ol className="space-y-4">
            {sections.map((section, index) => (
              <li
                key={section.title}
                className="border border-ml-border bg-ml-surface-1/50 px-3.5 py-3"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                <p className="font-mono text-[11px] tracking-[0.12em] text-ml-accent uppercase">
                  {String(index + 1).padStart(2, "0")} · {section.title}
                </p>
                <div className="mt-2 space-y-1.5 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body">
                  {section.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div className="sticky bottom-0 border-t border-ml-border bg-ml-bg-0/90 py-4 backdrop-blur-sm">
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={finish}
              disabled={finishing}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
