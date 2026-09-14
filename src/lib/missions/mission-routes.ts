/**
 * Mission URL helpers — Phase 4A routing without changing mission engine.
 */

export type MissionChrome = "legacy" | "app";

/** Serializable props safe to pass from Server Components. */
export type MissionRouteInput = {
  chrome: MissionChrome;
  kingdomId: string;
};

export type MissionRouteConfig = {
  kingdomId: string;
  kingdomHref: string;
  missionHref: (slug: string) => string;
  chrome: MissionChrome;
};

/** Legacy `/missions/[slug]` — back to `/royaume`. */
export function legacyMissionRoutes(
  kingdomId = "construire-avec-ia"
): MissionRouteConfig {
  return {
    kingdomId,
    kingdomHref: "/royaume",
    missionHref: (slug) => `/missions/${slug}`,
    chrome: "legacy",
  };
}

/** Canonical `/app/kingdom/[id]/mission/[slug]`. */
export function appMissionRoutes(kingdomId: string): MissionRouteConfig {
  return {
    kingdomId,
    kingdomHref: `/app/kingdom/${kingdomId}`,
    missionHref: (slug) => `/app/kingdom/${kingdomId}/mission/${slug}`,
    chrome: "app",
  };
}

export function resolveMissionRoutes(
  input?: MissionRouteInput | null
): MissionRouteConfig {
  if (!input || input.chrome === "legacy") {
    return legacyMissionRoutes(input?.kingdomId);
  }
  return appMissionRoutes(input.kingdomId);
}

export function appMissionPath(kingdomId: string, missionSlug: string): string {
  return `/app/kingdom/${kingdomId}/mission/${missionSlug}`;
}
