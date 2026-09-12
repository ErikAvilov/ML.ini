import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/auth/safe-next";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  let next = "/";
  try {
    const form = await request.formData();
    next = safeInternalPath(String(form.get("next") ?? "/"), "/");
  } catch {
    next = "/";
  }

  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
