/**
 * Self-check for post-OAuth redirect sanitization.
 * Run: npx tsx scripts/check-safe-next.ts
 */
import assert from "node:assert/strict";
import { safeInternalPath } from "../src/lib/auth/safe-next";

assert.equal(safeInternalPath("/profil"), "/profil");
assert.equal(safeInternalPath("/auth?x=1"), "/auth?x=1");
assert.equal(safeInternalPath("//evil.com"), "/");
assert.equal(safeInternalPath("https://evil.com"), "/");
assert.equal(safeInternalPath("evil.com"), "/");
assert.equal(safeInternalPath("\\evil"), "/");
assert.equal(safeInternalPath(null, "/royaume"), "/royaume");
assert.equal(safeInternalPath(undefined), "/");

console.log("safe-next: ok");
