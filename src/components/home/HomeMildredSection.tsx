"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROJECT_LABEL } from "@/data/narrative/canon";
import { MILDRED_CAPABILITY_CATALOG } from "@/data/narrative/mildred-capabilities";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";
import { Button } from "@/components/ui/Button";

interface HomeMildredSectionProps {
  locale: Locale;
  messages: CommonMessages;
  unlockedCapabilities: string[];
}

export function HomeMildredSection({
  locale,
  messages,
  unlockedCapabilities,
}: HomeMildredSectionProps) {
  const catalog = (
    ["classification", "business-rules", "structured-output"] as const
  ).map((id) => ({
    id,
    label: MILDRED_CAPABILITY_CATALOG[id].label[locale],
    online: unlockedCapabilities.includes(id),
  }));

  if (unlockedCapabilities.length === 0 && catalog[0]) {
    catalog[0] = { ...catalog[0], online: true };
  }

  const nextLocked = catalog.find((c) => !c.online);
  const future = [
    { id: "data-parsing", label: messages.homeMildredCapParsing },
    { id: "decision-logic", label: messages.homeMildredCapDecision },
    { id: "ai-integration", label: messages.homeMildredCapIntegration },
  ];

  return (
    <section className="ml-home-section mx-auto max-w-4xl px-4 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-ml-reward uppercase">
            {messages.homeMildredTitle || PROJECT_LABEL}
          </p>
          <h2 className="mt-3 font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
            {messages.homeMildredLead}
          </h2>
          <div className="mt-6">
            <Link href="/royaume">
              <Button variant="secondary" size="md">
                {messages.homeMildredCta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        <ul
          className="space-y-0 border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_75%,transparent)] px-4 py-2"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          {catalog.map((cap) => (
            <li
              key={cap.id}
              className="flex items-center justify-between gap-3 border-b border-ml-border/70 py-3 last:border-0"
            >
              <span className="text-[length:var(--ml-text-sm)] text-ml-text-body">
                {cap.label}
              </span>
              <span className="font-mono text-[10px] tracking-wide uppercase">
                {cap.online ? (
                  <span className="text-ml-accent">✓ {messages.homeMildredOnline}</span>
                ) : nextLocked?.id === cap.id ? (
                  <span className="text-ml-accent">{messages.homeMildredInProgress}</span>
                ) : (
                  <span className="text-ml-text-muted">{messages.homeMildredOffline}</span>
                )}
              </span>
            </li>
          ))}
          {future.map((cap) => (
            <li
              key={cap.id}
              className="flex items-center justify-between gap-3 border-b border-ml-border/70 py-3 text-ml-text-muted last:border-0"
            >
              <span className="text-[length:var(--ml-text-sm)]">{cap.label}</span>
              <span className="font-mono text-[10px] tracking-wide uppercase">
                {messages.homeMildredOffline}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
