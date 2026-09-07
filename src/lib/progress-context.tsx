"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  completeMission,
  DEFAULT_PROGRESS,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
  touchLastPlayedMission,
} from "@/lib/progression";
import type { PlayerProgress } from "@/lib/types";

interface ProgressContextValue {
  progress: PlayerProgress;
  ready: boolean;
  completeMissionAndUnlock: (
    missionId: string,
    nextMissionId: string | null,
    xpReward: number,
    rewards?: { skillId?: string; capabilityId?: string }
  ) => PlayerProgress;
  markMissionPlayed: (missionId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

let memoryProgress: PlayerProgress = { ...DEFAULT_PROGRESS };
let didReadStorage = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function hydrateFromStorage() {
  if (didReadStorage || typeof window === "undefined") return;
  memoryProgress = loadProgress();
  didReadStorage = true;
}

function subscribe(listener: () => void) {
  hydrateFromStorage();
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memoryProgress = loadProgress();
      didReadStorage = true;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  queueMicrotask(() => emit());

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot(): PlayerProgress {
  return memoryProgress;
}

function getServerSnapshot(): PlayerProgress {
  return DEFAULT_PROGRESS;
}

function subscribeIsClient(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

function getIsClientSnapshot() {
  return true;
}

function getIsClientServerSnapshot() {
  return false;
}

function writeProgress(next: PlayerProgress) {
  memoryProgress = next;
  didReadStorage = true;
  saveProgress(next);
  emit();
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progress = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const ready = useSyncExternalStore(
    subscribeIsClient,
    getIsClientSnapshot,
    getIsClientServerSnapshot
  );

  const completeMissionAndUnlock = useCallback(
    (
      missionId: string,
      nextMissionId: string | null,
      xpReward: number,
      rewards?: { skillId?: string; capabilityId?: string }
    ) => {
      const next = completeMission(
        memoryProgress,
        missionId,
        nextMissionId,
        xpReward,
        rewards
      );
      writeProgress(next);
      return next;
    },
    []
  );

  const markMissionPlayed = useCallback((missionId: string) => {
    const next = touchLastPlayedMission(memoryProgress, missionId);
    if (next === memoryProgress) return;
    writeProgress(next);
  }, []);

  const resetProgress = useCallback(() => {
    writeProgress({ ...DEFAULT_PROGRESS });
  }, []);

  const value = useMemo(
    () => ({
      progress,
      ready,
      completeMissionAndUnlock,
      markMissionPlayed,
      resetProgress,
    }),
    [
      progress,
      ready,
      completeMissionAndUnlock,
      markMissionPlayed,
      resetProgress,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
}
