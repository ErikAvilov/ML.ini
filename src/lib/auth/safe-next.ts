/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs (//evil.com) and absolute URLs.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}
