export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["en", "fr"];

/** Product default — English unless the user explicitly chooses otherwise. */
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie readable by the server so SSR matches the first paint. */
export const LOCALE_COOKIE_NAME = "mlini-locale";

/** Legacy client key — kept in sync with the cookie for migration. */
export const LOCALE_STORAGE_KEY = "mlini-locale-v1";

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}
