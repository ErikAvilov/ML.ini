/** MLINI player username: 3–20 chars, letters/digits/_ ; uniqueness is case-insensitive in DB. */
export const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
export const USERNAME_CHAR_REGEX = /^[A-Za-z0-9_]+$/;

export type UsernameFormatError = "too_short" | "too_long" | "invalid_chars";

export function normalizeUsernameInput(raw: string): string {
  return raw.trim();
}

export function validateUsernameFormat(
  raw: string
): UsernameFormatError | null {
  const value = normalizeUsernameInput(raw);
  if (value.length < 3) return "too_short";
  if (value.length > 20) return "too_long";
  if (!USERNAME_CHAR_REGEX.test(value)) return "invalid_chars";
  if (!USERNAME_REGEX.test(value)) return "invalid_chars";
  return null;
}

export function isUsernameConfigured(
  username: string | null | undefined
): boolean {
  return typeof username === "string" && username.length > 0;
}

/**
 * Default username at account creation: first name token + short UUID hex.
 * Fits profiles_username_format_check (3–20, [A-Za-z0-9_]).
 * Unique per user because the UUID fragment is unique.
 */
export function buildDefaultUsername(
  displayName: string | null | undefined,
  userId: string
): string {
  const idHex = userId.replace(/-/g, "").toLowerCase();
  const suffix = idHex.slice(0, 8) || "00000000";

  const firstToken = (displayName ?? "").trim().split(/\s+/)[0] ?? "";
  let prefix = firstToken
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_]/g, "");

  if (!prefix) prefix = "Player";

  const maxPrefix = Math.max(1, 20 - 1 - suffix.length);
  prefix = prefix.slice(0, maxPrefix);
  if (!prefix) prefix = "P";

  return `${prefix}_${suffix}`;
}

/** Prefer MLINI username; display_name only before onboarding completes. Never email/UUID. */
export function playerDisplayName(
  profile: {
    username: string | null;
    display_name: string | null;
  } | null,
  fallback: string
): string {
  if (!profile) return fallback;
  if (isUsernameConfigured(profile.username)) return profile.username!;
  if (profile.display_name?.trim()) return profile.display_name.trim();
  return fallback;
}

export function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("duplicate") || msg.includes("unique");
}

export function isCheckViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23514") return true;
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("check constraint") || msg.includes("profiles_username");
}
