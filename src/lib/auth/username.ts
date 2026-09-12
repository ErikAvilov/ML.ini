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
