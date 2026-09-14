import { Pool, type PoolClient } from "pg";

/** PostgreSQL schema reserved for Better Auth tables (not MLINI public tables). */
export const BETTER_AUTH_SCHEMA = "better_auth";

/** MLINI application tables live in public. */
export const APP_SCHEMA = "public";

const globalForNeon = globalThis as unknown as {
  __mliniNeonAuthPoolV2?: Pool;
  __mliniNeonAppPoolV2?: Pool;
};

function resolveRuntimeConnectionString(): string {
  // Migrations / CLI: prefer unpooled direct URL (Neon DDL-friendly).
  if (process.env.BETTER_AUTH_USE_DIRECT === "1") {
    const direct =
      process.env.DATABASE_URL_DIRECT?.trim() ||
      process.env.DATABASE_URL?.trim();
    if (!direct) {
      throw new Error(
        "Missing DATABASE_URL_DIRECT (required when BETTER_AUTH_USE_DIRECT=1)"
      );
    }
    return direct;
  }

  const pooled = process.env.DATABASE_URL?.trim();
  if (!pooled) {
    throw new Error("Missing DATABASE_URL (Neon pooled connection)");
  }
  return pooled;
}

/**
 * Neon pooled endpoints reject startup `options=search_path`.
 * Always SET on checkout: Neon pooler (PgBouncer) may RESET backend session
 * state while node-pg reuses the same Client object — a WeakSet "once" cache
 * then leaves search_path as public and Better Auth queries miss `session`/`user`.
 */
function withSearchPath(pool: Pool, schema: string): Pool {
  const originalConnect = pool.connect.bind(pool);

  async function prepare(client: PoolClient): Promise<PoolClient> {
    await client.query(`SET search_path TO ${schema}`);
    return client;
  }

  function connect(): Promise<PoolClient>;
  function connect(
    callback: (
      err: Error | undefined,
      client: PoolClient | undefined,
      done: (release?: boolean | Error) => void
    ) => void
  ): void;
  function connect(
    callback?: (
      err: Error | undefined,
      client: PoolClient | undefined,
      done: (release?: boolean | Error) => void
    ) => void
  ): Promise<PoolClient> | void {
    if (callback) {
      originalConnect(async (err, client, done) => {
        if (err || !client) {
          callback(err, client, done);
          return;
        }
        try {
          await prepare(client);
          callback(undefined, client, done);
        } catch (setErr) {
          done();
          callback(setErr as Error, undefined, done);
        }
      });
      return;
    }

    return originalConnect().then((client) => prepare(client));
  }

  pool.connect = connect as Pool["connect"];
  return pool;
}

function createRuntimePool(schema: string): Pool {
  return withSearchPath(
    new Pool({
      connectionString: resolveRuntimeConnectionString(),
      max: process.env.BETTER_AUTH_USE_DIRECT === "1" ? 1 : 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
    }),
    schema
  );
}

/**
 * Neon connection for Better Auth (runtime / serverless).
 * Session search_path=better_auth so runtime ignores public MLINI tables.
 *
 * Reuse one Pool per isolate (dev + production). Creating a Pool per call
 * forces fresh Neon TCP/TLS handshakes and dominates authenticated RSC latency.
 *
 * Server-only by convention — do not import from Client Components.
 */
export function getNeonAuthPool(): Pool {
  if (globalForNeon.__mliniNeonAuthPoolV2) {
    return globalForNeon.__mliniNeonAuthPoolV2;
  }

  const pool = createRuntimePool(BETTER_AUTH_SCHEMA);
  globalForNeon.__mliniNeonAuthPoolV2 = pool;
  return pool;
}

/**
 * Neon connection for MLINI application tables (public).
 * Do NOT reuse the Better Auth pool (different search_path).
 *
 * Reuse one Pool per isolate (dev + production).
 *
 * Server-only by convention — do not import from Client Components.
 */
export function getNeonAppPool(): Pool {
  if (globalForNeon.__mliniNeonAppPoolV2) {
    return globalForNeon.__mliniNeonAppPoolV2;
  }

  const pool = createRuntimePool(APP_SCHEMA);
  globalForNeon.__mliniNeonAppPoolV2 = pool;
  return pool;
}

/**
 * Direct (non-pooled) Neon connection for admin/migration scripts only.
 * Defaults to better_auth search_path for Better Auth CLI compatibility.
 */
export function createNeonDirectPool(
  schema: typeof BETTER_AUTH_SCHEMA | typeof APP_SCHEMA = BETTER_AUTH_SCHEMA
): Pool {
  const connectionString =
    process.env.DATABASE_URL_DIRECT?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL_DIRECT (or DATABASE_URL) for Neon admin connection"
    );
  }

  return withSearchPath(
    new Pool({
      connectionString,
      max: 1,
    }),
    schema
  );
}
