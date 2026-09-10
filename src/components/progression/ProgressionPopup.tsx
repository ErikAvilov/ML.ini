"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { MliniEmblem } from "@/components/ui/MliniEmblem";
import { useLocale } from "@/i18n/locale-context";
import type {
  ProgressionCelebration,
  ProgressionReward,
} from "@/lib/progression-celebrations";

interface ProgressionPopupProps {
  celebration: ProgressionCelebration;
  onContinue: () => void;
  onEquipReward?: (reward: ProgressionReward) => void;
  equippedRewardId?: string | null;
}

function formatXp(n: number, locale: string): string {
  return n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US");
}

function rewardTypeLabel(
  reward: ProgressionReward,
  messages: ReturnType<typeof useLocale>["messages"]
): string {
  if (reward.type === "title") return messages.progressionNewTitle;
  if (reward.type === "profile-frame") return messages.progressionNewFrame;
  return messages.progressionNewAchievement;
}

export function ProgressionPopup({
  celebration,
  onContinue,
  onEquipReward,
  equippedRewardId = null,
}: ProgressionPopupProps) {
  const { locale, messages, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const continueRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [barReady, setBarReady] = useState(false);

  const prestige =
    celebration.variant === "milestone" ||
    celebration.variant === "kingdom-complete";

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setBarReady(true), reduceMotion ? 0 : 80);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") {
          return;
        }
        e.preventDefault();
        onContinue();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onContinue]);

  const xpRatio =
    celebration.nextLevelXp && celebration.nextLevelXp > 0
      ? Math.min(
          1,
          (celebration.currentXpInLevel ?? 0) / celebration.nextLevelXp
        )
      : 0;

  const eventLabel =
    celebration.variant === "milestone"
      ? messages.progressionMilestone
      : celebration.variant === "kingdom-complete"
        ? messages.progressionKingdomComplete
        : messages.progressionLevelUp;

  const primaryReward =
    celebration.reward ?? celebration.rewards?.[0] ?? null;
  const canEquip =
    primaryReward &&
    (primaryReward.type === "title" || primaryReward.type === "profile-frame") &&
    onEquipReward;
  const isEquipped = primaryReward
    ? equippedRewardId === primaryReward.id
    : false;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[color-mix(in_srgb,var(--ml-bg-0)_82%,transparent)] p-3 backdrop-blur-[2px] sm:p-4"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-[460px] max-h-[min(90vh,640px)] overflow-y-auto border bg-ml-surface-1 ${
          prestige
            ? "border-[color-mix(in_srgb,var(--ml-reward)_55%,var(--ml-border))] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.75),0_0_28px_-6px_color-mix(in_srgb,var(--ml-reward)_18%,transparent)]"
            : "border-ml-border shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]"
        }`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Corner ticks */}
        <span
          className={`pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l ${
            prestige ? "border-ml-reward/70" : "border-ml-accent/50"
          }`}
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute top-0 right-0 h-1.5 w-1.5 border-t border-r ${
            prestige ? "border-ml-reward/70" : "border-ml-accent/50"
          }`}
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l ${
            prestige ? "border-ml-reward/70" : "border-ml-accent/50"
          }`}
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b ${
            prestige ? "border-ml-reward/70" : "border-ml-accent/50"
          }`}
          aria-hidden
        />

        <div
          className={`pointer-events-none absolute top-0 left-1/2 h-16 w-44 -translate-x-1/2 blur-2xl ${
            prestige ? "bg-ml-reward/15" : "bg-ml-accent/12"
          }`}
          aria-hidden
        />

        <div className="relative px-6 pt-7 pb-6 text-center sm:px-8">
          <div className="mb-3 flex justify-center">
            <MliniEmblem
              size={36}
              className={prestige ? "[&_path]:stroke-[var(--ml-reward)] [&_circle]:fill-[var(--ml-reward)]" : ""}
              title=""
            />
          </div>

          <p
            id={titleId}
            className={`font-mono text-[11px] tracking-[0.22em] uppercase ${
              prestige ? "text-ml-reward" : "text-ml-accent"
            }`}
          >
            {eventLabel}
          </p>

          {celebration.variant === "kingdom-complete" && celebration.kingdom ? (
            <>
              <h2 className="mt-2 font-display text-2xl text-ml-text sm:text-[1.75rem]">
                {celebration.kingdom.name}
              </h2>
              <p className="mt-2 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                {t(messages.progressionMissionsCount, {
                  done: celebration.kingdom.completedMissions,
                  total: celebration.kingdom.totalMissions,
                })}
              </p>
            </>
          ) : celebration.variant === "milestone" && celebration.level != null ? (
            <p className="mt-2 font-display text-lg text-ml-text">
              {t(messages.progressionLevelReached, { level: celebration.level })}
            </p>
          ) : null}

          {celebration.level != null &&
            celebration.variant !== "kingdom-complete" && (
              <div className="relative mx-auto my-5 h-28 w-28">
                <span
                  className={`pointer-events-none absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-ml-surface-2/60 ${
                    prestige ? "border-ml-reward/35" : "border-ml-border"
                  }`}
                  aria-hidden
                />
                <span
                  className={`pointer-events-none absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-45 border ${
                    prestige
                      ? "border-ml-reward/40 bg-ml-reward-soft"
                      : "border-ml-accent/30 bg-ml-accent-soft"
                  }`}
                  aria-hidden
                />
                {/* Playfair sits optically low — nudge up so the digit centers in the gem */}
                <span className="absolute inset-0 z-[1] flex items-center justify-center font-display text-6xl leading-none tracking-tight text-ml-text sm:text-7xl translate-y-[-0.06em]">
                  {celebration.level}
                </span>
              </div>
            )}

          {celebration.xpGained != null && celebration.xpGained > 0 && (
            <p
              className={`font-mono text-xl ${
                prestige ? "text-ml-reward" : "text-ml-accent"
              }`}
            >
              {t(messages.progressionXpGained, {
                xp: formatXp(celebration.xpGained, locale),
              })}
            </p>
          )}

          {celebration.variant !== "kingdom-complete" &&
            celebration.nextLevelXp != null && (
              <div className="mt-4 border border-ml-border bg-ml-bg-1/70 px-3.5 py-3 text-left"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className={prestige ? "text-ml-reward" : "text-ml-accent"}>
                    {celebration.xpGained != null
                      ? t(messages.progressionXpGained, {
                          xp: formatXp(celebration.xpGained, locale),
                        })
                      : ""}
                  </span>
                  <span className="text-ml-text-muted">
                    {t(messages.progressionXpProgress, {
                      current: formatXp(celebration.currentXpInLevel ?? 0, locale),
                      needed: formatXp(celebration.nextLevelXp, locale),
                    })}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden border border-ml-border/60 bg-ml-bg-0">
                  <div
                    className={`h-full origin-left ${
                      prestige ? "bg-ml-reward" : "bg-ml-accent"
                    }`}
                    style={{
                      width: `${(barReady ? xpRatio : 0) * 100}%`,
                      transition: reduceMotion
                        ? undefined
                        : "width 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
              </div>
            )}

          {/* Rewards */}
          {(primaryReward || (celebration.rewards && celebration.rewards.length > 0)) && (
            <div className="mt-5 space-y-2">
              {(celebration.rewards ?? (primaryReward ? [primaryReward] : [])).map(
                (reward) => (
                  <div
                    key={`${reward.type}-${reward.id}`}
                    className={`border px-3.5 py-3 text-left ${
                      reward.rarity === "legendary" || prestige
                        ? "border-[color-mix(in_srgb,var(--ml-reward)_40%,var(--ml-border))] bg-ml-reward-soft"
                        : "border-ml-border bg-ml-surface-2/80"
                    }`}
                    style={{ borderRadius: "var(--ml-frame-radius)" }}
                  >
                    <p className="font-mono text-[10px] tracking-[0.16em] text-ml-text-muted uppercase">
                      {rewardTypeLabel(reward, messages)}
                    </p>
                    <p className="mt-1 font-display text-lg text-ml-text">
                      {reward.name}
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {canEquip && primaryReward && (
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => onEquipReward?.(primaryReward)}
                disabled={isEquipped}
              >
                {isEquipped
                  ? messages.progressionEquipped
                  : messages.progressionEquip}
              </Button>
            )}
            <Button
              ref={continueRef}
              variant="primary"
              size="lg"
              className={`flex-1 ${
                prestige
                  ? "bg-ml-reward text-[var(--ml-text-inverse)] hover:bg-[color-mix(in_srgb,var(--ml-reward)_88%,white)]"
                  : ""
              }`}
              onClick={onContinue}
            >
              {messages.progressionContinue}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
