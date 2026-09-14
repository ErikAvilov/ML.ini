/**
 * Effective progression source-of-truth checks (no DB).
 * Run: npx tsx scripts/check-effective-progress.ts
 */
import assert from "node:assert/strict";
import {
  buildCloudPlayerProgress,
  emptyCloudProgress,
  resolveEffectiveProgress,
} from "../src/lib/progress/effective";
import { DEFAULT_PROGRESS } from "../src/lib/progression";
import type { PlayerProgress } from "../src/lib/types";

function withLocalXp(xp: number, completed: string[] = []): PlayerProgress {
  return {
    ...DEFAULT_PROGRESS,
    xp,
    level: 1,
    completedMissions: completed,
    unlockedMissions: ["mission-00", "mission-01", ...completed],
  };
}

// CASE A — anonymous local 100
{
  const snap = resolveEffectiveProgress({
    authStatus: "anonymous",
    localProgress: withLocalXp(100, ["mission-01"]),
    cloudProgress: null,
  });
  assert.equal(snap.source, "local");
  assert.equal(snap.effectiveXp, 100);
  // Hook layers local.ready; pure resolver marks anonymous ready as true.
  assert.equal(snap.ready, true);
  assert.ok(snap.progress.completedMissions.includes("mission-01"));
}

// CASE B — authenticated cloud 0, local 100 → cloud wins
{
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100, ["mission-01"]),
    cloudProgress: emptyCloudProgress(),
  });
  assert.equal(snap.source, "cloud");
  assert.equal(snap.effectiveXp, 0);
  assert.equal(snap.cloudXp, 0);
  assert.equal(snap.localXp, 100);
  assert.equal(snap.progress.completedMissions.length, 0);
  assert.ok(!snap.progress.completedMissions.includes("mission-01"));
}

// CASE C — authenticated cloud 300, local 100
{
  const cloud = buildCloudPlayerProgress({
    totalXp: 300,
    completedMissionIds: ["mission-00", "mission-01"],
  });
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100),
    cloudProgress: cloud,
  });
  assert.equal(snap.effectiveXp, 300);
  assert.equal(snap.source, "cloud");
}

// CASE D — auth loading must NOT resolve to anonymous/local
{
  const snap = resolveEffectiveProgress({
    authStatus: "loading",
    localProgress: withLocalXp(100, ["mission-01"]),
    cloudProgress: null,
  });
  assert.equal(snap.source, "pending");
  assert.equal(snap.ready, false);
  assert.equal(snap.effectiveXp, 0);
  assert.equal(snap.progress.xp, 0);
  assert.equal(snap.progress.completedMissions.length, 0);
}

// CASE E — authenticated empty completions vs local completions
{
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100, ["mission-01", "mission-02"]),
    cloudProgress: emptyCloudProgress(),
  });
  assert.deepEqual(snap.progress.completedMissions, []);
  assert.ok(snap.progress.unlockedMissions.includes("mission-01"));
  assert.ok(!snap.progress.unlockedMissions.includes("mission-02"));
}

// CASE F — logout conceptually = anonymous again (local returns)
{
  const afterLogout = resolveEffectiveProgress({
    authStatus: "anonymous",
    localProgress: withLocalXp(100),
    cloudProgress: null,
  });
  assert.equal(afterLogout.effectiveXp, 100);
  assert.equal(afterLogout.source, "local");
}

// CASE G/H — authenticated never falls back when cloudProgress omitted
{
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100, ["mission-01"]),
    cloudProgress: null,
  });
  assert.equal(snap.effectiveXp, 0);
  assert.equal(snap.source, "cloud");
  assert.deepEqual(snap.progress.completedMissions, []);
}

// Zero XP is valid (not nullish fallback)
{
  const cloud = buildCloudPlayerProgress({
    totalXp: 0,
    completedMissionIds: [],
  });
  assert.equal(cloud.xp, 0);
  assert.equal(cloud.level, 1);
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100),
    cloudProgress: cloud,
  });
  assert.equal(snap.effectiveXp, 0);
}

// CASE: session present must never be reported as anonymous by resolver
{
  const snap = resolveEffectiveProgress({
    authStatus: "authenticated",
    localProgress: withLocalXp(100),
    cloudProgress: emptyCloudProgress(),
  });
  assert.notEqual(snap.authStatus, "anonymous");
  assert.equal(snap.source, "cloud");
}

console.log("effective-progress: ok");
