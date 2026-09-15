"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface PublicHeaderProps {
  authSlot: ReactNode;
}

/**
 * Minimal public chrome — deliberate mark + wordmark, Sign in only.
 * Primary Start learning lives in the Hero.
 */
export function PublicHeader({ authSlot }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ml-border bg-[color-mix(in_srgb,var(--ml-canvas)_88%,transparent)] backdrop-blur-[6px]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo
          href="/"
          className="gap-3 [&_span]:text-[length:var(--ml-text-xl)] [&_span]:tracking-[0.08em]"
        />
        <div className="flex items-center gap-3">{authSlot}</div>
      </div>
    </header>
  );
}
