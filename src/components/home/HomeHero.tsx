"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HomeWordmark } from "@/components/home/HomeWordmark";
import { HomeMissionPath } from "@/components/home/HomeMissionPath";
import { HomeMildredTeaser } from "@/components/home/HomeMildredTeaser";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";
import type { MissionDefinition, MissionStatus } from "@/lib/types";
import { t } from "@/i18n/messages/common";

interface HomeHeroProps {
  locale: Locale;
  messages: CommonMessages;
  kingdomName: string;
  missions: MissionDefinition[];
  getStatus: (missionId: string, order: number) => MissionStatus;
  unlockedCapabilities: string[];
}

export function HomeHero({
  locale,
  messages,
  kingdomName,
  missions,
  getStatus,
  unlockedCapabilities,
}: HomeHeroProps) {
  const bossCount = missions.filter((m) => m.kind === "boss").length;
  const headlineLines = messages.homeHeadline.split("\n");

  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl flex-col items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-16">
      <HomeWordmark />

      <p className="mt-8 ml-section-label">{messages.homeEyebrow}</p>

      <h1 className="mt-4 font-display text-[clamp(2rem,6.5vw,3.35rem)] leading-[1.12] text-ml-text">
        {headlineLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="mt-5 max-w-xl text-[length:var(--ml-text-lg)] leading-[var(--ml-leading-body)] text-ml-text-body">
        {messages.homeLead}
      </p>
      <p className="mt-3 max-w-lg text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-muted">
        {messages.homeLeadSecondary}
      </p>

      <div className="mt-9 flex flex-col items-center gap-3">
        <Link href="/royaume" className="ml-home-cta-glow">
          <Button variant="primary" size="lg" className="min-w-[16rem] px-7 py-3.5 text-[length:var(--ml-text-base)] tracking-wide uppercase">
            {messages.homeCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.homeCtaReassurance}
        </p>
        <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted/80">
          {messages.homeCtaTime}
        </p>
      </div>

      <div className="mt-14 w-full max-w-lg border-t border-ml-border/80 pt-10">
        <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.16em] text-ml-text-muted uppercase">
          {messages.homeKingdomLabel}
        </p>
        <p className="mt-2 font-display text-xl text-ml-text sm:text-2xl">
          {kingdomName}
        </p>
        <div className="mt-6 flex justify-center">
          <HomeMissionPath missions={missions} getStatus={getStatus} compact />
        </div>
        <p className="mt-5 font-mono text-[length:var(--ml-text-xs)] tracking-wide text-ml-text-muted uppercase">
          {t(messages.homeKingdomStats, {
            missions: missions.length,
            bosses: bossCount,
          })}
        </p>
      </div>

      <div className="mt-12 w-full max-w-md border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_72%,transparent)] px-5 py-5 text-left sm:px-6"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <HomeMildredTeaser
          locale={locale}
          messages={messages}
          unlockedCapabilities={unlockedCapabilities}
        />
      </div>
    </section>
  );
}
