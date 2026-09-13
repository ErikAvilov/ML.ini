import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getNeonAuthPool } from "@/lib/db/neon";
import { onBetterAuthUserCreated } from "@/lib/integrations/user-created";

/**
 * Better Auth → Neon (sole auth runtime).
 * BETTER_AUTH_URL: http://localhost:3000 (local) | https://mlini.dev (prod).
 *
 * Must export `auth` for the Better Auth CLI (`--config`).
 * Server-only by convention — do not import from Client Components.
 */
export const auth = betterAuth({
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
  session: {
    freshAge: 0,
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
