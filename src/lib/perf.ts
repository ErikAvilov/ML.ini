/** Dev/perf flag — set MLINI_PERF_LOG=1 to emit server timing lines. */
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
