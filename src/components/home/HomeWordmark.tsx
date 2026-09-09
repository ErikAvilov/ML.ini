export function HomeWordmark() {
  return (
    <div className="ml-home-wordmark flex flex-col items-center">
      <div className="mb-4 flex items-center gap-3" aria-hidden>
        <span className="h-px w-8 bg-[color-mix(in_srgb,var(--ml-reward)_45%,transparent)] sm:w-12" />
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="absolute inset-0 rotate-45 border border-[color-mix(in_srgb,var(--ml-reward)_55%,transparent)]" />
          <span className="h-1 w-1 rounded-full bg-ml-accent" />
        </span>
        <span className="h-px w-8 bg-[color-mix(in_srgb,var(--ml-reward)_45%,transparent)] sm:w-12" />
      </div>
      <p className="font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-none tracking-[-0.03em] text-ml-text">
        MLINI
      </p>
      <div className="mt-4 h-px w-16 bg-[color-mix(in_srgb,var(--ml-reward)_50%,transparent)]" aria-hidden />
    </div>
  );
}
