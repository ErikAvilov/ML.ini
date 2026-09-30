"use client";

import Link from "next/link";
import { LEGAL_PATHS } from "@/data/legal/constants";
import { useLocale } from "@/i18n/locale-context";

export function PublicFooter() {
  const { messages } = useLocale();

  return (
    <footer className="shrink-0 border-t border-ml-border bg-ml-surface-raised">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-10">
        <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
          © {new Date().getFullYear()} Mlini
        </p>
        <nav
          aria-label={messages.legalNavLabel}
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[length:var(--ml-text-xs)]"
        >
          <Link
            href={LEGAL_PATHS.privacy}
            prefetch={false}
            className="text-ml-text-muted underline-offset-2 transition hover:text-ml-text-primary hover:underline focus-visible:outline-none"
          >
            {messages.legalPrivacy}
          </Link>
          <Link
            href={LEGAL_PATHS.terms}
            prefetch={false}
            className="text-ml-text-muted underline-offset-2 transition hover:text-ml-text-primary hover:underline focus-visible:outline-none"
          >
            {messages.legalTerms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
