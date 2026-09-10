"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import { LEAD } from "@/data/narrative/canon";
import {
  loadHintRevealCount,
  saveHintRevealCount,
} from "@/lib/persistence/hint-session";
import type { MissionHint } from "@/lib/types";

interface HintPanelProps {
  missionId: string;
  hints: MissionHint[];
  instruction: string;
  objective: string;
  compact?: boolean;
  /** When nested in CollapsibleBlock — skip duplicate title */
  hideHeader?: boolean;
}

export function HintPanel({
  missionId,
  hints,
  instruction,
  objective,
  compact = false,
  hideHeader = false,
}: HintPanelProps) {
  const { locale, messages, t } = useLocale();
  const [revealed, setRevealed] = useState(() =>
    typeof window !== "undefined" ? loadHintRevealCount(missionId) : 0
  );
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveHintRevealCount(missionId, revealed);
  }, [missionId, revealed]);

  const nextHint = hints[revealed];
  const shown = hints.slice(0, revealed);

  async function requestHint() {
    if (!nextHint) return;

    if (nextHint.aiAssisted) {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction, objective, locale }),
        });
        const data = (await res.json()) as { hint?: string };
        setAiHint(data.hint ?? nextHint.body);
      } catch {
        setAiHint(nextHint.body);
      } finally {
        setLoading(false);
        setRevealed((n) => n + 1);
      }
      return;
    }

    setRevealed((n) => n + 1);
  }

  return (
    <div
      className={compact ? "" : "border border-ml-border bg-ml-surface-1/60 p-4"}
      style={compact ? undefined : { borderRadius: "var(--ml-frame-radius)" }}
    >
      {!hideHeader && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ml-reward" />
            <span className="ml-section-label">{messages.hints}</span>
          </div>
          <div className="flex gap-1" aria-label={messages.hints}>
            {hints.map((h) => (
              <span
                key={h.level}
                className={`h-1 w-5 ${
                  revealed >= h.level ? "bg-ml-reward" : "bg-ml-border"
                }`}
                title={
                  h.fromMira
                    ? LEAD.displayName
                    : t(messages.hintLevel, {
                        level: h.level,
                        title: h.title,
                      })
                }
              />
            ))}
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="mb-2 flex gap-1" aria-label={messages.hints}>
          {hints.map((h) => (
            <span
              key={h.level}
              className={`h-1 w-5 ${
                revealed >= h.level ? "bg-ml-reward" : "bg-ml-border"
              }`}
            />
          ))}
        </div>
      )}

      {shown.length > 0 && (
        <ul className="mb-3 space-y-2.5">
          {shown.map((hint, i) => (
            <li
              key={hint.level}
              className="border-l-2 border-ml-reward/40 pl-3 text-[length:var(--ml-text-sm)] text-ml-text"
            >
              <p className="mb-1 text-[length:var(--ml-text-xs)] font-medium text-ml-reward">
                {hint.fromMira ? (
                  <span className="tracking-[0.14em] uppercase">
                    {LEAD.displayName}
                  </span>
                ) : (
                  t(messages.hintLevel, {
                    level: hint.level,
                    title: hint.title,
                  })
                )}
              </p>
              {hint.fromMira && (
                <p className="mb-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {hint.title}
                </p>
              )}
              <p className="leading-[var(--ml-leading-body)] text-ml-text-body">
                {hint.aiAssisted && aiHint && i === shown.length - 1
                  ? aiHint
                  : hint.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {nextHint ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={requestHint}
          disabled={loading}
          className="w-full normal-case tracking-normal"
        >
          {loading ? messages.analyzing : messages.askHint}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <p className="text-center text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.allHintsRevealed}
        </p>
      )}
    </div>
  );
}
