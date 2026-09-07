import { NextResponse } from "next/server";
import { createMission02 } from "@/data/missions/mission-02";
import { createMission03 } from "@/data/missions/mission-03";
import { EVAL_MODEL } from "@/lib/ai-client";
import { compareIsolatedVsBatch } from "@/lib/eval/batch-compare";
import {
  BATCH_EVAL_PROMPTS,
  promptsForMission,
} from "@/lib/eval/prompt-fixtures";

export const runtime = "nodejs";
export const maxDuration = 300;

interface Body {
  missionId?: string;
  promptId?: string;
  instruction?: string;
}

/**
 * Development-only comparison endpoint.
 * Not linked from product UI. Returns 404 outside development.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const missionId = body.missionId ?? "mission-03";
  const mission =
    missionId === "mission-02"
      ? createMission02("en")
      : missionId === "mission-03"
        ? createMission03("en")
        : null;

  if (!mission) {
    return NextResponse.json({ error: "Unsupported mission" }, { status: 400 });
  }

  const fixture =
    (body.promptId
      ? BATCH_EVAL_PROMPTS.find((p) => p.id === body.promptId)
      : promptsForMission(missionId)[0]) ?? null;

  const instruction = body.instruction?.trim() || fixture?.instruction;
  if (!instruction) {
    return NextResponse.json(
      { error: "instruction or known promptId required" },
      { status: 400 }
    );
  }

  try {
    const report = await compareIsolatedVsBatch({
      mission,
      instruction,
      promptId: fixture?.id ?? "custom",
      promptLabel: fixture?.label ?? "Custom instruction",
      locale: fixture?.locale ?? "en",
    });

    return NextResponse.json({
      model: EVAL_MODEL,
      report,
    });
  } catch (err) {
    console.error("[dev/batch-eval]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Batch eval failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    model: EVAL_MODEL,
    prompts: BATCH_EVAL_PROMPTS.map((p) => ({
      id: p.id,
      label: p.label,
      missionIds: p.missionIds,
      notes: p.notes,
    })),
  });
}
