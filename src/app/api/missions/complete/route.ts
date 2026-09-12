import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { validateMissionAttempt } from "@/lib/missions/validate-attempt";
import { recordMissionCompletion } from "@/lib/missions/record-completion";
import { DEFAULT_LOCALE } from "@/i18n/config";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  missionId?: unknown;
  locale?: unknown;
  instruction?: unknown;
  codeSource?: unknown;
  payloadRepairText?: unknown;
  // Ignored if present — never trusted:
  userId?: unknown;
  xp?: unknown;
  xpAwarded?: unknown;
  totalXp?: unknown;
  level?: unknown;
  passed?: unknown;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const missionId = asString(body.missionId)?.trim();
  if (!missionId) {
    return NextResponse.json({ error: "mission_required" }, { status: 400 });
  }

  const locale = asString(body.locale) === "en" ? "en" : DEFAULT_LOCALE;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { persisted: false, reason: "anonymous" },
      { status: 401 }
    );
  }

  let validation;
  try {
    validation = await validateMissionAttempt({
      missionId,
      locale,
      instruction: asString(body.instruction),
      codeSource: asString(body.codeSource),
      payloadRepairText: asString(body.payloadRepairText),
    });
  } catch (err) {
    const missingKey = err instanceof Error && err.message === "MISSING_KEY";
    return NextResponse.json(
      {
        ok: false,
        error: missingKey ? "ai_unavailable" : "validation_error",
        kind: "system",
      },
      { status: missingKey ? 503 : 500 }
    );
  }

  if (!validation.ok) {
    const status =
      validation.code === "unknown_mission" ||
      validation.code === "not_playable"
        ? 404
        : 422;
    return NextResponse.json(
      {
        ok: false,
        error: validation.code,
        kind: "validation",
      },
      { status }
    );
  }

  try {
    // Session user only — ignore any client-supplied userId.
    const result = await recordMissionCompletion({
      userId: user.id,
      missionId: validation.missionId,
      locale,
    });
    return NextResponse.json({
      ok: true,
      completed: result.completed,
      alreadyCompleted: result.alreadyCompleted,
      missionSlug: result.missionSlug,
      kingdomSlug: result.kingdomSlug,
      xpAwarded: result.xpAwarded,
      totalXp: result.totalXp,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNKNOWN_MISSION") {
      return NextResponse.json(
        { ok: false, error: "unknown_mission", kind: "validation" },
        { status: 404 }
      );
    }
    console.error("[missions/complete] persist failed");
    return NextResponse.json(
      {
        ok: false,
        error: "persist_failed",
        kind: "system",
      },
      { status: 500 }
    );
  }
}
