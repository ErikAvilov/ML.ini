export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_STORAGE_KEY = "mlini-locale-v1";

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}
