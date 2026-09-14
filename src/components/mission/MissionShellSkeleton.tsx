/** Geometry-preserving shell skeleton for Mission focus route. */
export function MissionShellSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-ml-canvas"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-ml-border bg-ml-surface-1 px-4">
        <div className="h-6 w-16 rounded-sm bg-ml-border/80" />
        <div className="h-3 w-24 rounded-sm bg-ml-border/60" />
        <div className="mx-auto h-4 w-44 rounded-sm bg-ml-border/70" />
        <div className="ml-auto h-7 w-14 rounded-sm bg-ml-border/60" />
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
        <div className="ml-mission-learn hidden border-r border-ml-border p-5 lg:block">
          <div className="h-3 w-20 rounded-sm bg-ml-border/70" />
          <div className="mt-3 h-7 w-48 max-w-full rounded-sm bg-ml-border/80" />
          <div className="mt-5 h-16 w-full rounded-sm bg-ml-border/40" />
          <div className="mt-4 h-3 w-full rounded-sm bg-ml-border/50" />
          <div className="mt-2 h-3 w-5/6 rounded-sm bg-ml-border/40" />
          <div className="mt-6 h-24 w-full rounded-sm bg-ml-border/30" />
        </div>
        <div className="ml-mission-workspace p-4">
          <div className="h-3 w-28 rounded-sm bg-ml-border/70" />
          <div className="mt-3 h-10 w-full rounded-sm bg-ml-border/40" />
          <div className="mt-5 h-36 w-full rounded-sm bg-ml-border/35" />
          <div className="mt-4 h-9 w-24 rounded-sm bg-ml-border/60" />
        </div>
      </div>
    </div>
  );
}
