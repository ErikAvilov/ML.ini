/** Geometry-preserving skeleton for Kingdom (MLINI_INTERACTIONS). */
export function KingdomSkeleton({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${hideHeader ? "pb-8 pt-4" : "py-8"}`}
      aria-busy="true"
      aria-live="polite"
    >
      {!hideHeader && (
        <>
          <div className="h-3 w-28 rounded-sm bg-ml-border/80" />
          <div className="mt-4 h-8 w-64 max-w-full rounded-sm bg-ml-border/80" />
          <div className="mt-3 h-4 w-full max-w-xl rounded-sm bg-ml-border/50" />
          <div className="mt-2 h-3 w-36 rounded-sm bg-ml-border/60" />
        </>
      )}

      <div
        className={`${hideHeader ? "" : "mt-8 "}grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(15rem,0.75fr)] lg:gap-10`}
      >
        <div
          className="ml-kingdom-path-surface space-y-3 border border-ml-border p-4 sm:p-5"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-ml-border" />
              <div
                className={`min-w-0 flex-1 border border-ml-border/80 bg-ml-surface-1 ${i === 1 ? "h-28" : "h-14"}`}
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div
            className="h-28 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
          <div
            className="h-36 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
          <div
            className="h-24 border border-ml-border bg-ml-surface-1"
            style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
          />
        </div>
      </div>
    </div>
  );
}
