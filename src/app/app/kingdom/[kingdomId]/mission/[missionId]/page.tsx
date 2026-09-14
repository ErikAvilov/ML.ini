import { notFound } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { getKingdomById, getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { getMissionById, getMissionBySlug } from "@/data/missions";

interface PageProps {
  params: Promise<{ kingdomId: string; missionId: string }>;
}

export function generateStaticParams() {
  return getKingdoms("en").flatMap((kingdom) =>
    kingdom.missionIds
      .map((id) => getMissionById(id, "en"))
      .filter((m): m is NonNullable<typeof m> => m != null)
      .map((mission) => ({
        kingdomId: kingdom.id,
        missionId: mission.slug,
      }))
  );
}

export default async function AppKingdomMissionPage({ params }: PageProps) {
  const { kingdomId, missionId } = await params;

  const kingdom = getKingdomById(kingdomId, "en");
  if (!kingdom) notFound();

  const mission =
    getMissionBySlug(missionId, "en") ?? getMissionById(missionId, "en");
  if (!mission) notFound();

  if (!kingdom.missionIds.includes(mission.id)) notFound();

  const identity = await getAuthIdentity();

  return (
    <MissionWorkspace
      missionSlug={mission.slug}
      isAuthenticated={Boolean(identity)}
      identity={identity}
      routes={{ chrome: "app", kingdomId: kingdom.id }}
    />
  );
}
