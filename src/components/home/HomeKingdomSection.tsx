"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HomeMissionPath } from "@/components/home/HomeMissionPath";
import type { CommonMessages } from "@/i18n/messages/common";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface HomeKingdomSectionProps {
  messages: CommonMessages;
  kingdomName: string;
  missions: MissionDefinition[];
  getStatus: (missionId: string, order: number) => MissionStatus;
}

export function HomeKingdomSection({
  messages,
  kingdomName,
  missions,
  getStatus,
}: HomeKingdomSectionProps) {
  const preview = missions.slice(0, 5);
  const boss = missions.find((m) => m.kind === "boss");

  return (
    <section className="ml-home-section mx-auto max-w-3xl px-4 text-center sm:px-6">
      <p className="ml-section-label">{messages.homeKingdomSectionTitle}</p>
      <h2 className="mt-3 font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
        {kingdomName}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-body">
        {messages.homeKingdomSectionLead}
      </p>

      <div className="mt-10 flex justify-center">
        <HomeMissionPath missions={missions} getStatus={getStatus} />
      </div>

      <ul className="mx-auto mt-8 max-w-md space-y-2 text-left">
        {preview.map((mission) => {
          const status = getStatus(mission.id, mission.order);
          return (
            <li
              key={mission.id}
              className="flex items-baseline justify-between gap-3 border-b border-ml-border/60 py-2.5 last:border-0"
            >
              <span className="min-w-0">
                <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {String(mission.order).padStart(2, "0")}
                </span>
                <span
                  className={`ml-3 text-[length:var(--ml-text-base)] ${
                    status === "locked" ? "text-ml-text-muted" : "text-ml-text"
                  }`}
                >
                  {mission.title}
                </span>
              </span>
              {status === "completed" && (
                <span className="shrink-0 font-mono text-[length:var(--ml-text-xs)] text-ml-accent">
                  ●
                </span>
              )}
            </li>
          );
        })}
        {boss && (
          <li className="flex items-baseline justify-between gap-3 border-t border-[color-mix(in_srgb,var(--ml-reward)_28%,transparent)] pt-3">
            <span className="min-w-0">
              <span className="font-mono text-[length:var(--ml-text-xs)] tracking-wide text-ml-reward uppercase">
                {messages.homeKingdomBoss}
              </span>
              <span className="ml-3 text-[length:var(--ml-text-base)] text-ml-text">
                {boss.title}
              </span>
            </span>
            <span
              className="h-2 w-2 shrink-0 rotate-45 border border-ml-reward"
              aria-hidden
            />
          </li>
        )}
      </ul>

      <div className="mt-8">
        <Link href="/royaume">
          <Button variant="secondary" size="md">
            {messages.homeKingdomViewMap}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
