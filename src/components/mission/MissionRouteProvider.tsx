"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  legacyMissionRoutes,
  type MissionRouteConfig,
} from "@/lib/missions/mission-routes";

const MissionRouteContext = createContext<MissionRouteConfig>(
  legacyMissionRoutes()
);

export function MissionRouteProvider({
  value,
  children,
}: {
  value: MissionRouteConfig;
  children: ReactNode;
}) {
  return (
    <MissionRouteContext.Provider value={value}>
      {children}
    </MissionRouteContext.Provider>
  );
}

export function useMissionRoutes(): MissionRouteConfig {
  return useContext(MissionRouteContext);
}
