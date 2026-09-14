/**
 * Phase 4A: mission route helpers + membership semantics.
 * Run: npx tsx scripts/check-mission-routes.ts
 */
import assert from "node:assert/strict";
import { getKingdomById } from "../src/data/kingdoms/construire-avec-ia";
import { getMissionBySlug } from "../src/data/missions";
import {
  appMissionPath,
  appMissionRoutes,
  legacyMissionRoutes,
  resolveMissionRoutes,
} from "../src/lib/missions/mission-routes";

const kingdom = getKingdomById("construire-avec-ia", "en");
assert.ok(kingdom);

const welcome = getMissionBySlug("welcome-veyra", "en");
assert.ok(welcome);
assert.ok(kingdom.missionIds.includes(welcome.id));

const blackBox = getMissionBySlug("la-boite-noire", "en");
assert.ok(blackBox);

assert.equal(
  appMissionPath(kingdom.id, welcome.slug),
  `/app/kingdom/${kingdom.id}/mission/${welcome.slug}`
);

const app = appMissionRoutes(kingdom.id);
assert.equal(app.chrome, "app");
assert.equal(app.kingdomHref, `/app/kingdom/${kingdom.id}`);
assert.equal(
  app.missionHref(blackBox.slug),
  `/app/kingdom/${kingdom.id}/mission/${blackBox.slug}`
);

const legacy = legacyMissionRoutes();
assert.equal(legacy.chrome, "legacy");
assert.equal(legacy.kingdomHref, "/royaume");
assert.equal(legacy.missionHref(welcome.slug), `/missions/${welcome.slug}`);

const resolved = resolveMissionRoutes({
  chrome: "app",
  kingdomId: kingdom.id,
});
assert.equal(resolved.chrome, "app");
assert.equal(
  resolved.missionHref(welcome.slug),
  app.missionHref(welcome.slug)
);

assert.equal(kingdom.missionIds.includes("not-a-mission"), false);

console.log("mission-routes: ok");
