"use client";

import { useState } from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MissionHint } from "@/lib/types";

interface HintPanelProps {
  hints: MissionHint[];
  instruction: string;
  objective: string;
  compact?: boolean;
}

export function HintPanel({
  hints,
  instruction,
  objective,
  compact = false,
}: HintPanelProps) {
  const [revealed, setRevealed] = useState(0);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          body: JSON.stringify({ instruction, objective }),
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-ml-reward" />
          <span className="ml-section-label">Indices</span>
        </div>
        <div className="flex gap-1">
          {hints.map((h) => (
            <span
              key={h.level}
              className={`h-1 w-5 ${
                revealed >= h.level ? "bg-ml-reward" : "bg-ml-border"
              }`}
              title={`Niveau ${h.level}`}
            />
          ))}
        </div>
      </div>

      {shown.length > 0 && (
        <ul className="mb-3 space-y-2.5">
          {shown.map((hint, i) => (
            <li
              key={hint.level}
              className="border-l-2 border-ml-reward/40 pl-3 text-[length:var(--ml-text-sm)] text-ml-text"
            >
              <p className="mb-1 text-[length:var(--ml-text-xs)] font-medium text-ml-reward">
                Indice {hint.level} · {hint.title}
              </p>
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
          {loading ? "Analyse…" : "Demander un indice"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <p className="text-center text-[length:var(--ml-text-sm)] text-ml-text-muted">
          Tous les indices révélés
        </p>
      )}
    </div>
  );
}
