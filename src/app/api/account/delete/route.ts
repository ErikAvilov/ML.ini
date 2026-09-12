import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteAccountForUser } from "@/lib/auth/delete-account";
import { auth } from "@/lib/better-auth/auth";
import { ACCOUNT_DELETE_CONFIRM_PHRASE } from "@/data/legal/constants";

export const runtime = "nodejs";

type Body = {
  confirmation?: unknown;
  /** Ignored — deletion target always comes from the verified session. */
  userId?: unknown;
};

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const confirmation =
    typeof body.confirmation === "string" ? body.confirmation.trim() : "";
  if (confirmation !== ACCOUNT_DELETE_CONFIRM_PHRASE) {
    return NextResponse.json(
      { ok: false, error: "confirmation_required" },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  try {
    await deleteAccountForUser(user.id);
  } catch {
    console.error("[account/delete] deletion failed for session user");
    return NextResponse.json(
      { ok: false, error: "delete_failed" },
      { status: 500 }
    );
  }

  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // Account already removed — client will hard-navigate home.
  }

  return NextResponse.json({ ok: true });
}
