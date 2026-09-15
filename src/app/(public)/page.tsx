import { redirect } from "next/navigation";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getAppSessionState } from "@/lib/auth/app-session";

/**
 * Public marketing for anonymous visitors.
 * Authenticated users skip the landing — server redirect to World (`/app`).
 */
export default async function HomePage() {
  const session = await getAppSessionState();
  if (session.status === "authenticated") {
    redirect("/app");
  }
  return <HomeExperience />;
}
