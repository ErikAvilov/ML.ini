import { NextResponse } from "next/server";
import {
  buildChatCompletionParams,
  getAIClient,
  REQUEST_TIMEOUT_MS,
} from "@/lib/ai-client";
import {
  getApiMessages,
  resolveLocale,
} from "@/i18n/messages/api";

export const runtime = "nodejs";

interface ClassifyBody {
  instruction?: string;
  message?: string;
  locale?: string;
}

export async function POST(request: Request) {
  let body: ClassifyBody;

  try {
    body = (await request.json()) as ClassifyBody;
  } catch {
    return NextResponse.json(
      { error: getApiMessages("fr").invalidJson },
      { status: 400 }
    );
  }

  const locale = resolveLocale(body.locale);
  const msg = getApiMessages(locale);
  const instruction = body.instruction?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!instruction) {
    return NextResponse.json(
      { error: msg.instructionRequired },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: msg.messageRequired },
      { status: 400 }
    );
  }

  const client = getAIClient();
  if (!client) {
    return NextResponse.json({ error: msg.missingKey }, { status: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      buildChatCompletionParams({
        // Budget includes hidden reasoning tokens + short mission output.
        maxCompletionTokens: 1024,
        messages: [
          { role: "system", content: msg.pedagogicalConstraints },
          {
            role: "user",
            content: [
              msg.classifyUserPrefix,
              instruction,
              "",
              msg.classifyMessagePrefix,
              message,
            ].join("\n"),
          },
        ],
      }),
      { signal: controller.signal }
    );

    const output = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!output) {
      return NextResponse.json(
        { error: msg.emptyModel, output: "" },
        { status: 502 }
      );
    }

    return NextResponse.json({ output });
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("aborted"));

    if (aborted) {
      return NextResponse.json({ error: msg.timeout }, { status: 504 });
    }

    console.error("[classify]", err);
    return NextResponse.json({ error: msg.modelError }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
