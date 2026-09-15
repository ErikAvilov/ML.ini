/** Geometry-preserving skeleton for /app/profile (MLINI_INTERACTIONS). */
export function AppProfileSkeleton({
  hideHeader = false,
}: {
  hideHeader?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${hideHeader ? "pb-8 pt-8" : "py-8"}`}
      aria-busy="true"
      aria-live="polite"
    >
      {!hideHeader && (
        <>
          <div className="h-8 w-40 max-w-full rounded-sm bg-ml-border/80" />
          <div className="mt-3 h-4 w-full max-w-md rounded-sm bg-ml-border/50" />
        </>
      )}

      <div
        className={`${hideHeader ? "" : "mt-8 "}grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.9fr)] lg:gap-8`}
      >
        <div className="space-y-6">
          <div
            className="flex gap-5 border border-ml-border bg-ml-surface-1 p-5 sm:p-6"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          >
            <div className="h-24 w-24 shrink-0 rounded-sm bg-ml-border/70" />
            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <div className="h-3 w-28 rounded-sm bg-ml-border/50" />
              <div className="h-6 w-44 max-w-full rounded-sm bg-ml-border/80" />
              <div className="h-2 w-full max-w-xs rounded-full bg-ml-border/60" />
            </div>
          </div>
          <div
            className="h-44 border border-ml-border bg-ml-surface-1 p-5"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          >
            <div className="h-4 w-32 rounded-sm bg-ml-border/70" />
            <div className="mt-4 space-y-3">
              <div className="h-12 rounded-sm bg-ml-border/40" />
              <div className="h-12 rounded-sm bg-ml-border/40" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="h-52 border border-ml-border bg-ml-surface-1 p-5"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          >
            <div className="h-4 w-40 rounded-sm bg-ml-border/70" />
            <div className="mt-4 space-y-2">
              <div className="h-8 rounded-sm bg-ml-border/40" />
              <div className="h-8 rounded-sm bg-ml-border/40" />
              <div className="h-8 rounded-sm bg-ml-border/40" />
            </div>
          </div>
          <div
            className="h-40 border border-ml-border bg-ml-surface-1 p-5"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          >
            <div className="h-4 w-24 rounded-sm bg-ml-border/70" />
            <div className="mt-4 h-10 w-36 rounded-sm bg-ml-border/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
