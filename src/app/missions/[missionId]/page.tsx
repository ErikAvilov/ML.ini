import { notFound } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";
import { getMissionBySlug, missions } from "@/data/missions";

interface PageProps {
  params: Promise<{ missionId: string }>;
}

export function generateStaticParams() {
  return missions.map((m) => ({ missionId: m.slug }));
}

export default async function MissionPage({ params }: PageProps) {
  const { missionId } = await params;
  const mission = getMissionBySlug(missionId);
  if (!mission) notFound();

  const nextMission =
    missions.find((m) => m.order === mission.order + 1) ?? null;

  return (
    <MissionWorkspace
      mission={mission}
      missions={missions}
      nextMissionId={nextMission?.id ?? null}
    />
  );
}
