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
 * Proxy must be callable and support `in` checks — `toNextJsHandler` does
 * `"handler" in auth ? auth.handler(req) : auth(req)`.
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
    onAPIError: {
      errorURL: "/auth",
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
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
    account: {
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
      },
    },
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

/** Callable target so `typeof` / `auth(req)` paths work with toNextJsHandler. */
function authCallable(
  ...args: Parameters<AuthInstance["handler"]>
): ReturnType<AuthInstance["handler"]> {
  return getAuth().handler(...args);
}

export const auth: AuthInstance = new Proxy(
  authCallable as unknown as AuthInstance,
  {
    get(_target, prop) {
      if (prop === "then") return undefined;
      const instance = getAuth();
      const value = Reflect.get(instance, prop, instance);
      return typeof value === "function"
        ? (value as (...fnArgs: unknown[]) => unknown).bind(instance)
        : value;
    },
    has(_target, prop) {
      return prop === "handler" || prop in getAuth();
    },
    apply(_target, _thisArg, argArray) {
      return Reflect.apply(
        authCallable,
        undefined,
        argArray as Parameters<typeof authCallable>
      );
    },
  }
);
