"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CommonMessages } from "@/i18n/messages/common";
import type { SkillDefinition } from "@/lib/types";

interface HomeSkillsSectionProps {
  messages: CommonMessages;
  skills: SkillDefinition[];
  unlockedSkills: string[];
}

export function HomeSkillsSection({
  messages,
  skills,
  unlockedSkills,
}: HomeSkillsSectionProps) {
  const chain = skills.slice(0, 3);

  return (
    <section className="ml-home-section mx-auto max-w-3xl px-4 text-center sm:px-6">
      <p className="ml-section-label">{messages.homeSkillsSectionTitle}</p>
      <h2 className="mt-3 font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
        {messages.homeSkillsSectionLead}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-muted">
        {messages.homeSkillsProof}
      </p>

      <ol className="mx-auto mt-10 flex max-w-sm flex-col items-center">
        {chain.map((skill, i) => {
          const unlocked = unlockedSkills.includes(skill.id);
          return (
            <li key={skill.id} className="flex w-full flex-col items-center">
              <div
                className={`w-full border px-4 py-3 text-left ${
                  unlocked
                    ? "border-[color-mix(in_srgb,var(--ml-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--ml-accent)_8%,transparent)]"
                    : "border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_70%,transparent)]"
                }`}
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                <p className="font-mono text-[length:var(--ml-text-xs)] tracking-wide text-ml-text-muted uppercase">
                  {skill.category}
                </p>
                <p
                  className={`mt-1 text-[length:var(--ml-text-base)] ${
                    unlocked ? "text-ml-text" : "text-ml-text-body"
                  }`}
                >
                  {skill.displayName}
                </p>
              </div>
              {i < chain.length - 1 && (
                <span className="my-2 text-ml-text-muted" aria-hidden>
                  ↓
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <Link href="/skills">
          <Button variant="secondary" size="md">
            {messages.homeSkillsCta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
