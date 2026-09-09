import Link from "next/link";
import { MliniEmblem } from "@/components/ui/MliniEmblem";

interface BrandLogoProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: BrandLogoProps) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <MliniEmblem size={compact ? 28 : 32} />
      <span className="font-display text-[length:var(--ml-text-lg)] font-semibold tracking-[0.04em] text-ml-text">
        MLINI
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="group outline-none focus-visible:ring-2 focus-visible:ring-ml-accent/40">
      {inner}
    </Link>
  );
}
