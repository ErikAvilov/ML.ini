"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useLocale } from "@/i18n/locale-context";
import { t } from "@/i18n/messages/common";

const AUTH_APP = `/auth?next=${encodeURIComponent("/app")}`;

/**
 * Public marketing landing — expressive Editorial Cartographic.
 * Auth-required: Start learning → `/auth?next=/app`.
 */
export function HomeExperience() {
  const { locale, messages } = useLocale();

  const kingdom = createKingdomConstruireAvecIA(locale);
  const missions = getMissions(locale).filter((m) =>
    kingdom.missionIds.includes(m.id)
  );
  const playable = missions.filter((m) => m.kind !== "intro" && m.playable);
  const bossCount = missions.filter((m) => m.kind === "boss").length;

  /** Implemented Kingdom concepts only (M01–06 themes). */
  const kingdomThemes = [
    messages.homeConceptInstruction,
    messages.homeConceptRules,
    messages.homeConceptStructured,
    messages.homeConceptJson,
    messages.homeConceptLogic,
    messages.homeConceptIntegration,
  ];

  const howSteps = [
    { title: messages.homeHowWorld, body: messages.homeHowWorldBody },
    { title: messages.homeHowKingdom, body: messages.homeHowKingdomBody },
    { title: messages.homeHowMission, body: messages.homeHowMissionBody },
  ];

  const loopSteps = [
    messages.homeLoopLearn,
    messages.homeLoopBuild,
    messages.homeLoopRun,
    messages.homeLoopFeedback,
    messages.homeLoopProgress,
  ];

  const pathLabels = [
    messages.homePathInput,
    messages.homePathAi,
    messages.homePathStructure,
    messages.homePathLogic,
    messages.homePathAction,
  ];

  useEffect(() => {
    document.documentElement.dataset.home = "true";
    return () => {
      delete document.documentElement.dataset.home;
    };
  }, []);

  return (
    <div className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 70% 50% at 50% -10%, color-mix(in srgb, var(--ml-state-active) 12%, transparent), transparent 55%)",
            "radial-gradient(ellipse 40% 35% at 92% 28%, color-mix(in srgb, var(--ml-state-completed) 6%, transparent), transparent 70%)",
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ml-surface-1) 28%, transparent) 42%, transparent 100%)",
          ].join(", "),
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.2]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--ml-border) 55%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ml-border) 55%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 55% at 50% 22%, black 15%, transparent 72%)",
        }}
      />

      {/* Hero */}
      <section className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:px-8 lg:py-20">
        <div className="max-w-[34rem]">
          <h1 className="font-display text-[clamp(2.4rem,5.4vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-ml-text-primary">
            <span className="block">{messages.homeHeadlineLine1}</span>
            <span className="block">{messages.homeHeadlineLine2}</span>
          </h1>
          <p className="mt-5 max-w-lg text-[length:var(--ml-text-lg)] leading-relaxed text-ml-text-muted">
            {messages.homeLead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={AUTH_APP}
              className="inline-flex items-center border border-ml-state-active bg-ml-state-active px-5 py-3 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse transition-colors duration-150 hover:bg-ml-state-active-hover"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeStartLearning}
            </Link>
            <Link
              href={AUTH_APP}
              className="inline-flex items-center border border-ml-border bg-transparent px-5 py-3 text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary transition-colors hover:border-ml-border-strong"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeSignIn}
            </Link>
          </div>
          <p className="mt-3 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.homeCtaReassurance}
          </p>
        </div>

        {/* Path Preview — canvas-integrated, not a dashboard card */}
        <div className="relative ml-home-fade-up min-h-[18rem] pl-2 sm:pl-4">
          <div
            className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 80% at 30% 40%, color-mix(in srgb, var(--ml-surface-1) 55%, transparent), transparent 70%)",
            }}
          />
          <p className="font-mono text-[10px] tracking-[0.14em] text-ml-text-muted uppercase">
            {messages.homePathPreviewLabel}
          </p>
          <ol className="relative mt-8">
            {pathLabels.map((label, i) => {
              const isActive = i === 2;
              const isDone = i < 2;
              return (
                <li key={label} className="flex gap-5">
                  <div className="flex w-4 flex-col items-center">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border ${
                        isDone
                          ? "border-ml-state-completed bg-ml-state-completed"
                          : isActive
                            ? "border-ml-state-active bg-ml-state-active shadow-[0_0_0_4px_color-mix(in_srgb,var(--ml-state-active)_18%,transparent)]"
                            : "border-ml-border bg-transparent"
                      }`}
                    />
                    {i < pathLabels.length - 1 ? (
                      <span
                        className={`my-1 w-px flex-1 min-h-[2rem] ${
                          isDone
                            ? "bg-ml-state-completed/40"
                            : isActive
                              ? "bg-gradient-to-b from-ml-state-active/50 to-ml-border"
                              : "bg-ml-border"
                        }`}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div
                    className={
                      i === pathLabels.length - 1 ? "pb-0" : "pb-6"
                    }
                  >
                    <span
                      className={`font-mono text-[length:var(--ml-text-xs)] tracking-[0.1em] uppercase ${
                        isActive
                          ? "text-ml-state-active"
                          : isDone
                            ? "text-ml-state-completed"
                            : "text-ml-text-muted"
                      }`}
                    >
                      {label}
                    </span>
                    {isActive ? (
                      <p className="mt-1.5 max-w-[15rem] text-[length:var(--ml-text-xs)] leading-relaxed text-ml-text-muted">
                        {messages.homePathPreviewHint}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className="mx-auto h-px max-w-xs bg-ml-border/70" />

      <div className="mx-auto max-w-6xl space-y-28 px-4 py-24 sm:space-y-32 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        {/* How Mlini works */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ml-text-primary sm:text-3xl">
            {messages.homeHowTitle}
          </h2>
          <p className="mt-3 max-w-xl text-[length:var(--ml-text-base)] text-ml-text-muted">
            {messages.homeHowLead}
          </p>
          <ol className="mt-14">
            {howSteps.map((step, i) => (
              <li key={step.title} className="flex gap-5 sm:gap-8">
                <div className="flex w-4 flex-col items-center">
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full border ${
                      i === 0
                        ? "border-ml-state-active bg-ml-state-active"
                        : i === 1
                          ? "border-ml-state-completed bg-ml-state-completed"
                          : "border-ml-border bg-ml-canvas"
                    }`}
                  />
                  {i < howSteps.length - 1 ? (
                    <span
                      className="my-1 w-px flex-1 min-h-[3.5rem] bg-ml-border"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className={i < howSteps.length - 1 ? "pb-10" : "pb-0"}>
                  <p className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
                    {step.title}
                  </p>
                  <p className="mt-2 max-w-md font-display text-[length:var(--ml-text-lg)] font-semibold text-ml-text-primary sm:text-xl">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Learn by doing */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ml-text-primary sm:text-3xl">
            {messages.homeLoopTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[length:var(--ml-text-base)] leading-relaxed text-ml-text-muted">
            {messages.homeLoopLeadFull}
          </p>
          <ol className="mt-12 flex flex-col gap-0 sm:flex-row sm:flex-wrap sm:items-center">
            {loopSteps.map((label, i) => (
              <li key={label} className="flex items-center">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full border ${
                      i === 0
                        ? "border-ml-state-active bg-ml-state-active"
                        : i < 3
                          ? "border-ml-state-completed/70 bg-ml-state-completed/70"
                          : "border-ml-border bg-transparent"
                    }`}
                  />
                  <span className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.1em] text-ml-text-primary uppercase">
                    {label}
                  </span>
                </div>
                {i < loopSteps.length - 1 ? (
                  <span
                    className="mx-3 hidden h-px w-8 bg-ml-border sm:mx-4 sm:inline-block sm:w-10"
                    aria-hidden
                  />
                ) : null}
                {i < loopSteps.length - 1 ? (
                  <span
                    className="mx-3 my-3 block h-6 w-px bg-ml-border sm:hidden"
                    aria-hidden
                  />
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-xl text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
            {messages.homeLoopSupportDetail}
          </p>
        </section>

        {/* Building with AI — curriculum preview */}
        <section>
          <p className="font-mono text-[10px] tracking-[0.14em] text-ml-text-muted uppercase">
            {messages.homeKingdomLabel}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-ml-text-primary sm:text-3xl">
            {kingdom.name}
          </h2>
          <p className="mt-3 max-w-2xl text-[length:var(--ml-text-base)] leading-relaxed text-ml-text-muted">
            {messages.homeKingdomSectionLead}
          </p>
          <p className="mt-4 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {t(messages.homeKingdomStats, {
              missions: playable.length || missions.length,
              bosses: bossCount,
            })}
          </p>

          <ol className="mt-12">
            {kingdomThemes.map((label, i) => (
              <li key={label} className="flex gap-5">
                <div className="flex w-4 flex-col items-center">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full border ${
                      i === 0
                        ? "border-ml-state-active bg-ml-state-active"
                        : i < 3
                          ? "border-ml-state-completed/60 bg-ml-state-completed/60"
                          : "border-ml-border bg-transparent"
                    }`}
                  />
                  {i < kingdomThemes.length - 1 ? (
                    <span
                      className={`my-1 w-px flex-1 min-h-[1.75rem] ${
                        i < 2
                          ? "bg-ml-state-completed/35"
                          : "bg-ml-border"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p
                  className={`text-[length:var(--ml-text-sm)] ${
                    i === 0
                      ? "font-medium text-ml-text-primary"
                      : "text-ml-text-muted"
                  } ${i < kingdomThemes.length - 1 ? "pb-5" : ""}`}
                >
                  {label}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Final CTA */}
        <section className="relative py-6 text-center sm:py-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 opacity-60"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(ellipse 55% 90% at 50% 50%, color-mix(in srgb, var(--ml-state-active) 12%, transparent), transparent 70%)",
            }}
          />
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.6rem)] font-semibold tracking-tight text-ml-text-primary">
            {messages.homeFinalTitle}
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={AUTH_APP}
              className="inline-flex items-center border border-ml-state-active bg-ml-state-active px-6 py-3.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse transition-colors hover:bg-ml-state-active-hover"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeStartLearning}
            </Link>
            <Link
              href={AUTH_APP}
              className="inline-flex items-center border border-ml-border px-5 py-3 text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary transition-colors hover:border-ml-border-strong"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeSignIn}
            </Link>
          </div>
          <p className="mt-4 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {messages.homeFinalReassurance}
          </p>
        </section>
      </div>
    </div>
  );
}
