import { NextResponse } from "next/server";
import { classifyBatchItems } from "@/lib/ai-batch-classify";
import { getMissingKeyMessage } from "@/lib/ai-client";
import {
  getApiMessages,
  resolveLocale,
} from "@/i18n/messages/api";

export const runtime = "nodejs";
export const maxDuration = 120;

interface BatchBody {
  instruction?: string;
  tests?: Array<{ id?: string; message?: string }>;
  locale?: string;
}

export async function POST(request: Request) {
  let body: BatchBody;

  try {
    body = (await request.json()) as BatchBody;
  } catch {
    return NextResponse.json(
      { error: getApiMessages("fr").invalidJson },
      { status: 400 }
    );
  }

  const locale = resolveLocale(body.locale);
  const msg = getApiMessages(locale);
  const instruction = body.instruction?.trim() ?? "";
  const tests = (body.tests ?? [])
    .map((t) => ({
      testId: t.id?.trim() ?? "",
      message: t.message?.trim() ?? "",
    }))
    .filter((t) => t.testId && t.message);

  if (!instruction) {
    return NextResponse.json(
      { error: msg.instructionRequired },
      { status: 400 }
    );
  }

  if (tests.length === 0) {
    return NextResponse.json(
      { error: msg.messageRequired },
      { status: 400 }
    );
  }

  try {
    const { results, warnings } = await classifyBatchItems({
      instruction,
      tests,
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: msg.emptyModel, results: [], warnings },
        { status: 502 }
      );
    }

    return NextResponse.json({ results, warnings });
  } catch (err) {
    if (err instanceof Error && err.message === "MISSING_KEY") {
      return NextResponse.json(
        { error: getMissingKeyMessage() },
        { status: 503 }
      );
    }

    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" ||
        err.name === "APIUserAbortError" ||
        err.message.toLowerCase().includes("aborted"));

    if (aborted) {
      return NextResponse.json({ error: msg.timeout }, { status: 504 });
    }

    console.error("[classify-batch]", err);
    return NextResponse.json({ error: msg.modelError }, { status: 500 });
  }
}
