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
  return (
    <div
      className={`flex w-full max-w-xl items-center justify-center ${compact ? "gap-0.5 px-1" : "gap-1 px-2"}`}
      role="img"
      aria-label={`${missions.length} missions`}
    >
      {missions.map((mission, index) => {
        const status = getStatus(mission.id, mission.order);
        const isBoss = mission.kind === "boss";
        const filled = status === "completed" || status === "available";

        return (
          <div key={mission.id} className="flex min-w-0 flex-1 items-center">
            {index > 0 && (
              <span
                className={`h-px min-w-[4px] flex-1 ${
                  filled || getStatus(missions[index - 1].id, missions[index - 1].order) === "completed"
                    ? "bg-[color-mix(in_srgb,var(--ml-accent)_40%,transparent)]"
                    : "bg-[color-mix(in_srgb,var(--ml-secondary)_28%,transparent)]"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`shrink-0 ${
                isBoss
                  ? `h-2.5 w-2.5 rotate-45 border ${
                      filled
                        ? "border-ml-reward bg-[color-mix(in_srgb,var(--ml-reward)_35%,transparent)]"
                        : "border-[color-mix(in_srgb,var(--ml-reward)_40%,transparent)] bg-transparent"
                    }`
                  : `h-2 w-2 rounded-full ${
                      status === "completed"
                        ? "bg-ml-accent"
                        : status === "available"
                          ? "bg-[color-mix(in_srgb,var(--ml-accent)_55%,transparent)] ring-1 ring-ml-accent/40"
                          : "bg-[color-mix(in_srgb,var(--ml-secondary)_35%,transparent)]"
                    }`
              }`}
              title={mission.shortTitle || mission.title}
            />
          </div>
        );
      })}
    </div>
  );
}
