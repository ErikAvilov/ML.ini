/**
 * Self-check for account-deletion confirmation phrase.
 * Run: npx tsx scripts/check-account-delete.ts
 */
import assert from "node:assert/strict";
import { ACCOUNT_DELETE_CONFIRM_PHRASE } from "../src/data/legal/constants";

assert.equal(ACCOUNT_DELETE_CONFIRM_PHRASE, "SUPPRIMER");
assert.notEqual("supprimer", ACCOUNT_DELETE_CONFIRM_PHRASE);
assert.notEqual("DELETE", ACCOUNT_DELETE_CONFIRM_PHRASE);

console.log("account-delete: ok");
