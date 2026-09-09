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
import { HomeMildredSection } from "@/components/home/HomeMildredSection";
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

  const activeMission =
    missions.find((m) => getStatus(m.id, m.order) === "available") ?? null;

  useEffect(() => {
    document.documentElement.dataset.home = "true";
    return () => {
      delete document.documentElement.dataset.home;
    };
  }, []);

  return (
    <div className="relative">
      <HomeHero
        messages={messages}
        kingdomName={kingdom.name}
        missions={missions}
        getStatus={getStatus}
        activeMission={activeMission}
      />

      <div className="mx-auto h-px max-w-xs bg-ml-border/80" />

      <div className="space-y-24 py-20 sm:space-y-28 sm:py-24">
        <HomeLearningLoop messages={messages} />
        <HomeMildredSection
          locale={locale}
          messages={messages}
          unlockedCapabilities={progress.unlockedCapabilities}
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
