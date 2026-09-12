/**
 * Local persistence layer for mission instruction drafts (browser only).
 */

const DRAFTS_KEY = "mlini-mission-drafts-v1";

type DraftMap = Record<string, string>;

function readAll(): DraftMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DraftMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: DraftMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(map));
}

export function loadMissionDraft(missionId: string): string {
  return readAll()[missionId] ?? "";
}

export function saveMissionDraft(missionId: string, instruction: string): void {
  const map = readAll();
  if (!instruction.trim()) {
    delete map[missionId];
  } else {
    map[missionId] = instruction;
  }
  writeAll(map);
}

export function clearMissionDraft(missionId: string): void {
  const map = readAll();
  if (!(missionId in map)) return;
  delete map[missionId];
  writeAll(map);
}
