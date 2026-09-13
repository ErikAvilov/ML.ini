/** Dev/perf flag — set MLINI_PERF_LOG=1 to emit server timing lines. */

type Store = {
  getSession: number;
  profileProgress: number;
};

function store(): Store {
  const g = globalThis as unknown as { __mliniPerf?: Store };
  if (!g.__mliniPerf) {
    g.__mliniPerf = { getSession: 0, profileProgress: 0 };
  }
  return g.__mliniPerf;
}

export function perfCount(kind: keyof Store): number {
  const s = store();
  s[kind] += 1;
  return s[kind];
}

export function perfLog(label: string, ms: number): void {
  if (process.env.MLINI_PERF_LOG !== "1") return;
  console.info(`[perf] ${label} ${ms.toFixed(1)}ms`);
}

export async function timed<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    perfLog(label, performance.now() - start);
  }
}
