/**
 * Self-check for username format rules.
 * Run: npx tsx scripts/check-username.ts
 */
import assert from "node:assert/strict";
import {
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
