import type { CodeFillMode, MissionDefinition } from "@/lib/types";

/**
 * Explicit workspace families derived from canonical mission data.
 */
export type WorkspaceKind =
  | "intro"
  | "prompt"
  | "payload-repair"
  | "code-fill"
  | "pipeline"
  | "boss"
  | "coming-soon"
  | "unsupported";

/** Discriminated union — codeFillMode is required iff kind === "code-fill". */
export type WorkspaceResolution =
  | { kind: "intro" }
  | { kind: "prompt" }
  | { kind: "payload-repair" }
  | { kind: "code-fill"; codeFillMode: CodeFillMode }
  | { kind: "pipeline" }
  | { kind: "boss" }
  | { kind: "coming-soon" }
  | { kind: "unsupported" };

/**
 * Resolve which Workspace family a mission belongs to.
 * Order matters: intro / coming-soon / code-fill / payload-repair / prompt.
 * Never silently maps unknown structures to prompt.
 */
export function resolveWorkspaceKind(
  mission: MissionDefinition
): WorkspaceResolution {
  if (mission.kind === "intro") {
    return { kind: "intro" };
  }

  if (!mission.playable || mission.kind === "coming-soon") {
    return { kind: "coming-soon" };
  }

  if (mission.boss) {
    return { kind: "boss" };
  }

  if (mission.codeFill) {
    const mode = mission.codeFill.mode;
    if (
      mode === "logic" ||
      mode === "ai-integration" ||
      mode === "service-action"
    ) {
      return { kind: "code-fill", codeFillMode: mode };
    }
    return { kind: "unsupported" };
  }

  if (mission.pipeline) {
    return { kind: "pipeline" };
  }

  if (mission.payloadRepair) {
    return { kind: "payload-repair" };
  }

  if (mission.kind === "standard" || mission.kind === "boss") {
    return { kind: "prompt" };
  }

  return { kind: "unsupported" };
}

/** Right-pane session workspaces (host renders something interactive). */
export function isSessionWorkspace(kind: WorkspaceKind): boolean {
  return (
    kind === "prompt" ||
    kind === "payload-repair" ||
    kind === "code-fill" ||
    kind === "pipeline" ||
    kind === "boss"
  );
}

/** @deprecated use isSessionWorkspace */
export const isPlaygroundWorkspace = isSessionWorkspace;
