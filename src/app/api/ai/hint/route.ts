import { NextResponse } from "next/server";
import {
  completeChat,
  hasAICredentials,
  REQUEST_TIMEOUT_MS,
} from "@/lib/ai-client";
import {
  getApiMessages,
  resolveLocale,
  sentimentLabelList,
} from "@/i18n/messages/api";

export const runtime = "nodejs";

interface HintBody {
  instruction?: string;
  objective?: string;
  locale?: string;
}

export async function POST(request: Request) {
  let body: HintBody;

  try {
    body = (await request.json()) as HintBody;
  } catch {
    return NextResponse.json(
      { error: getApiMessages("fr").invalidJson },
      { status: 400 }
    );
  }

  const locale = resolveLocale(body.locale);
  const msg = getApiMessages(locale);
  const labels = sentimentLabelList(locale);
  const instruction = body.instruction?.trim() ?? "";
  const objective = body.objective?.trim() ?? "";

  if (!instruction) {
    return NextResponse.json(
      { hint: msg.hintNoInstruction },
      { status: 200 }
    );
  }

  if (!hasAICredentials()) {
    return NextResponse.json({
      hint: msg.hintFallbackVague,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const { text } = await completeChat({
      maxOutputTokens: 1024,
      signal: controller.signal,
      messages: [
        {
          role: "system",
          content: msg.hintSystem(objective, labels),
        },
        {
          role: "user",
          content: msg.hintUser(instruction),
        },
      ],
    });

    const hint = text || msg.hintDefault;
    return NextResponse.json({ hint });
  } catch {
    return NextResponse.json({
      hint: msg.hintFallbackFormat(labels),
    });
  } finally {
    clearTimeout(timeout);
  }
}
