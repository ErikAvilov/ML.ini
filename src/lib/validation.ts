import type {
  ClassificationResult,
  SentimentLabel,
  TestSuiteSummary,
} from "@/lib/types";

const ALLOWED: SentimentLabel[] = ["POSITIF", "NEUTRE", "NEGATIF"];

export function normalizeClassification(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?;:]+$/g, "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function parseSentimentLabel(raw: string): SentimentLabel | null {
  const normalized = normalizeClassification(raw);

  // Accepte une réponse qui commence ou se termine par le label, ou est exacte
  for (const label of ALLOWED) {
    const bare = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized === bare) return label;
  }

  // Si le modèle a renvoyé une phrase, ce n'est PAS une catégorie valide
  return null;
}

export function evaluateClassification(
  raw: string,
  expected: SentimentLabel,
  message: string,
  testId: string
): ClassificationResult {
  const label = parseSentimentLabel(raw);
  const isValidCategory = label !== null;
  const matchesExpected = isValidCategory && label === expected;

  return {
    raw,
    normalized: label,
    isValidCategory,
    matchesExpected,
    expected,
    message,
    testId,
  };
}

export function buildFeedback(results: ClassificationResult[]): string {
  const invalid = results.filter((r) => !r.isValidCategory);
  const wrong = results.filter((r) => r.isValidCategory && !r.matchesExpected);
  const passed = results.filter((r) => r.matchesExpected).length;
  const total = results.length;

  if (passed === total) {
    return "Tous les tests sont passés. Ton instruction produit un format exploitable.";
  }

  if (invalid.length > 0) {
    return "Ton analyse est correcte, mais notre application ne sait pas quoi faire d'une phrase entière. Regarde attentivement le format demandé.";
  }

  if (wrong.length > 0) {
    return "Le format est bon, mais certaines classifications ne correspondent pas au sentiment du message. Affute ton instruction.";
  }

  return `${passed} / ${total} tests réussis. Ajuste ton instruction et réessaie.`;
}

export function summarizeSuite(
  results: ClassificationResult[]
): TestSuiteSummary {
  const passed = results.filter((r) => r.matchesExpected).length;
  const total = results.length;

  return {
    passed,
    total,
    results,
    feedback: buildFeedback(results),
    allPassed: passed === total && total > 0,
  };
}

export function xpForLevel(level: number): number {
  return level * 200;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

export function xpProgressInLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  ratio: number;
} {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const needed = xpForLevel(level);
  return {
    level,
    current: remaining,
    needed,
    ratio: needed === 0 ? 0 : remaining / needed,
  };
}
