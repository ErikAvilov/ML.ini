import { NextResponse } from "next/server";
import {
  completeChat,
  getMissingKeyMessage,
  hasAICredentials,
  REQUEST_TIMEOUT_MS,
} from "@/lib/ai-client";
import {
  getApiMessages,
  resolveLocale,
} from "@/i18n/messages/api";
import { AI_INTEGRATION_JSON_SCHEMA } from "@/lib/missions/ai-integration-json";

export const runtime = "nodejs";

interface ClassifyBody {
  instruction?: string;
  message?: string;
  locale?: string;
  /** Mission 06: ask provider for application/json (schema when supported). */
  expectJson?: boolean;
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
  const expectJson = body.expectJson === true;

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

  if (!hasAICredentials()) {
    return NextResponse.json(
      { error: msg.missingKey || getMissingKeyMessage() },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const { text: output } = await completeChat({
      maxOutputTokens: 1024,
      signal: controller.signal,
      ...(expectJson
        ? {
            jsonSchema: AI_INTEGRATION_JSON_SCHEMA as unknown as Record<
              string,
              unknown
            >,
          }
        : {}),
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
    });

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
