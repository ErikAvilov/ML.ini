import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isNeonUsernameAvailable } from "@/lib/data/profiles";
import {
  normalizeUsernameInput,
  validateUsernameFormat,
} from "@/lib/auth/username";

export const runtime = "nodejs";

type Body = { username?: unknown };

function parseUsername(body: Body): string | null {
  if (typeof body.username !== "string") return null;
  return normalizeUsernameInput(body.username);
}

/** POST { username } → { available: boolean } — Neon only, no PII. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const username = parseUsername(body);
  if (!username || validateUsernameFormat(username)) {
    return NextResponse.json({ available: false });
  }

  try {
    const available = await isNeonUsernameAvailable(username);
    return NextResponse.json({ available });
  } catch {
    return NextResponse.json({ error: "check_failed" }, { status: 500 });
  }
}
