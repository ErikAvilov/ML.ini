import { Award, LockKeyhole } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { ProfileAchievement } from "@/data/profile/achievements";

const rarityBorder = {
  standard: "border-[var(--ml-border-accent)]",
  rare: "border-ml-border-strong",
  legendary: "border-[var(--ml-frame-boss)]",
} as const;

const rarityIcon = {
  standard: "text-ml-accent",
  rare: "text-ml-text-secondary",
  legendary: "text-ml-reward",
} as const;

export function AchievementBadge({
  achievement,
  locale,
  unlocked,
  lockedLabel,
}: {
  achievement: ProfileAchievement;
  locale: Locale;
  unlocked: boolean;
  lockedLabel: string;
}) {
  const Icon = unlocked ? Award : LockKeyhole;

  return (
    <article
      className={`flex min-h-40 flex-col justify-between border p-4 ${
        unlocked
          ? `${rarityBorder[achievement.rarity]} bg-ml-surface-2`
          : "border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_70%,transparent)] opacity-60"
      }`}
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      <Icon
        size={28}
        className={
          unlocked ? rarityIcon[achievement.rarity] : "text-ml-text-muted"
        }
        aria-hidden
      />
      <div className="mt-5">
        <h3 className="font-semibold text-ml-text">
          {achievement.name[locale]}
        </h3>
        <p className="mt-1 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
          {achievement.description[locale]}
        </p>
        {!unlocked && (
          <span className="mt-2 block font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {lockedLabel}
          </span>
        )}
      </div>
    </article>
  );
}
