/**
 * Self-check: Editorial Cartographic semantic token names stay mapped.
 * Run: npx tsx scripts/check-app-theme-tokens.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

assert.match(css, /\[data-theme="editorial-cartographic"\]/);
for (const token of [
  "--ml-canvas",
  "--ml-surface-raised",
  "--ml-surface-inset",
  "--ml-surface-elevated",
  "--ml-text-primary",
  "--ml-text-secondary-sem",
  "--ml-state-active",
  "--ml-state-completed",
  "--ml-state-conceptual",
  "--ml-state-error",
]) {
  assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(css, /\.ml-app/);
assert.match(css, /--font-inter/);

console.log("app-theme-tokens: ok");
