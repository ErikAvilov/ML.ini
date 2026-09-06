import type { ReactNode } from "react";

type FrameVariant = "basic" | "boss" | "none";

interface FrameProps {
  children: ReactNode;
  className?: string;
  variant?: FrameVariant;
}

/**
 * Cosmetic frame layer.
 * Default = subtle Arcane Tech corners.
 * Future skins can swap styles via theme tokens / variant.
 */
export function Frame({
  children,
  className = "",
  variant = "basic",
}: FrameProps) {
  if (variant === "none") {
    return <div className={className}>{children}</div>;
  }

  const frameClass =
    variant === "boss" ? "ml-frame ml-frame-boss" : "ml-frame";

  return <div className={`${frameClass} ${className}`}>{children}</div>;
}
