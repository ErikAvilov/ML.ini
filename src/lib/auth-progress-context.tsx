"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthIdentity } from "@/lib/auth/types";
import type { PlayerProgress } from "@/lib/types";
import type { AuthProgressStatus } from "@/lib/progress/effective";
import { emptyCloudProgress } from "@/lib/progress/effective";

export type AuthProgressState = {
  status: AuthProgressStatus;
  identity: AuthIdentity | null;
  /** Set whenever status === 'authenticated'. */
  cloudProgress: PlayerProgress | null;
};

type AuthProgressContextValue = AuthProgressState & {
  commit: (next: AuthProgressState) => void;
  patchCloudProgress: (next: PlayerProgress) => void;
};

const AuthProgressContext = createContext<AuthProgressContextValue | null>(
  null
);

function normalizeInitial(initial: AuthProgressState): AuthProgressState {
  if (initial.status === "authenticated") {
    return {
      status: "authenticated",
      identity: initial.identity,
      cloudProgress: initial.cloudProgress ?? emptyCloudProgress(),
    };
  }
  if (initial.status === "anonymous") {
    return { status: "anonymous", identity: null, cloudProgress: null };
  }
  return { status: "loading", identity: null, cloudProgress: null };
}

/**
 * Must receive a server-resolved initialState so the first client render
 * matches SSR (no anonymous flash, no local XP while authenticated).
 */
export function AuthProgressProvider({
  initialState,
  children,
}: {
  initialState: AuthProgressState;
  children: ReactNode;
}) {
  const [state, setState] = useState(() => normalizeInitial(initialState));

  const commit = useCallback((next: AuthProgressState) => {
    const normalized = normalizeInitial(next);
    setState(normalized);
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as unknown as { __mliniProgressDebug?: unknown }).__mliniProgressDebug =
        {
          authStatus: normalized.status,
          source:
            normalized.status === "authenticated"
              ? "cloud"
              : normalized.status === "anonymous"
                ? "local"
                : "pending",
          cloudXp: normalized.cloudProgress?.xp ?? null,
          identityUserId: normalized.identity?.userId ?? null,
          boot: "client-commit",
        };
    }
  }, []);

  const patchCloudProgress = useCallback((next: PlayerProgress) => {
    setState((prev) => {
      if (prev.status !== "authenticated") return prev;
      return { ...prev, cloudProgress: next };
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, commit, patchCloudProgress }),
    [state, commit, patchCloudProgress]
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (
      window as unknown as { __mliniProgressDebug?: unknown }
    ).__mliniProgressDebug = {
      authStatus: state.status,
      source:
        state.status === "authenticated"
          ? "cloud"
          : state.status === "anonymous"
            ? "local"
            : "pending",
      cloudXp: state.cloudProgress?.xp ?? null,
      identityUserId: state.identity?.userId ?? null,
      boot: "server-initial",
    };
  }, [state]);

  return (
    <AuthProgressContext.Provider value={value}>
      {children}
    </AuthProgressContext.Provider>
  );
}

export function useAuthProgressState(): AuthProgressContextValue {
  const ctx = useContext(AuthProgressContext);
  if (!ctx) {
    throw new Error("useAuthProgressState must be used within AuthProgressProvider");
  }
  return ctx;
}
