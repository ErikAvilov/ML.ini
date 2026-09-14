"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Locale } from "@/i18n/config";
import {
  readLocaleCookieClient,
  readStoredLocaleClient,
  writeLocalePreference,
} from "@/i18n/locale-preference";
import { getCommonMessages, t, type CommonMessages } from "@/i18n/messages/common";

interface LocaleContextValue {
  locale: Locale;
  messages: CommonMessages;
  /**
   * Persists preference (cookie + localStorage) and reloads so SSR matches.
   * Not a live in-page switch.
   */
  setLocale: (locale: Locale) => void;
  t: (template: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale] = useState(initialLocale);

  // One-time migration: old localStorage preference → cookie, then reload.
  useEffect(() => {
    const stored = readStoredLocaleClient();
    const cookie = readLocaleCookieClient();
    if (stored && !cookie) {
      writeLocalePreference(stored);
      if (stored !== initialLocale) {
        window.location.reload();
      }
    }
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      writeLocalePreference(next);
      window.location.reload();
    },
    [locale]
  );

  const messages = useMemo(() => getCommonMessages(locale), [locale]);

  const translate = useCallback(
    (template: string, vars: Record<string, string | number> = {}) =>
      t(template, vars),
    []
  );

  const value = useMemo(
    () => ({
      locale,
      messages,
      setLocale,
      t: translate,
    }),
    [locale, messages, setLocale, translate]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
