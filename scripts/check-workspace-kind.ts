/**
 * Self-check: resolveWorkspaceKind for every canonical mission family.
 * Run: npx tsx scripts/check-workspace-kind.ts
 */
import assert from "node:assert/strict";
import { getMissions } from "../src/data/missions";
import {
  isPlaygroundWorkspace,
  resolveWorkspaceKind,
} from "../src/lib/missions/resolve-workspace-kind";

const missions = getMissions("en");
const byId = Object.fromEntries(missions.map((m) => [m.id, m]));

function expect(
  id: string,
  kind: string,
  codeFillMode?: string
) {
  const mission = byId[id];
  assert.ok(mission, `missing ${id}`);
  const r = resolveWorkspaceKind(mission);
  assert.equal(r.kind, kind, `${id} kind`);
  if (codeFillMode) {
    assert.equal(r.kind, "code-fill", `${id} expected code-fill`);
    if (r.kind === "code-fill") {
      assert.equal(r.codeFillMode, codeFillMode, `${id} codeFillMode`);
    }
  } else {
    assert.equal(
      r.kind === "code-fill",
      false,
      `${id} must not be code-fill`
    );
  }
}

expect("mission-00", "intro");
expect("mission-01", "prompt");
expect("mission-02", "prompt");
expect("mission-03", "prompt");
expect("mission-04", "payload-repair");
expect("mission-05", "code-fill", "logic");
expect("mission-06", "code-fill", "ai-integration");
expect("mission-07", "coming-soon");
expect("mission-08", "coming-soon");
expect("mission-09", "coming-soon");
expect("mission-10", "coming-soon"); // boss placeholder, !playable

assert.equal(isPlaygroundWorkspace("prompt"), true);
assert.equal(isPlaygroundWorkspace("payload-repair"), true);
assert.equal(isPlaygroundWorkspace("code-fill"), true);
assert.equal(isPlaygroundWorkspace("intro"), false);
assert.equal(isPlaygroundWorkspace("coming-soon"), false);
assert.equal(isPlaygroundWorkspace("unsupported"), false);

// Discriminated union: code-fill always carries mode
{
  const r = resolveWorkspaceKind(byId["mission-05"]!);
  assert.equal(r.kind, "code-fill");
  if (r.kind === "code-fill") {
    assert.equal(r.codeFillMode, "logic");
  }
}
{
  const r = resolveWorkspaceKind(byId["mission-06"]!);
  assert.equal(r.kind, "code-fill");
  if (r.kind === "code-fill") {
    assert.equal(r.codeFillMode, "ai-integration");
  }
}
{
  const r = resolveWorkspaceKind(byId["mission-01"]!);
  assert.equal(r.kind, "prompt");
  if (r.kind === "prompt") {
    // no codeFillMode field on this branch
    assert.equal("codeFillMode" in r, false);
  }
}

// Exhaustive coverage: every registry mission resolves to a known kind
for (const m of missions) {
  const r = resolveWorkspaceKind(m);
  assert.notEqual(r.kind, "unsupported", `${m.id} must not be unsupported`);
}

console.log("workspace-kind: ok");
