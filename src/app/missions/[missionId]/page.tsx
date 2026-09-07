import { notFound } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";
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

  return <MissionWorkspace missionSlug={mission.slug} />;
}
