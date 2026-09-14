import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/i18n/config";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export function readLocaleCookieClient(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.slice(LOCALE_COOKIE_NAME.length + 1);
  return isLocale(value) ? value : null;
}

export function writeLocalePreference(locale: Locale): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${COOKIE_MAX_AGE_SEC};samesite=lax`;
  }
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function readStoredLocaleClient(): Locale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}
