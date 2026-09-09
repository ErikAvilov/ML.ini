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
    messages.homeLoopUnderstand,
    messages.homeLoopSucceed,
  ];

  return (
    <section className="ml-home-section mx-auto max-w-3xl px-4 text-center sm:px-6">
      <p className="ml-section-label">{messages.homeLoopTitle}</p>
      <h2 className="mt-3 font-display text-[length:var(--ml-text-2xl)] text-ml-text sm:text-3xl">
        {messages.homeLoopLead}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-body">
        {messages.homeLoopSupport}
      </p>

      <ol className="ml-home-loop mt-10 flex flex-col items-center gap-0 sm:mt-12">
        {steps.map((step, i) => (
          <li key={step} className="flex flex-col items-center">
            <span
              className={`ml-home-fade inline-flex min-w-[9.5rem] items-center justify-center border px-4 py-2.5 font-mono text-[length:var(--ml-text-sm)] tracking-[0.08em] uppercase ${
                i === steps.length - 1
                  ? "border-[color-mix(in_srgb,var(--ml-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--ml-accent)_10%,transparent)] text-ml-accent"
                  : "border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_80%,transparent)] text-ml-text"
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="my-1.5 text-ml-text-muted" aria-hidden>
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
