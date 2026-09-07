import { NextResponse } from "next/server";
import {
  buildChatCompletionParams,
  getAIClient,
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

  const client = getAIClient();
  if (!client) {
    return NextResponse.json({
      hint: msg.hintFallbackVague,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      buildChatCompletionParams({
        maxCompletionTokens: 1024,
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
      }),
      { signal: controller.signal }
    );

    const hint =
      completion.choices[0]?.message?.content?.trim() || msg.hintDefault;

    return NextResponse.json({ hint });
  } catch {
    return NextResponse.json({
      hint: msg.hintFallbackFormat(labels),
    });
  } finally {
    clearTimeout(timeout);
  }
}
