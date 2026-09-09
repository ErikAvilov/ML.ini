"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CommonMessages } from "@/i18n/messages/common";

interface HomeFinalCtaProps {
  messages: CommonMessages;
}

export function HomeFinalCta({ messages }: HomeFinalCtaProps) {
  return (
    <section className="ml-home-section mx-auto max-w-2xl px-4 pb-20 text-center sm:px-6 sm:pb-28">
      <div className="mb-6 flex items-center justify-center gap-3" aria-hidden>
        <span className="h-px w-10 bg-[color-mix(in_srgb,var(--ml-reward)_40%,transparent)]" />
        <span className="h-1.5 w-1.5 rotate-45 border border-[color-mix(in_srgb,var(--ml-reward)_50%,transparent)]" />
        <span className="h-px w-10 bg-[color-mix(in_srgb,var(--ml-reward)_40%,transparent)]" />
      </div>
      <h2 className="font-display text-[clamp(1.6rem,4vw,2.25rem)] leading-tight text-ml-text">
        {messages.homeFinalTitle}
      </h2>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/royaume" className="ml-home-cta-glow">
          <Button
            variant="primary"
            size="lg"
            className="min-w-[16rem] px-7 py-3.5 tracking-wide uppercase"
          >
            {messages.homeCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.homeFinalReassurance}
        </p>
      </div>
    </section>
  );
}
