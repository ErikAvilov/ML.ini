import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getNeonAuthPool } from "@/lib/db/neon";
import { onBetterAuthUserCreated } from "@/lib/integrations/user-created";

/**
 * Better Auth → Neon (sole auth runtime).
 * BETTER_AUTH_URL: http://localhost:3000 (local) | https://mlini.dev (prod).
 *
 * Lazy init: Next "collect page data" imports this module for many routes.
 * Creating the pool / adapter at import time crashes the build when
 * DATABASE_URL is missing (or floods Neon with parallel workers).
 *
 * Must export `auth` for the Better Auth CLI (`--config`).
 * Server-only by convention — do not import from Client Components.
 */

function createAuth() {
  return betterAuth({
    database: getNeonAuthPool(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
      "http://localhost:3000",
      "https://mlini.dev",
      ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ],
    // Surface OAuth failures (e.g. email_not_found) on the MLINI auth page.
    onAPIError: {
      errorURL: "/auth",
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    // OAuth-only accounts: allow delete without password when session is present.
    // cookieCache: avoid a Neon round-trip on every RSC navigation (signed cookie).
    session: {
      freshAge: 0,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    // Do not auto-merge Google + GitHub solely because emails match.
    account: {
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
      },
    },
    /**
     * user.create.after runs after the DB transaction commits
     * (queueAfterTransactionHook) — so the Neon trigger's
     * integration_events.user.created row is already durable.
     * Webhook failures must never fail signup.
     */
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await onBetterAuthUserCreated({
              id: user.id,
              name: user.name ?? null,
            });
          },
        },
      },
    },
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim()
        ? {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
              // Better Auth defaults already include read:user + user:email.
              // Do not add broader scopes (no repo access).
            },
          }
        : {}),
    },
    plugins: [nextCookies()],
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as {
  __mliniBetterAuth?: AuthInstance;
};

function getAuth(): AuthInstance {
  if (!globalForAuth.__mliniBetterAuth) {
    globalForAuth.__mliniBetterAuth = createAuth();
  }
  return globalForAuth.__mliniBetterAuth;
}

export const auth: AuthInstance = new Proxy({} as AuthInstance, {
  get(_target, prop, _receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});
