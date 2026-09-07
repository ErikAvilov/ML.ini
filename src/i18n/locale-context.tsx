"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/i18n/config";
import { getCommonMessages, t, type CommonMessages } from "@/i18n/messages/common";

interface LocaleContextValue {
  locale: Locale;
  messages: CommonMessages;
  setLocale: (locale: Locale) => void;
  t: (template: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

let memoryLocale: Locale = DEFAULT_LOCALE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function subscribe(listener: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    memoryLocale = readStoredLocale();
    hydrated = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot(): Locale {
  return memoryLocale;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function writeLocale(next: Locale) {
  memoryLocale = next;
  hydrated = true;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  emit();
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
  }, []);

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
