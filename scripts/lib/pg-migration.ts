/**
 * HISTORICAL MIGRATION HELPERS — not imported by the MLINI runtime.
 * PostgreSQL helpers for Supabase → Neon migration scripts.
 */
import dns from "node:dns";
import { Pool, type PoolConfig } from "pg";

dns.setDefaultResultOrder("ipv4first");

/** Force IPv4 lookups when AAAA is unreachable (common on WSL). */
function ipv4Lookup(
  hostname: string,
  _options: unknown,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string,
    family: number
  ) => void
) {
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    if (!err) {
      callback(null, address, family);
      return;
    }
    // Fall back to any family if no A record (should be rare after pooler rewrite).
    dns.lookup(hostname, callback);
  });
}

/**
 * Direct `db.<ref>.supabase.co` is often IPv6-only.
 * Rewrite to the session pooler (IPv4) when needed.
 */
export function resolveSupabaseSourceUrl(raw: string): string {
  const u = new URL(raw);
  if (!u.hostname.startsWith("db.") || !u.hostname.endsWith(".supabase.co")) {
    return raw;
  }

  const ref = u.hostname.split(".")[1];
  if (!ref) return raw;

  const region =
    process.env.SUPABASE_POOLER_REGION?.trim() || "eu-central-1";
  const port = process.env.SUPABASE_POOLER_PORT?.trim() || "5432";
  const host =
    process.env.SUPABASE_POOLER_HOST?.trim() ||
    `aws-0-${region}.pooler.supabase.com`;

  const rewritten = new URL(raw);
  rewritten.hostname = host;
  rewritten.port = port;
  // Pooler requires project-scoped role name.
  if (!rewritten.username.includes(".")) {
    rewritten.username = `postgres.${ref}`;
  }
  return rewritten.toString();
}

export function createPgPool(
  connectionString: string,
  overrides: PoolConfig = {}
): Pool {
  return new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 20_000,
    ssl: connectionString.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
    // @ts-expect-error pg LookupFunction typing varies by @types/pg version
    lookup: ipv4Lookup,
    ...overrides,
  });
}

export function createSupabaseSourcePool(rawUrl: string): Pool {
  return createPgPool(resolveSupabaseSourceUrl(rawUrl));
}

export function hostHint(url: string | undefined): string {
  if (!url) return "(missing)";
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "(unparseable)";
  }
}

export function assertDistinctMigrationTargets(
  sourceUrl: string,
  destUrl: string
): { sourceHost: string; destHost: string } {
  const sourceHost = hostHint(sourceUrl);
  const destHost = hostHint(destUrl);

  if (sourceHost === destHost) {
    throw new Error(
      `Abort: source and destination appear identical (${sourceHost})`
    );
  }
  if (!sourceHost.includes("supabase")) {
    throw new Error(
      `Abort: source does not look like Supabase (got ${sourceHost})`
    );
  }
  if (!destHost.includes("neon.tech") && !destHost.includes("neon")) {
    throw new Error(`Abort: destination does not look like Neon (got ${destHost})`);
  }
  if (sourceHost.includes("neon")) {
    throw new Error(`Abort: source appears to be Neon (${sourceHost})`);
  }

  return { sourceHost, destHost };
}
