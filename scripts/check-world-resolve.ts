/**
 * Self-check: World snapshot from real kingdoms/missions/progress.
 * Run: npx tsx scripts/check-world-resolve.ts
 */
import assert from "node:assert/strict";
import { getKingdoms } from "../src/data/kingdoms/construire-avec-ia";
import { getMissions } from "../src/data/missions";
import { DEFAULT_PROGRESS } from "../src/lib/progression";
import {
  resolveNextActionMissionId,
  resolveUpcomingSkillUnlocks,
  resolveWorldSnapshot,
} from "../src/lib/world/resolve-world";
import type { PlayerProgress } from "../src/lib/types";

const locale = "en";
const kingdoms = getKingdoms(locale);
const missions = getMissions(locale);

assert.equal(kingdoms.length, 1, "fixture expects one canonical kingdom");

// New learner → first available (intro)
{
  const snap = resolveWorldSnapshot({
    kingdoms,
    missions,
    progress: DEFAULT_PROGRESS,
    locale,
  });
  assert.equal(snap.kingdoms.length, 1);
  assert.equal(snap.kingdoms[0]?.status, "active");
  assert.equal(snap.nextKingdom, null);
  assert.equal(snap.isNewLearner, true);
  assert.equal(snap.activeKingdom?.continueMission?.id, "mission-00");
  assert.ok(snap.activeKingdom?.continueHref?.startsWith("/app/kingdom/"));
  assert.ok(snap.activeKingdom?.continueHref?.includes("/mission/"));
  assert.ok((snap.activeKingdom?.upcomingMissions.length ?? 0) >= 1);
  assert.ok(snap.curriculumTotal >= snap.curriculumCompleted);
}

// Mid progress — prefer next available over completed lastPlayed
{
  const progress: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    completedMissions: ["mission-00", "mission-01"],
    unlockedMissions: ["mission-00", "mission-01", "mission-02"],
    lastPlayedMissionId: "mission-01",
    unlockedSkills: ["llm-fundamentals-1"],
  };
  const snap = resolveWorldSnapshot({
    kingdoms,
    missions,
    progress,
    locale,
  });
  assert.equal(snap.isNewLearner, false);
  assert.equal(snap.activeKingdom?.status, "active");
  assert.equal(snap.activeKingdom?.continueMission?.id, "mission-02");
  assert.equal(
    resolveNextActionMissionId(progress, missions),
    "mission-02"
  );
  const upcoming = resolveUpcomingSkillUnlocks({
    progress,
    missions,
    locale,
    continueMissionId: "mission-02",
  });
  assert.ok(upcoming.some((s) => s.id === "prompting-1"));
  assert.ok(!upcoming.some((s) => s.id === "llm-fundamentals-1"));
}

console.log("world-resolve: ok");
