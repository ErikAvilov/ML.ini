"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";

export default function HomePage() {
  const { locale, messages, t } = useLocale();
  const kingdom = createKingdomConstruireAvecIA(locale);

  return (
    <div className="relative overflow-hidden">
      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mb-4 ml-section-label">{messages.homeEyebrow}</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.02] text-ml-text sm:text-6xl md:text-7xl">
          {messages.homeHeadline}
        </h1>
        <p className="mt-5 max-w-xl text-[length:var(--ml-text-lg)] leading-[var(--ml-leading-body)] text-ml-text-body sm:text-xl">
          {messages.homeLead}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/royaume">
            <Button variant="primary" size="lg">
              {messages.homeCta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-12 max-w-md text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
          {(() => {
            const [before, after] = t(messages.homeFoot, {
              kingdom: "\u0000",
            }).split("\u0000");
            return (
              <>
                {before}
                <span className="text-ml-text">{kingdom.name}</span>
                {after}
              </>
            );
          })()}
        </p>
      </section>
    </div>
  );
}
