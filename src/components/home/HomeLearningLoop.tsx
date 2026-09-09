import type { CommonMessages } from "@/i18n/messages/common";

interface HomeLearningLoopProps {
  messages: CommonMessages;
}

export function HomeLearningLoop({ messages }: HomeLearningLoopProps) {
  const steps = [
    messages.homeLoopProblem,
    messages.homeLoopTry,
    messages.homeLoopRun,
    messages.homeLoopFail,
    messages.homeLoopSucceed,
  ].filter(Boolean);

  return (
    <section className="ml-home-section mx-auto max-w-4xl px-4 text-center sm:px-6">
      <h2 className="font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
        {messages.homeLoopLead}
      </h2>

      <ol className="mt-10 flex flex-col items-stretch justify-center gap-2 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center justify-center gap-1 sm:gap-1.5">
            <span
              className={`inline-flex min-w-[6.5rem] items-center justify-center border px-3 py-2.5 font-mono text-[length:var(--ml-text-xs)] tracking-[0.1em] uppercase ${
                i === steps.length - 1
                  ? "border-[color-mix(in_srgb,var(--ml-reward)_45%,transparent)] bg-[color-mix(in_srgb,var(--ml-reward)_10%,transparent)] text-ml-reward"
                  : i === steps.length - 2
                    ? "border-[color-mix(in_srgb,var(--ml-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--ml-accent)_10%,transparent)] text-ml-accent"
                    : "border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_80%,transparent)] text-ml-text"
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="hidden text-ml-text-muted sm:inline" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
