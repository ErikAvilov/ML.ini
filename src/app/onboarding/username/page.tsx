import { redirect } from "next/navigation";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { safeInternalPath } from "@/lib/auth/safe-next";

interface UsernameOnboardingPageProps {
  searchParams: Promise<{ next?: string }>;
}

/**
 * Legacy route: usernames are now auto-assigned at signup.
 * Keep the URL so old bookmarks/redirects don't 404 — bounce to app.
 */
export default async function UsernameOnboardingPage({
  searchParams,
}: UsernameOnboardingPageProps) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next, "/");
  const identity = await getAuthIdentity();

  if (!identity) {
    redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath === "/onboarding/username" ? "/" : nextPath);
}
