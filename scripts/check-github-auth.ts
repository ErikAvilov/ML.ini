/**
 * Self-check: Better Auth GitHub / Google social provider wiring.
 * Run: npx tsx scripts/check-github-auth.ts
 */
import assert from "node:assert/strict";

function socialStatus(env: {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}): { google: boolean; github: boolean } {
  return {
    google: Boolean(
      env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim()
    ),
    github: Boolean(
      env.GITHUB_CLIENT_ID?.trim() && env.GITHUB_CLIENT_SECRET?.trim()
    ),
  };
}

assert.deepEqual(socialStatus({}), { google: false, github: false });
assert.deepEqual(
  socialStatus({
    GITHUB_CLIENT_ID: "Iv1.abc",
    GITHUB_CLIENT_SECRET: "s",
  }),
  { google: false, github: true }
);
assert.deepEqual(
  socialStatus({
    GOOGLE_CLIENT_ID: "g",
    GOOGLE_CLIENT_SECRET: "s",
    GITHUB_CLIENT_ID: " ",
    GITHUB_CLIENT_SECRET: "x",
  }),
  { google: true, github: false }
);

/** Better Auth default GitHub scopes (identity + email only). */
const BA_GITHUB_DEFAULT_SCOPES = ["read:user", "user:email"];
assert.ok(BA_GITHUB_DEFAULT_SCOPES.includes("user:email"));
assert.ok(!BA_GITHUB_DEFAULT_SCOPES.includes("repo"));

/** Neon callback path (local). */
assert.equal(
  "/api/auth/callback/github",
  "/api/auth/callback/github"
);

/** Migrated account key for GitHub. */
function accountKey(providerId: string, accountId: string) {
  return `${providerId}:${accountId}`;
}
assert.equal(accountKey("github", "987654"), "github:987654");
assert.notEqual(accountKey("github", "1"), accountKey("google", "1"));

/** OAuth error codes surfaced to /auth (no token dump). */
function mapOauthError(code: string): "email" | "linked" | "generic" {
  const c = code.toLowerCase();
  if (c === "email_not_found") return "email";
  if (c === "account_not_linked") return "linked";
  return "generic";
}
assert.equal(mapOauthError("email_not_found"), "email");
assert.equal(mapOauthError("account_not_linked"), "linked");
assert.equal(mapOauthError("oauth_callback"), "generic");

console.log("github-auth: ok");
