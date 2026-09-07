/**
 * Session-scoped hint reveal state (survives navigation within the tab).
 * Cleared when the browser tab/session ends.
 */

const HINTS_KEY = "mlini-hint-reveals-v1";

type HintMap = Record<string, number>;

function readAll(): HintMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(HINTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HintMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: HintMap) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HINTS_KEY, JSON.stringify(map));
}

export function loadHintRevealCount(missionId: string): number {
  const n = readAll()[missionId];
  return typeof n === "number" && n >= 0 ? n : 0;
}

export function saveHintRevealCount(missionId: string, count: number): void {
  const map = readAll();
  map[missionId] = count;
  writeAll(map);
}
