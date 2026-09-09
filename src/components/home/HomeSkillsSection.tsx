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
  return (
    <section className="ml-home-section mx-auto max-w-3xl px-4 text-center sm:px-6">
      <h2 className="font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
        {messages.homeSkillsSectionTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-[length:var(--ml-text-base)] text-ml-text-muted">
        {messages.homeSkillsSectionLead}
      </p>

      <ul
        className="mx-auto mt-10 max-w-md space-y-0 border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_75%,transparent)] px-4 py-2 text-left"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        {skills.map((skill) => {
          const unlocked = unlockedSkills.includes(skill.id);
          const available =
            !unlocked &&
            skill.prerequisites.every((p) => unlockedSkills.includes(p));
          return (
            <li
              key={skill.id}
              className="flex items-center gap-3 border-b border-ml-border/70 py-3 last:border-0"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rotate-45 border ${
                  unlocked
                    ? "border-ml-accent bg-ml-accent"
                    : available
                      ? "border-ml-accent bg-[color-mix(in_srgb,var(--ml-accent)_25%,transparent)]"
                      : "border-ml-border bg-transparent"
                }`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] tracking-wide text-ml-text-muted uppercase">
                  {skill.category}
                </p>
                <p
                  className={`text-[length:var(--ml-text-sm)] ${
                    unlocked || available ? "text-ml-text" : "text-ml-text-muted"
                  }`}
                >
                  {skill.name}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] tracking-wide uppercase text-ml-text-muted">
                {unlocked
                  ? "✓"
                  : available
                    ? messages.homeMildredInProgress
                    : messages.profileLocked}
              </span>
            </li>
          );
        })}
      </ul>

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
