import type { MissionStatus } from "@/lib/types";

interface ProgressNodeProps {
  status: MissionStatus;
  current?: boolean;
  boss?: boolean;
  /** Kingdom intro — smaller, gold-tinted start node */
  intro?: boolean;
  title?: string;
}

/**
 * Compact progression node — foundation for the future skill tree.
 */
export function ProgressNode({
  status,
  current = false,
  boss = false,
  intro = false,
  title,
}: ProgressNodeProps) {
  if (boss) {
    const cls = [
      "ml-node ml-node-boss",
      current || status === "available" ? "is-active" : "",
      status === "completed" ? "is-completed" : "",
      status === "locked" && !current ? "opacity-40" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return <span className={cls} title={title} aria-label={title} />;
  }

  if (intro) {
    const resolved = current
      ? "ring-2 ring-[var(--ml-reward-soft)]"
      : status === "completed"
        ? "opacity-80"
        : "";
    return (
      <span
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ml-reward bg-ml-reward-soft ${resolved}`}
        title={title}
        aria-label={title}
      />
    );
  }

  const resolved = current
    ? "ml-node-active"
    : status === "completed"
      ? "ml-node-completed"
      : status === "available"
        ? "ml-node-available"
        : "ml-node-locked";

  return (
    <span
      className={`ml-node ${resolved}`}
      title={title}
      aria-label={title}
    />
  );
}
