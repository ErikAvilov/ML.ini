/**
 * Self-check: Kingdom snapshot from real kingdoms/missions/progress.
 * Run: npx tsx scripts/check-kingdom-resolve.ts
 */
import assert from "node:assert/strict";
import {
  getKingdomById,
  getKingdoms,
} from "../src/data/kingdoms/construire-avec-ia";
import { getMissions } from "../src/data/missions";
import { DEFAULT_PROGRESS } from "../src/lib/progression";
import { resolveKingdomSnapshot } from "../src/lib/kingdom/resolve-kingdom";
import type { PlayerProgress } from "../src/lib/types";

const locale = "en";
const kingdoms = getKingdoms(locale);
const missions = getMissions(locale);
const kingdom = kingdoms[0];
assert.ok(kingdom);

assert.equal(
  getKingdomById("construire-avec-ia", locale)?.id,
  "construire-avec-ia"
);
assert.equal(getKingdomById("nope", locale), null);

// New learner — intro is current
{
  const snap = resolveKingdomSnapshot({
    kingdom,
    missions,
    progress: DEFAULT_PROGRESS,
    locale,
  });
  assert.equal(snap.current?.mission.id, "mission-00");
  assert.equal(snap.missions.filter((m) => m.isCurrent).length, 1);
  assert.ok(snap.continueHref?.startsWith("/app/kingdom/"));
  assert.ok(snap.continueHref?.includes("/mission/"));
  assert.equal(snap.isNewLearner, true);
  assert.equal(snap.isComplete, false);
  assert.equal(snap.boss?.mission.id, "mission-10");
  assert.equal(snap.boss?.mission.kind, "boss");
  assert.equal(snap.boss?.status, "locked");
  const locked = snap.missions.find((m) => m.mission.id === "mission-02");
  assert.equal(locked?.status, "locked");
}

// Mid progress
{
  const progress: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    completedMissions: ["mission-00", "mission-01"],
    unlockedMissions: ["mission-00", "mission-01", "mission-02"],
    lastPlayedMissionId: "mission-01",
    unlockedSkills: ["llm-fundamentals-1"],
  };
  const snap = resolveKingdomSnapshot({
    kingdom,
    missions,
    progress,
    locale,
  });
  assert.equal(snap.current?.mission.id, "mission-02");
  assert.equal(snap.isNewLearner, false);
  const done = snap.missions.find((m) => m.mission.id === "mission-01");
  assert.equal(done?.status, "completed");
  assert.ok(snap.upcomingSkills.some((s) => s.id === "prompting-1"));
}

// All playable core complete → kingdom complete; boss still present
{
  const playableCore = missions.filter(
    (m) =>
      kingdom.missionIds.includes(m.id) &&
      m.kind !== "intro" &&
      m.playable
  );
  const progress: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    completedMissions: playableCore.map((m) => m.id).concat(["mission-00"]),
    unlockedMissions: playableCore.map((m) => m.id).concat(["mission-00"]),
  };
  const snap = resolveKingdomSnapshot({
    kingdom,
    missions,
    progress,
    locale,
  });
  assert.equal(snap.isComplete, true);
  assert.ok(snap.boss);
}

console.log("kingdom-resolve: ok");
