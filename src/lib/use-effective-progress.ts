"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useAuthProgressState } from "@/lib/auth-progress-context";
import { useProgress } from "@/lib/progress-context";
import {
  resolveEffectiveProgress,
  type EffectiveProgressSnapshot,
} from "@/lib/progress/effective";
import {
  completeMission,
  touchLastPlayedMission,
} from "@/lib/progression";
import type { PlayerProgress } from "@/lib/types";

export type EffectiveProgressValue = EffectiveProgressSnapshot & {
  identity: ReturnType<typeof useAuthProgressState>["identity"];
  completeMissionAndUnlock: (
    missionId: string,
    nextMissionId: string | null,
    xpReward: number,
    rewards?: { skillId?: string; capabilityId?: string }
  ) => PlayerProgress;
  markMissionPlayed: (missionId: string) => void;
  equipTitle: (titleId: string | null) => void;
  equipFrame: (frameId: string) => void;
  resetProgress: () => void;
};

/**
 * Canonical progression hook for UI.
 * Product gate: `/app` is auth-only — cloud progression is canonical.
 * Local/anonymous branch remains for legacy helpers/tests only (unreachable in product).
 */
export function useEffectiveProgress(): EffectiveProgressValue {
  const local = useProgress();
  const auth = useAuthProgressState();

  const snapshot = useMemo(() => {
    const base = resolveEffectiveProgress({
      authStatus: auth.status,
      localProgress: local.progress,
      cloudProgress: auth.cloudProgress,
    });
    // Anonymous: wait for localStorage hydrate. Authenticated: cloud is ready.
    if (base.authStatus === "anonymous") {
      return { ...base, ready: local.ready };
    }
    return base;
  }, [auth.status, auth.cloudProgress, local.progress, local.ready]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (
      window as unknown as { __mliniProgressDebug?: Record<string, unknown> }
    ).__mliniProgressDebug = {
      authStatus: snapshot.authStatus,
      source: snapshot.source,
      cloudXp: snapshot.cloudXp,
      localXp: snapshot.localXp,
      effectiveXp: snapshot.effectiveXp,
      completedCloud: snapshot.progress.completedMissions.length,
    };
  }, [snapshot]);

  const completeMissionAndUnlock = useCallback(
    (
      missionId: string,
      nextMissionId: string | null,
      xpReward: number,
      rewards?: { skillId?: string; capabilityId?: string }
    ) => {
      if (auth.status === "authenticated") {
        const base = auth.cloudProgress ?? snapshot.progress;
        const next = completeMission(
          base,
          missionId,
          nextMissionId,
          xpReward,
          rewards
        );
        auth.patchCloudProgress(next);
        return next;
      }
      return local.completeMissionAndUnlock(
        missionId,
        nextMissionId,
        xpReward,
        rewards
      );
    },
    [auth, local, snapshot.progress]
  );

  const markMissionPlayed = useCallback(
    (missionId: string) => {
      if (auth.status === "authenticated") {
        const base = auth.cloudProgress ?? snapshot.progress;
        const next = touchLastPlayedMission(base, missionId);
        if (next !== base) auth.patchCloudProgress(next);
        return;
      }
      local.markMissionPlayed(missionId);
    },
    [auth, local, snapshot.progress]
  );

  const equipTitle = useCallback(
    (titleId: string | null) => {
      if (auth.status === "authenticated") {
        const base = auth.cloudProgress ?? snapshot.progress;
        if (titleId && !base.unlockedTitleIds.includes(titleId)) return;
        auth.patchCloudProgress({ ...base, equippedTitleId: titleId });
        return;
      }
      local.equipTitle(titleId);
    },
    [auth, local, snapshot.progress]
  );

  const equipFrame = useCallback(
    (frameId: string) => {
      if (auth.status === "authenticated") {
        const base = auth.cloudProgress ?? snapshot.progress;
        if (!base.unlockedFrameIds.includes(frameId)) return;
        auth.patchCloudProgress({ ...base, equippedFrameId: frameId });
        return;
      }
      local.equipFrame(frameId);
    },
    [auth, local, snapshot.progress]
  );

  const resetProgress = useCallback(() => {
    // Cloud reset is not supported here — only clears anonymous local save.
    if (auth.status === "authenticated") return;
    local.resetProgress();
  }, [auth.status, local]);

  return {
    ...snapshot,
    identity: auth.identity,
    completeMissionAndUnlock,
    markMissionPlayed,
    equipTitle,
    equipFrame,
    resetProgress,
  };
}
