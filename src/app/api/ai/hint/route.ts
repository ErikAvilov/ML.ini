import { NextResponse } from "next/server";
import { getAIClient, MODEL, REQUEST_TIMEOUT_MS } from "@/lib/ai-client";

export const runtime = "nodejs";

interface HintBody {
  instruction?: string;
  objective?: string;
}

export async function POST(request: Request) {
  let body: HintBody;

  try {
    body = (await request.json()) as HintBody;
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const instruction = body.instruction?.trim() ?? "";
  const objective = body.objective?.trim() ?? "";

  if (!instruction) {
    return NextResponse.json(
      {
        hint: "Écris d'abord une instruction, puis redemande un indice. Sans instruction, on ne peut pas diagnostiquer ce qui cloche.",
      },
      { status: 200 }
    );
  }

  const client = getAIClient();
  if (!client) {
    return NextResponse.json({
      hint: "Ton instruction semble trop vague pour forcer un format strict. Demande explicitement une réponse limitée aux trois catégories autorisées — sans phrase.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.4,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: `Tu aides un débutant dans un exercice pédagogique.
Objectif du joueur: ${objective || "obtenir POSITIF, NEUTRE ou NEGATIF uniquement."}
Donne UN seul indice court (2-3 phrases max).
Ne donne JAMAIS la solution complète ni un prompt prêt à copier-coller.
Ne cite pas de prompt exemple exact.
Reste en français.`,
          },
          {
            role: "user",
            content: `Voici l'instruction actuelle du joueur:\n"""${instruction}"""\n\nDonne un indice pour l'améliorer sans résoudre à sa place.`,
          },
        ],
      },
      { signal: controller.signal }
    );

    const hint =
      completion.choices[0]?.message?.content?.trim() ||
      "Précise le format de sortie attendu dans ton instruction.";

    return NextResponse.json({ hint });
  } catch {
    return NextResponse.json({
      hint: "Précise le format de sortie attendu. L'application ne peut lire qu'un seul mot parmi POSITIF, NEUTRE et NEGATIF.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
