import { MliniEmblem } from "@/components/ui/MliniEmblem";

export function HomeWordmark() {
  return (
    <div className="ml-home-wordmark flex flex-col items-center">
      <MliniEmblem size={40} />
      <p className="mt-4 font-display text-[clamp(2.5rem,7vw,3.75rem)] font-semibold leading-none tracking-[0.06em] text-ml-text">
        MLINI
      </p>
      <div
        className="mt-4 h-px w-14 bg-[color-mix(in_srgb,var(--ml-reward)_50%,transparent)]"
        aria-hidden
      />
    </div>
  );
}
