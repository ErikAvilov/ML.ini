import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LEGAL_PATHS } from "@/data/legal/constants";
import { getCommonMessages } from "@/i18n/messages/common";
import { getRequestLocale } from "@/i18n/get-request-locale";

/**
 * Minimal auth/onboarding shell — same identity, less chrome than marketing.
 */
export async function UtilityShell({ children }: { children: ReactNode }) {
  const messages = getCommonMessages(await getRequestLocale());

  return (
    <div
      data-theme="editorial-cartographic"
      className="ml-utility flex min-h-0 flex-1 flex-col bg-ml-canvas text-ml-text-body"
    >
      <header className="shrink-0 border-b border-ml-border">
        <div className="mx-auto flex h-12 w-full max-w-lg items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/" compact />
          <Link
            href="/"
            className="text-[length:var(--ml-text-xs)] text-ml-text-muted transition-colors hover:text-ml-state-active"
          >
            Mlini
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <footer className="shrink-0 border-t border-ml-border">
        <nav
          aria-label={messages.legalNavLabel}
          className="mx-auto flex max-w-lg flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-[length:var(--ml-text-xs)] sm:px-6"
        >
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-ml-text-muted hover:text-ml-state-active"
          >
            {messages.legalPrivacy}
          </Link>
          <Link
            href={LEGAL_PATHS.terms}
            className="text-ml-text-muted hover:text-ml-state-active"
          >
            {messages.legalTerms}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
