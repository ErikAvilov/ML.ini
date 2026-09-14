"use client";

import { useMissionRoutes } from "@/components/mission/MissionRouteProvider";
import { MissionNavBar } from "@/components/mission/MissionNavBar";
import { MissionTopBar } from "@/components/mission/MissionTopBar";
import type { MissionDefinition } from "@/lib/types";
import type { AuthIdentity } from "@/lib/auth/types";

interface MissionChromeBarProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  identity?: AuthIdentity | null;
}

/** Picks legacy MissionNavBar vs app MissionTopBar from route context. */
export function MissionChromeBar({
  mission,
  missions,
  identity = null,
}: MissionChromeBarProps) {
  const { chrome } = useMissionRoutes();
  if (chrome === "app") {
    return (
      <MissionTopBar
        mission={mission}
        missions={missions}
        identity={identity}
      />
    );
  }
  return (
    <MissionNavBar mission={mission} missions={missions} identity={identity} />
  );
}
