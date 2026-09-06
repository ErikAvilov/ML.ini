import type { MissionStatus } from "@/lib/types";

interface ProgressNodeProps {
  status: MissionStatus;
  current?: boolean;
  boss?: boolean;
  title?: string;
}

/**
 * Compact progression node — foundation for the future skill tree.
 */
export function ProgressNode({
  status,
  current = false,
  boss = false,
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
