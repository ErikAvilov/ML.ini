/**
 * Self-check for username format rules.
 * Run: npx tsx scripts/check-username.ts
 */
import assert from "node:assert/strict";
import {
  buildDefaultUsername,
  isUsernameConfigured,
  normalizeUsernameInput,
  playerDisplayName,
  validateUsernameFormat,
} from "../src/lib/auth/username";

assert.equal(normalizeUsernameInput("  ErikDev  "), "ErikDev");
assert.equal(validateUsernameFormat("er"), "too_short");
assert.equal(validateUsernameFormat("a".repeat(21)), "too_long");
assert.equal(validateUsernameFormat("Erik David"), "invalid_chars");
assert.equal(validateUsernameFormat("Erik!"), "invalid_chars");
assert.equal(validateUsernameFormat("ErikDev"), null);
assert.equal(validateUsernameFormat("erik_dev_01"), null);
assert.equal(isUsernameConfigured(null), false);
assert.equal(isUsernameConfigured(""), false);
assert.equal(isUsernameConfigured("ErikDev"), true);

const uid = "550e8400-e29b-41d4-a716-446655440000";
assert.equal(buildDefaultUsername("Erik Dev", uid), "Erik_550e8400");
assert.equal(buildDefaultUsername("Élodie", uid), "Elodie_550e8400");
assert.equal(buildDefaultUsername(null, uid), "Player_550e8400");
assert.equal(buildDefaultUsername("!!!", uid), "Player_550e8400");
assert.equal(validateUsernameFormat(buildDefaultUsername("A", uid)), null);
assert.ok(buildDefaultUsername("VeryLongFirstNameHere", uid).length <= 20);
assert.equal(
  playerDisplayName(
    { username: "ErikDev", display_name: "From Google" },
    "Voyageur"
  ),
  "ErikDev"
);
assert.equal(
  playerDisplayName(
    { username: null, display_name: "From Google" },
    "Voyageur"
  ),
  "From Google"
);

console.log("username: ok");
