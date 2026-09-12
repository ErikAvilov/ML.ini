"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEGAL_PATHS } from "@/data/legal/constants";
import { useLocale } from "@/i18n/locale-context";

export function SiteFooter() {
  const pathname = usePathname();
  const { messages } = useLocale();

  if (pathname.startsWith("/missions/")) {
    return null;
  }

  return (
    <footer className="shrink-0 border-t border-ml-border bg-[color-mix(in_srgb,var(--ml-bg-0)_92%,transparent)]">
      <div className="mx-auto flex w-full max-w-[86rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="font-mono text-[11px] tracking-[0.08em] text-ml-text-muted uppercase">
          MLINI
        </p>
        <nav
          aria-label={messages.legalNavLabel}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[length:var(--ml-text-xs)]"
        >
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-ml-text-muted underline-offset-2 transition hover:text-ml-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          >
            {messages.legalPrivacy}
          </Link>
          <Link
            href={LEGAL_PATHS.terms}
            className="text-ml-text-muted underline-offset-2 transition hover:text-ml-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          >
            {messages.legalTerms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
