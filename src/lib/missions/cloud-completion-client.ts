/** Browser helpers to gather solution payloads for trusted cloud completion. */

export const CODE_SOURCE_KEY = "mlini-code-src-v1:";
export const PAYLOAD_REPAIR_TEXT_KEY = "mlini-payload-repair-text-v1:";

export type CloudCompletionRequest = {
  missionId: string;
  locale: string;
  instruction?: string;
  codeSource?: string;
  payloadRepairText?: string;
};

export type CloudCompletionSuccess = {
  ok: true;
  completed: true;
  alreadyCompleted: boolean;
  missionSlug: string;
  kingdomSlug: string;
  xpAwarded: number;
  totalXp: number;
};

export type CloudCompletionFailure = {
  ok: false;
  error: string;
  kind: "validation" | "system" | "anonymous" | "network";
  status: number;
};

export type CloudCompletionResult =
  | CloudCompletionSuccess
  | CloudCompletionFailure;

export function readSessionSolution(missionId: string): {
  codeSource?: string;
  payloadRepairText?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const codeSource =
      sessionStorage.getItem(CODE_SOURCE_KEY + missionId) ?? undefined;
    const payloadRepairText =
      sessionStorage.getItem(PAYLOAD_REPAIR_TEXT_KEY + missionId) ??
      undefined;
    return { codeSource, payloadRepairText };
  } catch {
    return {};
  }
}

export async function requestCloudCompletion(
  input: CloudCompletionRequest
): Promise<CloudCompletionResult> {
  try {
    const res = await fetch("/api/missions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missionId: input.missionId,
        locale: input.locale,
        instruction: input.instruction,
        codeSource: input.codeSource,
        payloadRepairText: input.payloadRepairText,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (res.status === 401 || data.reason === "anonymous") {
      return {
        ok: false,
        error: "anonymous",
        kind: "anonymous",
        status: 401,
      };
    }

    if (!res.ok || data.ok === false) {
      const kind =
        data.kind === "validation" ? "validation" : "system";
      return {
        ok: false,
        error: typeof data.error === "string" ? data.error : "persist_failed",
        kind,
        status: res.status,
      };
    }

    return {
      ok: true,
      completed: true,
      alreadyCompleted: Boolean(data.alreadyCompleted),
      missionSlug: String(data.missionSlug ?? ""),
      kingdomSlug: String(data.kingdomSlug ?? ""),
      xpAwarded: Number(data.xpAwarded ?? 0),
      totalXp: Number(data.totalXp ?? 0),
    };
  } catch {
    return {
      ok: false,
      error: "network",
      kind: "network",
      status: 0,
    };
  }
}
