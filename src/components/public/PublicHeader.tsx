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
    <header className="sticky top-0 z-30 border-b border-ml-border bg-ml-surface-raised/95 backdrop-blur-[6px]">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <BrandLogo
          href="/"
          className="gap-2.5 [&_span]:tracking-tight [&_span]:normal-case"
        />
        <div className="flex items-center gap-3">{authSlot}</div>
      </div>
    </header>
  );
}
