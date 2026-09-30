"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useLocale } from "@/i18n/locale-context";
import { t } from "@/i18n/messages/common";

const AUTH_APP = `/auth?next=${encodeURIComponent("/app")}`;

/**
 * Public marketing landing — Stitch / Mlini Studio light editorial.
 * Visual ref: design-reference/stitch (no invented curriculum).
 */
export function HomeExperience() {
  const { locale, messages } = useLocale();

  const kingdom = createKingdomConstruireAvecIA(locale);
  const missions = getMissions(locale).filter((m) =>
    kingdom.missionIds.includes(m.id)
  );
  const playable = missions.filter((m) => m.kind !== "intro" && m.playable);
  const bossCount = missions.filter((m) => m.kind === "boss").length;

  const howSteps = [
    { title: messages.homeHowWorld, body: messages.homeHowWorldBody },
    { title: messages.homeHowKingdom, body: messages.homeHowKingdomBody },
    { title: messages.homeHowMission, body: messages.homeHowMissionBody },
  ];

  const practiceBeats = [
    messages.homeLoopBuild,
    messages.homeLoopRun,
    messages.homeLoopFeedback,
    messages.homeLoopProgress,
  ];

  const kingdomThemes = [
    messages.homeConceptInstruction,
    messages.homeConceptRules,
    messages.homeConceptStructured,
    messages.homeConceptJson,
    messages.homeConceptLogic,
    messages.homeConceptIntegration,
  ];

  useEffect(() => {
    document.documentElement.dataset.home = "true";
    return () => {
      delete document.documentElement.dataset.home;
    };
  }, []);

  return (
    <div className="relative">
      {/* Hero stage — elevated white plate, centered */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
        <div className="ml-home-stage relative w-full max-w-[42rem] overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-14">
          <div
            className="absolute top-0 bottom-0 left-0 w-1.5 bg-ml-state-active"
            aria-hidden
          />
          <p className="font-display text-[clamp(2.5rem,6vw,3.75rem)] font-bold tracking-tight text-ml-text-primary">
            Mlini
          </p>
          <h1 className="mt-5 font-display text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-snug tracking-tight text-ml-text-primary">
            {messages.homeHeadline}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[length:var(--ml-text-lg)] leading-relaxed text-ml-text-body">
            {messages.homeLead}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={AUTH_APP}
              className="ml-btn-primary inline-flex items-center gap-2 px-6 py-3 text-[length:var(--ml-text-sm)] font-medium"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeStartLearning}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={AUTH_APP}
              className="ml-btn-secondary inline-flex items-center px-5 py-3 text-[length:var(--ml-text-sm)] font-medium"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeSignIn}
            </Link>
          </div>
          <p className="mt-5 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.homeCtaReassurance}
          </p>
        </div>
        <div className="ml-home-rule mt-14 w-full max-w-sm" aria-hidden />
      </section>

      {/* Purpose */}
      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-ml-text-primary">
            {messages.homePurposeTitle}
          </h2>
          <p className="mt-5 text-[length:var(--ml-text-lg)] leading-relaxed text-ml-text-body">
            {messages.homePurposeBody}
          </p>
        </div>
      </section>

      {/* How — three distinct cards */}
      <section className="bg-ml-surface-inset/60 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-ml-text-primary">
              {messages.homeHowTitle}
            </h2>
            <p className="mt-3 text-[length:var(--ml-text-base)] text-ml-text-body">
              {messages.homeHowLead}
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {howSteps.map((step, i) => (
              <li key={step.title} className="ml-card relative p-6">
                {i === 0 ? (
                  <div
                    className="absolute top-0 bottom-0 left-0 w-1 bg-ml-state-active"
                    aria-hidden
                  />
                ) : null}
                <p className="font-display text-lg font-semibold text-ml-text-primary">
                  {step.title}
                </p>
                <p className="mt-2 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
                  {step.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practice */}
      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="ml-card mx-auto max-w-2xl p-8 text-center sm:p-10">
          <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-tight text-ml-text-primary">
            {messages.homePracticeTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[length:var(--ml-text-base)] leading-relaxed text-ml-text-body">
            {messages.homePracticeLead}
          </p>
          <p className="mt-8 text-[length:var(--ml-text-sm)] font-medium tracking-wide text-ml-text-primary">
            {practiceBeats.map((beat, i) => (
              <span key={beat}>
                {i > 0 ? (
                  <span className="mx-2 text-ml-state-active" aria-hidden>
                    ·
                  </span>
                ) : null}
                {beat}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Current kingdom — real curriculum only */}
      <section className="bg-ml-surface-inset/60 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="ml-card overflow-hidden p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-ml-surface-inset px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ml-state-active uppercase">
                {messages.homeKingdomLabel}
              </span>
              <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
                {t(messages.homeKingdomStats, {
                  missions: playable.length || missions.length,
                  bosses: bossCount,
                })}
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ml-text-primary sm:text-2xl">
              {kingdom.name}
            </h2>
            <p className="mt-2 max-w-2xl text-[length:var(--ml-text-base)] leading-relaxed text-ml-text-body">
              {messages.homeKingdomSectionLead}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {kingdomThemes.map((label) => (
                <li
                  key={label}
                  className="rounded border border-ml-border bg-ml-surface-inset/80 px-3 py-1.5 text-[length:var(--ml-text-xs)] font-medium text-ml-text-body"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 sm:px-6 sm:py-28">
        <div className="ml-home-stage mx-auto w-full max-w-[36rem] px-6 py-12 text-center sm:px-10 sm:py-14">
          <h2 className="font-display text-[clamp(1.5rem,3.5vw,2rem)] font-semibold tracking-tight text-ml-text-primary">
            {messages.homeFinalTitle}
          </h2>
          <div className="mt-8">
            <Link
              href={AUTH_APP}
              className="ml-btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[length:var(--ml-text-sm)] font-medium"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.homeStartLearning}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {messages.homeFinalReassurance}
          </p>
        </div>
      </section>
    </div>
  );
}
