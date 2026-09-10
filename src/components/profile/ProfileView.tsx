"use client";

import { Award, CalendarDays, Map, ShieldCheck } from "lucide-react";
import { AchievementBadge } from "@/components/profile/AchievementBadge";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { Button } from "@/components/ui/Button";
import { MliniEmblem } from "@/components/ui/MliniEmblem";
import { PROFILE_ACHIEVEMENTS } from "@/data/profile/achievements";
import { PROFILE_FRAMES } from "@/data/profile/frames";
import { PROFILE_TITLES } from "@/data/profile/titles";
import { getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useLocale } from "@/i18n/locale-context";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";

const panel =
  "border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_92%,transparent)]";

const frameClasses = {
  basic: "border-ml-border-strong",
  accent: "border-ml-accent",
  reward: "border-ml-reward",
} as const;

export function ProfileView() {
  const { locale, messages, t } = useLocale();
  const { progress, equipTitle, equipFrame, resetProgress } = useProgress();
  const view = progress;
  const missions = getMissions(locale);
  const kingdoms = getKingdoms(locale);
  const xp = xpProgressInLevel(view.xp);
  const equippedTitle = PROFILE_TITLES.find(
    (title) => title.id === view.equippedTitleId
  );
  const equippedFrame =
    PROFILE_FRAMES.find((frame) => frame.id === view.equippedFrameId) ??
    PROFILE_FRAMES[0];
  const completedKingdoms = kingdoms.filter((kingdom) =>
    kingdom.missionIds.every((id) => view.completedMissions.includes(id))
  ).length;
  const defeatedBosses = missions.filter(
    (mission) =>
      mission.kind === "boss" &&
      view.completedMissions.includes(mission.id)
  ).length;
  const stats = [
    [messages.profileStatsMissions, view.completedMissions.length],
    [messages.profileStatsKingdoms, completedKingdoms],
    [messages.profileStatsSkills, view.unlockedSkills.length],
    [messages.profileStatsBosses, defeatedBosses],
    [messages.profileStatsStreak, `${view.streak} ${messages.days}`],
    [messages.profileStatsBestStreak, `${view.bestStreak} ${messages.days}`],
  ];

  return (
    <div className="mx-auto w-full max-w-[86rem] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section
        className={`${panel} relative overflow-hidden p-5 sm:p-7`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="relative pb-3">
              <div
                className={`flex h-28 w-28 items-center justify-center border-2 bg-ml-bg-0 ${frameClasses[equippedFrame.tone]}`}
                style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
              >
                <MliniEmblem size={62} title={messages.profileDefaultName} />
              </div>
              <span className="absolute inset-x-2 bottom-0 border border-ml-border bg-ml-surface-2 px-2 py-0.5 text-center font-mono text-[length:var(--ml-text-xs)] text-ml-reward">
                {t(messages.level, { level: xp.level })}
              </span>
            </div>

            <div>
              <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
                {messages.profileMemberSince}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-ml-text sm:text-4xl">
                {messages.profileDefaultName}
              </h1>
              {equippedTitle && (
                <p className="mt-1 text-ml-reward">
                  {equippedTitle.label[locale]}
                </p>
              )}

              <div className="mt-5 w-full max-w-sm">
                <div className="mb-2 flex justify-between gap-4 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  <span>{t(messages.xpShort, { xp: view.xp })}</span>
                  <span>
                    {t(messages.profileXpToNext, {
                      xp: xp.needed - xp.current,
                      level: xp.level + 1,
                    })}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ml-border">
                  <div
                    className="h-full rounded-full bg-ml-accent"
                    style={{ width: `${Math.round(xp.ratio * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button variant="secondary" disabled>
            {messages.profileShareSoon}
          </Button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-ml-border pt-6 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="border border-ml-border bg-ml-surface-2 p-3.5"
              style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
            >
              <span className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
                {label}
              </span>
              <strong className="mt-1 block font-mono text-2xl text-ml-text">
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section
          className={`${panel} overflow-hidden p-5 lg:col-span-7`}
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays size={20} className="text-ml-accent" aria-hidden />
            <h2 className="font-semibold text-ml-text">
              {messages.profileActivity}
            </h2>
          </div>
          <div className="overflow-x-auto pb-1">
            <ActivityHeatmap
              dates={view.activityDates}
              locale={locale}
              emptyLabel={messages.profileActivityEmpty}
            />
          </div>
        </section>

        <section
          className={`${panel} p-5 lg:col-span-5`}
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <div className="mb-5 flex items-center gap-2">
            <Map size={20} className="text-ml-secondary" aria-hidden />
            <h2 className="font-semibold text-ml-text">
              {messages.profileKingdoms}
            </h2>
          </div>
          <div className="space-y-3">
            {kingdoms.map((kingdom) => {
              const completed = kingdom.missionIds.filter((id) =>
                view.completedMissions.includes(id)
              ).length;
              return (
                <div
                  key={kingdom.id}
                  className="border border-ml-border bg-ml-surface-2 p-4"
                  style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
                >
                  <h3 className="font-display text-lg font-semibold text-ml-text">
                    {kingdom.name}
                  </h3>
                  <p className="mt-2 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                    {completed} / {kingdom.missionIds.length}{" "}
                    {messages.navMissions.toLowerCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section
        className={`${panel} p-5 sm:p-7`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <div className="mb-5 flex items-center gap-2 border-b border-ml-border pb-4">
          <Award size={22} className="text-ml-accent" aria-hidden />
          <h2 className="font-display text-2xl font-semibold text-ml-text">
            {messages.profileAchievements}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              locale={locale}
              unlocked={view.unlockedAchievementIds.includes(
                achievement.id
              )}
              lockedLabel={messages.profileLocked}
            />
          ))}
        </div>
      </section>

      <section
        className={`${panel} p-5 sm:p-7`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <div className="mb-6 flex items-center gap-2 border-b border-ml-border pb-4">
          <ShieldCheck size={22} className="text-ml-reward" aria-hidden />
          <h2 className="font-display text-2xl font-semibold text-ml-text">
            {messages.profileTitles} &amp; {messages.profileFrames}
          </h2>
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-ml-text">
              {messages.profileTitles}
            </h3>
            <div className="space-y-2">
              {PROFILE_TITLES.map((title) => {
                const unlocked = view.unlockedTitleIds.includes(title.id);
                const equipped = view.equippedTitleId === title.id;
                return (
                  <div
                    key={title.id}
                    className="flex items-center justify-between gap-4 border border-ml-border bg-ml-surface-2 p-3"
                    style={{ borderRadius: "var(--ml-frame-radius)" }}
                  >
                    <span className={unlocked ? "text-ml-text" : "text-ml-text-muted"}>
                      {title.label[locale]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!unlocked || equipped}
                      onClick={() => equipTitle(title.id)}
                    >
                      {equipped
                        ? messages.profileEquipped
                        : unlocked
                          ? messages.profileEquip
                          : messages.profileLocked}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-ml-text">
              {messages.profileFrames}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {PROFILE_FRAMES.map((frame) => {
                const unlocked = view.unlockedFrameIds.includes(frame.id);
                const equipped = view.equippedFrameId === frame.id;
                return (
                  <div
                    key={frame.id}
                    className={`flex flex-col items-center border bg-ml-surface-2 p-4 text-center ${
                      equipped ? frameClasses[frame.tone] : "border-ml-border"
                    }`}
                    style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
                  >
                    <div
                      className={`mb-3 flex h-14 w-14 items-center justify-center border-2 bg-ml-bg-0 ${frameClasses[frame.tone]} ${
                        unlocked ? "" : "opacity-40"
                      }`}
                      style={{ borderRadius: "var(--ml-frame-radius)" }}
                    >
                      <MliniEmblem size={30} title="" />
                    </div>
                    <span className="min-h-12 text-[length:var(--ml-text-sm)] font-semibold text-ml-text">
                      {frame.label[locale]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!unlocked || equipped}
                      onClick={() => equipFrame(frame.id)}
                    >
                      {equipped
                        ? messages.profileEquipped
                        : unlocked
                          ? messages.profileEquip
                          : messages.profileLocked}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${panel} p-5 sm:p-6`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <h2 className="font-display text-lg text-ml-text">
          {messages.profileResetTitle}
        </h2>
        <p className="mt-2 max-w-xl text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.profileResetHelp}
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            if (!window.confirm(messages.profileResetConfirm)) return;
            resetProgress();
          }}
        >
          {messages.profileResetAction}
        </Button>
      </section>
    </div>
  );
}
