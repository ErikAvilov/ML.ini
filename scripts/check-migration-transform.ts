/**
 * Self-check: Supabase → Better Auth transform helpers.
 * Run: npx tsx scripts/check-migration-transform.ts
 */
import assert from "node:assert/strict";
import {
  isSupportedOAuthProvider,
  mapSupabaseIdentityToBetterAuthAccount,
  mapSupabaseUserToBetterAuth,
  resolveProviderAccountId,
} from "./lib/supabase-to-better-auth";

const user = mapSupabaseUserToBetterAuth({
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "player@example.com",
  email_confirmed_at: new Date("2026-01-01"),
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-02"),
  raw_user_meta_data: {
    full_name: "Erik Dev",
    avatar_url: "https://example.com/a.png",
  },
});

assert.equal(user.id, "550e8400-e29b-41d4-a716-446655440000");
assert.equal(user.email, "player@example.com");
assert.equal(user.name, "Erik Dev");
assert.equal(user.emailVerified, true);
assert.equal(user.image, "https://example.com/a.png");

assert.equal(isSupportedOAuthProvider("google"), true);
assert.equal(isSupportedOAuthProvider("github"), true);
assert.equal(isSupportedOAuthProvider("discord"), false);

const identity = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  user_id: user.id,
  provider: "google",
  provider_id: "google-stable-sub-123",
  identity_data: { sub: "google-stable-sub-123", email: "hidden@example.com" },
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-01"),
};

assert.equal(resolveProviderAccountId(identity), "google-stable-sub-123");

const account = mapSupabaseIdentityToBetterAuthAccount(
  identity,
  "11111111-2222-3333-4444-555555555555"
);
assert.equal(account.providerId, "google");
assert.equal(account.accountId, "google-stable-sub-123");
assert.equal(account.userId, user.id);
assert.equal(account.id, "11111111-2222-3333-4444-555555555555");

const github = mapSupabaseIdentityToBetterAuthAccount(
  {
    ...identity,
    provider: "github",
    provider_id: "987654",
    identity_data: { sub: "987654" },
  },
  "66666666-7777-8888-9999-000000000000"
);
assert.equal(github.providerId, "github");
assert.equal(github.accountId, "987654");

assert.throws(() =>
  mapSupabaseUserToBetterAuth({
    id: user.id,
    email: null,
    email_confirmed_at: null,
    created_at: null,
    updated_at: null,
    raw_user_meta_data: null,
  })
);

console.log("migration-transform: ok");
