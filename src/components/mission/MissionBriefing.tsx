import type { MissionBriefingContent, MissionHint } from "@/lib/types";
import { HintPanel } from "@/components/mission/HintPanel";

interface MissionBriefingProps {
  briefing: MissionBriefingContent;
  missionTitle: string;
  missionOrder: number;
  alreadyCleared?: boolean;
  hints: MissionHint[];
  instruction: string;
  objective: string;
}

export function MissionBriefing({
  briefing,
  missionTitle,
  missionOrder,
  alreadyCleared,
  hints,
  instruction,
  objective,
}: MissionBriefingProps) {
  return (
    <div className="space-y-7 text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)]">
      <header className="pb-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="ml-section-label">
            Mission {String(missionOrder).padStart(2, "0")}
          </p>
          <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {alreadyCleared ? "Terminée — tu peux rejouer" : "En cours"}
          </p>
        </div>
        <h1 className="mt-3 font-display text-[length:var(--ml-text-2xl)] leading-[1.15] text-ml-text">
          {missionTitle}
        </h1>
        <div className="mt-4 h-px w-14 bg-[color-mix(in_srgb,var(--ml-reward)_55%,transparent)]" />
      </header>

      <section>
        <h2 className="font-display text-[length:var(--ml-text-lg)] text-ml-text">
          {briefing.welcomeTitle}
        </h2>
        <div className="mt-3 space-y-3 text-ml-text-body">
          {briefing.welcomeParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-4 font-medium text-ml-text">{briefing.roleHighlight}</p>
        <ul className="mt-3 space-y-2 text-ml-text-body">
          {briefing.roleDetails.map((detail) => (
            <li key={detail} className="flex gap-2.5">
              <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ml-text-muted" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <hr className="ml-rule" />

      <section>
        <h2 className="ml-section-label">Comment ça marche</h2>
        <p className="mt-3 text-[length:var(--ml-text-md)] text-ml-text">
          {briefing.flowSteps.join(" → ")}
        </p>
        <p className="mt-2.5 text-ml-text-body">{briefing.flowCaption}</p>
      </section>

      <section className="ml-assignment">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--ml-reward)_30%,transparent)]" />
          <h2 className="font-display text-[length:var(--ml-text-xl)] text-ml-text">
            Assignment
          </h2>
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--ml-reward)_30%,transparent)]" />
        </div>

        <p className="text-ml-text-body">{briefing.assignmentIntro}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {briefing.categories.map((category) => (
            <span
              key={category}
              className="border border-ml-border-strong bg-ml-bg-1 px-2.5 py-1 font-mono text-[length:var(--ml-text-xs)] text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {category}
            </span>
          ))}
        </div>
        <p className="mt-3 text-ml-text-body">{briefing.assignmentNote}</p>

        <h3 className="mt-5 text-[length:var(--ml-text-sm)] font-medium text-ml-text">
          Ta tâche
        </h3>
        <ol className="mt-2.5 space-y-2">
          {briefing.taskSteps.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-ml-text-body">
              <span className="font-medium text-ml-text">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-l-2 border-ml-reward/50 pl-3.5 text-ml-text">
          {briefing.taskReminder}
        </p>
      </section>

      <section>
        <HintPanel
          hints={hints}
          instruction={instruction}
          objective={objective}
          compact
        />
      </section>
    </div>
  );
}
