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
    <div className="grid gap-4 rounded-xl border border-line bg-panel/70 p-4 backdrop-blur-md sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <XpBar
        current={ready ? xp.current : 0}
        needed={xp.needed}
        level={ready ? xp.level : 1}
        animateKey={progress.xp}
      />
      <div className="flex items-center gap-2 text-sm text-fog">
        <Sparkles className="h-4 w-4 text-signal" />
        <span className="font-mono text-signal">
          {t(messages.xpShort, { xp: progress.xp })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-fog">
        <Flame className="h-4 w-4 text-amber" />
        <span className="font-mono text-amber">
          {progress.streak} {messages.days}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-mist">
          {messages.streak}
        </span>
      </div>
    </div>
  );
}
