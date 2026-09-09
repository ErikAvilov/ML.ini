import type { Locale } from "@/i18n/config";

interface ActivityHeatmapProps {
  dates: string[];
  locale: Locale;
  emptyLabel: string;
}

const DAY_MS = 86_400_000;
const WEEKS = 12;

export function ActivityHeatmap({
  dates,
  locale,
  emptyLabel,
}: ActivityHeatmapProps) {
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const weekStart = todayUtc - today.getUTCDay() * DAY_MS;
  const start = weekStart - (WEEKS - 1) * 7 * DAY_MS;
  const activeDates = new Set(dates);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return (
    <div>
      <div
        className="grid w-max grid-flow-col grid-rows-7 gap-1.5"
        aria-label={emptyLabel}
      >
        {Array.from({ length: WEEKS * 7 }, (_, index) => {
          const timestamp = start + index * DAY_MS;
          const date = new Date(timestamp);
          const key = date.toISOString().slice(0, 10);
          const active = activeDates.has(key);
          const future = timestamp > todayUtc;

          return (
            <span
              key={key}
              title={`${formatter.format(date)}${active ? " · 1" : ""}`}
              className={`h-3.5 w-3.5 rounded-[2px] border ${
                future
                  ? "border-transparent bg-transparent"
                  : active
                    ? "border-[var(--ml-border-accent)] bg-ml-accent"
                    : "border-ml-border bg-ml-surface-2"
              }`}
            />
          );
        })}
      </div>
      {dates.length === 0 && (
        <p className="mt-4 text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
