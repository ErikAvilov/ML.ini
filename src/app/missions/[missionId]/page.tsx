import { notFound } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";
import { getAuthIdentity } from "@/lib/auth/get-identity";
import { getMissionBySlug, getMissionSlugs } from "@/data/missions";

interface PageProps {
  params: Promise<{ missionId: string }>;
}

export function generateStaticParams() {
  return getMissionSlugs().map((slug) => ({ missionId: slug }));
}

export default async function MissionPage({ params }: PageProps) {
  const { missionId } = await params;
  const mission = getMissionBySlug(missionId);
  if (!mission) notFound();

  const identity = await getAuthIdentity();

  return (
    <MissionWorkspace
      missionSlug={mission.slug}
      isAuthenticated={Boolean(identity)}
      identity={identity}
    />
  );
}
