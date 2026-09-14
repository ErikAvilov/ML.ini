import { notFound } from "next/navigation";
import { getKingdomById, getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { KingdomView } from "@/components/kingdom/KingdomView";

interface PageProps {
  params: Promise<{ kingdomId: string }>;
}

export function generateStaticParams() {
  return getKingdoms("en").map((k) => ({ kingdomId: k.id }));
}

export default async function AppKingdomPage({ params }: PageProps) {
  const { kingdomId } = await params;
  // Locale-agnostic id check — ids are stable across locales.
  if (!getKingdomById(kingdomId, "en")) {
    notFound();
  }

  return <KingdomView kingdomId={kingdomId} />;
}
