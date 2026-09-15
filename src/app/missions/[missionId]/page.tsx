import { notFound, redirect } from "next/navigation";
import { resolveCanonicalMission } from "@/lib/missions/canonical";
import { appMissionPath } from "@/lib/missions/mission-routes";
import { getRequestLocale } from "@/i18n/get-request-locale";

interface PageProps {
  params: Promise<{ missionId: string }>;
}

/**
 * Legacy `/missions/[slug]` → canonical `/app/kingdom/.../mission/...`.
 * Preserves mission slug compatibility.
 */
export default async function MissionLegacyRedirectPage({ params }: PageProps) {
  const { missionId } = await params;
  const locale = await getRequestLocale();
  const ref = resolveCanonicalMission(missionId, locale);
  if (!ref) notFound();
  redirect(appMissionPath(ref.kingdomSlug, ref.missionSlug));
}
