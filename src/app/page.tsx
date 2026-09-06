import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,color-mix(in_srgb,var(--ml-accent)_7%,transparent),transparent_42%),radial-gradient(ellipse_at_88%_78%,color-mix(in_srgb,var(--ml-reward)_5%,transparent),transparent_40%)]"
      />
      <div aria-hidden className="map-grid pointer-events-none absolute inset-0" />

      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mb-4 ml-section-label">Prototype V0.1 · Vertical slice</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.02] text-ml-text sm:text-6xl md:text-7xl">
          Mlini
        </h1>
        <p className="mt-5 max-w-xl text-[length:var(--ml-text-lg)] leading-[var(--ml-leading-body)] text-ml-text-body sm:text-xl">
          Une école technique de l&apos;IA déguisée en jeu vidéo. Pars de zéro.
          Construis ton premier système.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/royaume">
            <Button variant="primary" size="lg">
              Entrer dans le Royaume
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-12 max-w-md text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-muted">
          Première expédition disponible :{" "}
          <span className="text-ml-text">Construire avec l&apos;IA</span> — Mission 1
          jouable de bout en bout.
        </p>
      </section>
    </div>
  );
}
