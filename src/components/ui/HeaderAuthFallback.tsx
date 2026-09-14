"use client";

import { useLocale } from "@/i18n/locale-context";

/**
 * Neutral AUTH_LOADING chrome — not SIGN IN, not local XP.
 * Reserves space so the header does not jump when identity resolves.
 */
export function HeaderAuthFallback() {
  const { messages } = useLocale();

  return (
    <>
      <div
        className="hidden h-[34px] w-[7.5rem] animate-pulse border border-ml-border bg-ml-surface-1 sm:block"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        aria-hidden
      />
      <div
        className="h-8 w-8 animate-pulse rounded-full border border-ml-border bg-ml-surface-2"
        role="status"
        aria-label={messages.authSignedInTitle}
      />
    </>
  );
}
