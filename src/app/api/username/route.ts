import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateNeonUsername } from "@/lib/data/profiles";
import {
  normalizeUsernameInput,
  validateUsernameFormat,
} from "@/lib/auth/username";

export const runtime = "nodejs";

type Body = {
  username?: unknown;
  /** Ignored — target is always the session user. */
  userId?: unknown;
};

/** POST { username } — update own profile only (Neon). */
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

  const username =
    typeof body.username === "string"
      ? normalizeUsernameInput(body.username)
      : "";

  if (!username || validateUsernameFormat(username)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await updateNeonUsername(user.id, username);
    if (result.ok) return NextResponse.json({ ok: true });
    const status =
      result.error === "taken"
        ? 409
        : result.error === "missing"
          ? 404
          : 400;
    return NextResponse.json({ error: result.error }, { status });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
