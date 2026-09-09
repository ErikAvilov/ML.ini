"use client";

import { Flame, Sparkles } from "lucide-react";
import { XpBar } from "@/components/ui/XpBar";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";
import { useLocale } from "@/i18n/locale-context";

export function PlayerStatsBar() {
  const { progress, ready } = useProgress();
  const { messages, t } = useLocale();
  const xp = xpProgressInLevel(progress.xp);

  return (
    <div className="grid min-w-0 gap-3 rounded-ml border border-ml-border bg-ml-surface-2 px-3 py-2.5 sm:grid-cols-[minmax(130px,1fr)_auto_auto] sm:items-center">
      <XpBar
        current={ready ? xp.current : 0}
        needed={xp.needed}
        level={ready ? xp.level : 1}
        animateKey={progress.xp}
      />
      <div className="flex items-center gap-1.5 text-sm">
        <Sparkles className="h-4 w-4 text-ml-accent" />
        <span className="font-mono text-ml-accent">
          {t(messages.xpShort, { xp: ready ? progress.xp : 0 })}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        <Flame className="h-4 w-4 text-ml-reward" />
        <span className="font-mono text-ml-reward">
          {ready ? progress.streak : 0} {messages.days}
        </span>
      </div>
    </div>
  );
}
