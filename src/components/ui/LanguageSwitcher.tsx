"use client";

import { useLocale } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, messages } = useLocale();

  function select(next: Locale) {
    if (next === locale) return;
    setLocale(next);
  }

  return (
    <div
      className={`inline-flex items-center border border-ml-border bg-ml-surface-1 p-0.5 ${className}`}
      style={{ borderRadius: "var(--ml-frame-radius)" }}
      role="group"
      aria-label={messages.language}
    >
      <button
        type="button"
        onClick={() => select("fr")}
        className={`px-2 py-1 text-[length:var(--ml-text-xs)] font-medium transition ${
          locale === "fr"
            ? "bg-ml-surface-2 text-ml-text"
            : "text-ml-text-muted hover:text-ml-text"
        }`}
        style={{ borderRadius: "calc(var(--ml-frame-radius) - 1px)" }}
        aria-pressed={locale === "fr"}
      >
        {messages.langFr}
      </button>
      <button
        type="button"
        onClick={() => select("en")}
        className={`px-2 py-1 text-[length:var(--ml-text-xs)] font-medium transition ${
          locale === "en"
            ? "bg-ml-surface-2 text-ml-text"
            : "text-ml-text-muted hover:text-ml-text"
        }`}
        style={{ borderRadius: "calc(var(--ml-frame-radius) - 1px)" }}
        aria-pressed={locale === "en"}
      >
        {messages.langEn}
      </button>
    </div>
  );
}
