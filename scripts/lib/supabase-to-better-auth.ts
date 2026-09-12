/**
 * HISTORICAL MIGRATION HELPERS — not imported by the MLINI runtime.
 * Pure transforms: Supabase Auth → Better Auth row shapes.
 * No DB I/O — unit-testable.
 */

export type SupabaseAuthUser = {
  id: string;
  email: string | null;
  email_confirmed_at: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  raw_user_meta_data: Record<string, unknown> | null;
};

export type SupabaseIdentity = {
  id: string;
  user_id: string;
  provider: string;
  provider_id: string;
  identity_data: Record<string, unknown> | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export type BetterAuthUserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BetterAuthAccountRow = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

const SUPPORTED_PROVIDERS = new Set(["google", "github"]);

function asDate(value: Date | string | null | undefined, fallback = new Date()): Date {
  if (!value) return fallback;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function metaString(
  meta: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Map Supabase auth.users → better_auth.user (preserve UUID). */
export function mapSupabaseUserToBetterAuth(
  user: SupabaseAuthUser
): BetterAuthUserRow {
  const meta = user.raw_user_meta_data;
  const name =
    metaString(meta, "full_name") ||
    metaString(meta, "name") ||
    metaString(meta, "user_name") ||
    metaString(meta, "preferred_username") ||
    (user.email ? user.email.split("@")[0] : null) ||
    "Voyageur";

  const image =
    metaString(meta, "avatar_url") || metaString(meta, "picture") || null;

  const email = (user.email ?? "").trim();
  if (!email) {
    throw new Error(`User ${user.id} has no email (Better Auth requires email)`);
  }

  const createdAt = asDate(user.created_at);
  const updatedAt = asDate(user.updated_at, createdAt);

  return {
    id: user.id,
    name,
    email,
    emailVerified: user.email_confirmed_at != null,
    image,
    createdAt,
    updatedAt,
  };
}

/**
 * Stable OAuth subject for Better Auth account.accountId.
 * Inspected: auth.identities.provider_id === identity_data.sub for Google.
 * Prefer provider_id column; fall back to identity_data.sub.
 */
export function resolveProviderAccountId(identity: SupabaseIdentity): string {
  const fromColumn = identity.provider_id?.trim();
  if (fromColumn) return fromColumn;

  const sub = identity.identity_data?.sub;
  if (typeof sub === "string" && sub.trim()) return sub.trim();

  throw new Error(
    `Identity ${identity.id} (${identity.provider}) missing provider_id/sub`
  );
}

export function isSupportedOAuthProvider(provider: string): boolean {
  return SUPPORTED_PROVIDERS.has(provider);
}

/**
 * Map Supabase auth.identities → better_auth.account (no tokens).
 * account.id is a fresh UUID unless caller supplies one for re-runs.
 */
export function mapSupabaseIdentityToBetterAuthAccount(
  identity: SupabaseIdentity,
  accountRowId: string
): BetterAuthAccountRow {
  if (!isSupportedOAuthProvider(identity.provider)) {
    throw new Error(`Unsupported provider: ${identity.provider}`);
  }

  const createdAt = asDate(identity.created_at);
  const updatedAt = asDate(identity.updated_at, createdAt);

  return {
    id: accountRowId,
    accountId: resolveProviderAccountId(identity),
    providerId: identity.provider,
    userId: identity.user_id,
    createdAt,
    updatedAt,
  };
}
