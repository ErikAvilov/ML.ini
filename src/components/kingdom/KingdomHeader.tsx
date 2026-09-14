import Link from "next/link";
import type { KingdomDefinition } from "@/lib/types";
import { useLocale } from "@/i18n/locale-context";

interface KingdomHeaderProps {
  kingdom: KingdomDefinition;
  completedCoreCount: number;
  totalCoreCount: number;
}

export function KingdomHeader({
  kingdom,
  completedCoreCount,
  totalCoreCount,
}: KingdomHeaderProps) {
  const { messages, t } = useLocale();

  return (
    <header className="max-w-3xl">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase transition-colors hover:text-ml-text-primary"
      >
        <span aria-hidden>←</span>
        {messages.kingdomBackToWorld}
      </Link>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ml-text-primary sm:text-4xl">
        {kingdom.name}
      </h1>
      {kingdom.subtitle && (
        <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {kingdom.subtitle}
        </p>
      )}
      <p className="mt-3 max-w-2xl text-[length:var(--ml-text-sm)] text-ml-text-body sm:text-[length:var(--ml-text-base)]">
        {kingdom.description}
      </p>
      {totalCoreCount > 0 && (
        <p className="mt-3 font-mono text-[11px] text-ml-text-muted">
          {t(messages.kingdomMissionsProgress, {
            done: completedCoreCount,
            total: totalCoreCount,
          })}
        </p>
      )}
    </header>
  );
}
