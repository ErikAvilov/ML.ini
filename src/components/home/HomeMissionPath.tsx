import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface HomeMissionPathProps {
  missions: MissionDefinition[];
  getStatus: (missionId: string, order: number) => MissionStatus;
  compact?: boolean;
}

export function HomeMissionPath({
  missions,
  getStatus,
  compact = false,
}: HomeMissionPathProps) {
  const lastCompletedIndex = missions.reduce((acc, mission, index) => {
    return getStatus(mission.id, mission.order) === "completed" ? index : acc;
  }, -1);
  const progressRatio =
    missions.length <= 1
      ? 0
      : Math.max(0, lastCompletedIndex) / (missions.length - 1);

  return (
    <div
      className={`relative flex w-full max-w-xl ${compact ? "h-4 px-1" : "h-5 px-2"}`}
      role="img"
      aria-label={`${missions.length} missions`}
    >
      {/* Continuous rail — geometrically centered */}
      <div
        className="pointer-events-none absolute top-1/2 right-3 left-3 h-px -translate-y-1/2 bg-[color-mix(in_srgb,var(--ml-secondary)_28%,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-3 h-px -translate-y-1/2 bg-[color-mix(in_srgb,var(--ml-accent)_40%,transparent)]"
        style={{
          width:
            lastCompletedIndex < 0
              ? 0
              : `calc((100% - 1.5rem) * ${progressRatio})`,
        }}
        aria-hidden
      />

      {missions.map((mission) => {
        const status = getStatus(mission.id, mission.order);
        const isBoss = mission.kind === "boss";
        const filled = status === "completed" || status === "available";

        return (
          <div
            key={mission.id}
            className="relative z-[1] flex min-w-0 flex-1 items-center justify-center"
          >
            {/* Fixed box so circle / diamond share the same center as the rail */}
            <span
              className="flex h-4 w-4 items-center justify-center"
              title={mission.shortTitle || mission.title}
            >
              <span
                className={
                  isBoss
                    ? `h-2.5 w-2.5 shrink-0 rotate-45 border ${
                        filled
                          ? "border-ml-reward bg-[color-mix(in_srgb,var(--ml-reward)_35%,transparent)]"
                          : "border-[color-mix(in_srgb,var(--ml-reward)_40%,transparent)] bg-transparent"
                      }`
                    : `h-2 w-2 shrink-0 rounded-full ${
                        status === "completed"
                          ? "bg-ml-accent"
                          : status === "available"
                            ? "bg-[color-mix(in_srgb,var(--ml-accent)_55%,transparent)] ring-1 ring-ml-accent/40"
                            : "bg-[color-mix(in_srgb,var(--ml-secondary)_35%,transparent)]"
                      }`
                }
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
