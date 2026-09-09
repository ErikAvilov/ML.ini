"use client";

import { useEffect } from "react";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { getSkillDefinitions } from "@/data/skills/tree";
import { useLocale } from "@/i18n/locale-context";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeLearningLoop } from "@/components/home/HomeLearningLoop";
import { HomeKingdomSection } from "@/components/home/HomeKingdomSection";
import { HomeSkillsSection } from "@/components/home/HomeSkillsSection";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";

export function HomeExperience() {
  const { locale, messages } = useLocale();
  const { progress } = useProgress();

  const kingdom = createKingdomConstruireAvecIA(locale);
  const missions = getMissions(locale).filter((m) =>
    kingdom.missionIds.includes(m.id)
  );
  const skills = getSkillDefinitions(locale);

  const getStatus = (missionId: string, order: number) =>
    getMissionStatus(missionId, progress, order);

  useEffect(() => {
    document.documentElement.dataset.home = "true";
    return () => {
      delete document.documentElement.dataset.home;
    };
  }, []);

  return (
    <div className="relative">
      <HomeHero
        locale={locale}
        messages={messages}
        kingdomName={kingdom.name}
        missions={missions}
        getStatus={getStatus}
        unlockedCapabilities={progress.unlockedCapabilities}
      />

      <div className="mx-auto h-px max-w-xs bg-[color-mix(in_srgb,var(--ml-border)_80%,transparent)]" />

      <div className="space-y-24 py-20 sm:space-y-28 sm:py-24">
        <HomeLearningLoop messages={messages} />
        <HomeKingdomSection
          messages={messages}
          kingdomName={kingdom.name}
          missions={missions}
          getStatus={getStatus}
        />
        <HomeSkillsSection
          messages={messages}
          skills={skills}
          unlockedSkills={progress.unlockedSkills}
        />
        <HomeFinalCta messages={messages} />
      </div>
    </div>
  );
}
