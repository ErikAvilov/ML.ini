"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HomeWordmark } from "@/components/home/HomeWordmark";
import { HomeMissionPath } from "@/components/home/HomeMissionPath";
import type { CommonMessages } from "@/i18n/messages/common";
import { t } from "@/i18n/messages/common";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface HomeHeroProps {
  messages: CommonMessages;
  kingdomName: string;
  missions: MissionDefinition[];
  getStatus: (missionId: string, order: number) => MissionStatus;
  activeMission?: MissionDefinition | null;
}

export function HomeHero({
  messages,
  kingdomName,
  missions,
  getStatus,
  activeMission,
}: HomeHeroProps) {
  const bossCount = missions.filter((m) => m.kind === "boss").length;
  const currentStep =
    activeMission?.order ??
    missions.find((m) => getStatus(m.id, m.order) === "available")?.order ??
    1;

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <HomeWordmark />

      <p className="mt-8 font-mono text-[11px] font-semibold tracking-[0.22em] text-ml-accent uppercase">
        {messages.homeEyebrow}
      </p>

      <h1 className="mt-4 font-display text-[clamp(2.1rem,5.5vw,3.35rem)] font-semibold leading-[1.15] tracking-tight text-ml-text">
        {messages.homeHeadline}
      </h1>

      <p className="mt-5 max-w-xl text-[length:var(--ml-text-lg)] leading-relaxed text-ml-text-muted">
        {messages.homeLead}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/royaume" className="ml-home-cta-glow">
          <Button
            variant="primary"
            size="lg"
            className="min-w-[15rem] px-7 py-3.5 text-[length:var(--ml-text-sm)] font-semibold tracking-wide uppercase"
          >
            {messages.homeCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-[length:var(--ml-text-xs)] text-ml-secondary">
          {messages.homeCtaReassurance}
        </p>
      </div>

      <div
        className="mt-14 w-full max-w-xl border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_78%,transparent)] px-5 py-5 text-left sm:px-6"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ml-accent uppercase">
            {messages.homeKingdomLabel}
          </p>
          <p className="font-mono text-[10px] tracking-wide text-ml-reward uppercase">
            {t(messages.homeKingdomStats, {
              missions: missions.length,
              bosses: bossCount,
            })}
          </p>
        </div>
        <p className="mt-2 font-display text-xl text-ml-text sm:text-2xl">
          {kingdomName}
        </p>
        <div className="mt-5 flex justify-center">
          <HomeMissionPath missions={missions} getStatus={getStatus} compact />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-2 font-mono text-[length:var(--ml-text-xs)] leading-none">
          <p className="min-w-0 truncate text-ml-accent">
            {activeMission
              ? `${messages.activeMission} ${activeMission.title}`
              : null}
          </p>
          <p className="shrink-0 text-ml-text-muted">
            {t(messages.homeKingdomStep, {
              current: currentStep,
              total: missions.length,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
