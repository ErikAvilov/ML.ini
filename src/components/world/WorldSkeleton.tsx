/** Geometry-preserving skeleton for World (MLINI_INTERACTIONS). */
export function WorldSkeleton({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${hideHeader ? "pb-8 pt-8" : "py-8"}`}
      aria-busy="true"
      aria-live="polite"
    >
      {!hideHeader && (
        <>
          <div className="h-3 w-28 rounded-sm bg-ml-border/80" />
          <div className="mt-3 h-8 w-56 max-w-full rounded-sm bg-ml-border/80" />
          <div className="mt-3 h-4 w-full max-w-md rounded-sm bg-ml-border/50" />
        </>
      )}

      <div className={`${hideHeader ? "" : "mt-10 "}grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.85fr)] lg:gap-10`}>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex gap-4 border border-ml-border bg-ml-surface-1 p-4"
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-ml-border" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-20 rounded-sm bg-ml-border/70" />
                <div className="h-5 w-2/3 max-w-xs rounded-sm bg-ml-border/80" />
                <div className="h-3 w-full max-w-sm rounded-sm bg-ml-border/50" />
              </div>
            </div>
          ))}
          <div
            className="h-40 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
        </div>
        <div className="space-y-4">
          <div
            className="h-28 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
          <div
            className="h-32 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
        </div>
      </div>
    </div>
  );
}
