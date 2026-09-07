"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { useLocale } from "@/i18n/locale-context";
import { LEAD } from "@/data/narrative/canon";
import type {
  MildredCapabilityUnlock,
  MissionCompletionContent,
} from "@/lib/types";

interface SuccessOverlayProps {
  title: string;
  xp: number;
  completion: MissionCompletionContent;
  /** Previously + newly unlocked MILDRED capabilities */
  onlineCapabilities?: MildredCapabilityUnlock[];
  onContinue: () => void;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function skillLevelLabel(level: number, template: string): string {
  const roman = ROMAN[Math.max(0, level - 1)] ?? String(level);
  return template.replace("{level}", roman);
}

export function SuccessOverlay({
  title,
  xp,
  completion,
  onlineCapabilities,
  onContinue,
}: SuccessOverlayProps) {
  const { messages } = useLocale();
  const reduceMotion = useReducedMotion();
  const [termsOpen, setTermsOpen] = useState(false);

  const {
    miraLines,
    systemBefore,
    systemAfter,
    capabilityUnlocked,
    lessonHeadline,
    lessonBody,
    skillUnlocked,
    technicalTerms,
  } = completion;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--ml-bg-0)_88%,transparent)] p-4 backdrop-blur-md"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto"
      >
        <Frame className="bg-ml-surface-1 p-6 sm:p-8">
          {miraLines && miraLines.length > 0 && (
            <motion.div
              className="mb-6 border-l-2 border-ml-reward/50 pl-3.5"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06 }}
            >
              <p className="mb-2 font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-reward uppercase">
                {LEAD.displayName}
              </p>
              <div className="space-y-1.5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
                {miraLines.map((line, i) => (
                  <p key={`${i}-${line}`}>{line}</p>
                ))}
              </div>
            </motion.div>
          )}

          <p className="ml-section-label">{messages.missionComplete}</p>
          <h2 className="mt-3 font-display text-3xl text-ml-text">{title}</h2>

          <motion.p
            className="mt-4 font-mono text-2xl text-ml-reward"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            +{xp} XP
          </motion.p>

          <p className="mt-2 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.nextMissionUnlocked}
          </p>

          {/* MILDRED upgraded — high visual priority */}
          <motion.section
            className="mt-7 border border-ml-border bg-ml-bg-1/70 px-3.5 py-3.5"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <p className="ml-section-label">{messages.mildredUpgraded}</p>

            {onlineCapabilities && onlineCapabilities.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {onlineCapabilities.map((cap) => {
                  const isNew = cap.id === capabilityUnlocked.id;
                  return (
                    <li
                      key={cap.id}
                      className="flex flex-wrap items-center gap-2 font-mono text-[length:var(--ml-text-xs)]"
                    >
                      <span
                        className={
                          isNew ? "text-ml-text" : "text-ml-text-secondary"
                        }
                      >
                        {cap.label}
                      </span>
                      <span className="text-ml-text-muted">→</span>
                      <span
                        className={
                          isNew ? "text-ml-accent" : "text-ml-text-muted"
                        }
                      >
                        {cap.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                  {capabilityUnlocked.label}
                </span>
                <span className="text-ml-text-muted">→</span>
                <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-accent">
                  {capabilityUnlocked.status}
                </span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-[length:var(--ml-text-sm)] leading-relaxed">
              <div>
                <p className="text-[length:var(--ml-text-xs)] font-medium tracking-[0.06em] text-ml-text-muted uppercase">
                  {messages.systemBefore}
                </p>
                <p className="mt-1 text-ml-text-body italic">
                  “{systemBefore}”
                </p>
              </div>
              <div>
                <p className="text-[length:var(--ml-text-xs)] font-medium tracking-[0.06em] text-ml-accent uppercase">
                  {messages.systemNow}
                </p>
                <pre className="mt-1 font-mono text-[length:var(--ml-text-xs)] leading-relaxed text-ml-text whitespace-pre-wrap">
                  {systemAfter}
                </pre>
              </div>
            </div>
          </motion.section>

          {/* What you just learned — plain language */}
          <motion.section
            className="mt-6"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="ml-section-label">{messages.whatYouLearned}</p>
            <p className="mt-3 font-display text-[length:var(--ml-text-lg)] leading-snug text-ml-text">
              {lessonHeadline}
            </p>
            <div className="mt-3 space-y-2 text-[length:var(--ml-text-sm)] leading-[var(--ml-leading-body)] text-ml-text-body">
              {lessonBody.map((paragraph, i) => (
                <p key={`${i}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>
          </motion.section>

          {/* Skill unlocked — high visual priority */}
          <motion.section
            className="mt-6 border border-[color-mix(in_srgb,var(--ml-reward)_35%,transparent)] bg-[var(--ml-reward-soft)] px-3.5 py-3.5"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-reward uppercase">
              {messages.skillUnlocked}
            </p>
            <p className="mt-2 font-display text-[length:var(--ml-text-xl)] text-ml-text">
              {skillUnlocked.skillName}
            </p>
            <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
              {skillUnlocked.skillCategory}
              {" · "}
              {skillLevelLabel(skillUnlocked.level, messages.skillLevel)}
            </p>
            <p className="mt-2.5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
              {skillUnlocked.description}
            </p>
          </motion.section>

          {/* Optional technical terms — secondary */}
          {technicalTerms && technicalTerms.length > 0 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setTermsOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-[length:var(--ml-text-sm)] text-ml-text-muted transition hover:text-ml-text-secondary"
                aria-expanded={termsOpen}
              >
                <span>{messages.technicalTermsLearned}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    termsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {termsOpen && (
                <ul className="mt-2 space-y-2 border-t border-ml-border pt-3">
                  {technicalTerms.map((term) => (
                    <li key={term.id} className="px-0.5 py-1">
                      <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                        {term.label}
                      </p>
                      <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
                        {term.explanation}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={onContinue}
            >
              {messages.continueAdventure}
            </Button>
            <Link href="/royaume" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                {messages.viewMap}
              </Button>
            </Link>
          </div>
        </Frame>
      </motion.div>
    </motion.div>
  );
}
