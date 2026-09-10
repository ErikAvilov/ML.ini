/**
 * Self-check for progression celebration builder.
 * Run: npx tsx scripts/check-progression-celebrations.ts
 */
import assert from "node:assert/strict";
import {
  buildCelebrationsAfterMission,
  isMilestoneLevel,
} from "../src/lib/progression-celebrations";
import type { MissionDefinition, PlayerProgress } from "../src/lib/types";
import { DEFAULT_PROGRESS } from "../src/lib/progression";

function mission(partial: Partial<MissionDefinition>): MissionDefinition {
  return {
    id: "mission-02",
    slug: "x",
    order: 2,
    title: "T",
    shortTitle: "T",
    kind: "standard",
    xpReward: 120,
    brief: "",
    objective: "",
    context: "",
    playable: true,
    ...partial,
  };
}

const kingdom = {
  id: "construire-avec-ia",
  name: "Construire avec l'IA",
  missionIds: [
    "mission-00",
    "mission-01",
    "mission-02",
    "mission-03",
    "mission-04",
    "mission-05",
    "mission-06",
    "mission-07",
    "mission-08",
    "mission-09",
    "mission-10",
  ],
};

assert.equal(isMilestoneLevel(10), true);
assert.equal(isMilestoneLevel(3), false);

{
  const before: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    xp: 0,
    level: 1,
  };
  const after: PlayerProgress = {
    ...before,
    xp: 100,
    level: 1,
    completedMissions: ["mission-01"],
  };
  const events = buildCelebrationsAfterMission({
    wasCleared: false,
    before,
    after,
    xpGained: 100,
    mission: mission({ id: "mission-01", title: "La Boîte Noire" }),
    locale: "fr",
    kingdom,
  });
  assert.equal(events.length, 0);
}

{
  const before: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    xp: 180,
    level: 1,
    unlockedTitleIds: [],
    unlockedFrameIds: ["basalt"],
    unlockedAchievementIds: [],
  };
  const after: PlayerProgress = {
    ...before,
    xp: 300,
    level: 2,
    completedMissions: ["mission-01"],
    unlockedTitleIds: ["pioneer"],
    unlockedFrameIds: ["basalt", "electron"],
    unlockedAchievementIds: ["FIRST_CONTACT"],
  };
  const events = buildCelebrationsAfterMission({
    wasCleared: false,
    before,
    after,
    xpGained: 120,
    mission: mission({ id: "mission-01", title: "La Boîte Noire" }),
    locale: "fr",
    kingdom,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].variant, "level-up-reward");
  assert.equal(events[0].reward?.type, "title");
}

{
  const before: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    xp: 1900,
    level: 9,
  };
  const after: PlayerProgress = {
    ...before,
    xp: 2100,
    level: 10,
  };
  const events = buildCelebrationsAfterMission({
    wasCleared: false,
    before,
    after,
    xpGained: 200,
    mission: mission({ id: "mission-05" }),
    locale: "en",
    kingdom,
  });
  assert.equal(events[0].variant, "milestone");
  assert.equal(events[0].level, 10);
}

{
  const core = kingdom.missionIds.filter((id) => id !== "mission-00");
  const before: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    xp: 1000,
    level: 5,
    completedMissions: core.filter((id) => id !== "mission-10"),
    unlockedTitleIds: ["pioneer"],
    unlockedAchievementIds: [],
  };
  const after: PlayerProgress = {
    ...before,
    xp: 1250,
    level: 6,
    completedMissions: [...core],
    unlockedTitleIds: ["pioneer", "kingdom-conqueror"],
    unlockedFrameIds: ["basalt", "boss-gold"],
    unlockedAchievementIds: ["BOSS_DEFEATED"],
  };
  const events = buildCelebrationsAfterMission({
    wasCleared: false,
    before,
    after,
    xpGained: 250,
    mission: mission({ id: "mission-10", kind: "boss", order: 10 }),
    locale: "fr",
    kingdom,
  });
  assert.equal(events[0].variant, "kingdom-complete");
  assert.ok((events[0].rewards?.length ?? 0) >= 1);
  assert.ok(!JSON.stringify(events).toLowerCase().includes("mildred vaincu"));
}

{
  const events = buildCelebrationsAfterMission({
    wasCleared: true,
    before: DEFAULT_PROGRESS,
    after: DEFAULT_PROGRESS,
    xpGained: 0,
    mission: mission({}),
    locale: "fr",
    kingdom,
  });
  assert.equal(events.length, 0);
}

console.log("progression celebrations: ok");
