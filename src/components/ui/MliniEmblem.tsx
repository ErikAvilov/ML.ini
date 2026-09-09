/** MLINI diamond emblem — brand primitive for logo, nodes, frames. */
export function MliniEmblem({
  size = 32,
  className = "",
  title = "MLINI",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <path
        d="M20 4 L36 20 L20 36 L4 20 Z"
        stroke="var(--ml-accent)"
        strokeWidth="1.75"
        fill="color-mix(in srgb, var(--ml-accent) 14%, transparent)"
      />
      <path
        d="M20 12 L28 20 L20 28 L12 20 Z"
        stroke="var(--ml-accent)"
        strokeWidth="1.25"
        fill="color-mix(in srgb, var(--ml-accent) 28%, transparent)"
      />
      <circle cx="20" cy="20" r="2" fill="var(--ml-accent)" />
    </svg>
  );
}
