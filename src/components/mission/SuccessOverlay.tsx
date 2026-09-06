"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import type { DiscoveredConcept } from "@/lib/types";

interface SuccessOverlayProps {
  title: string;
  xp: number;
  concepts: DiscoveredConcept[];
  insight?: string;
  onContinue: () => void;
}

export function SuccessOverlay({
  title,
  xp,
  concepts,
  insight,
  onContinue,
}: SuccessOverlayProps) {
  const reduceMotion = useReducedMotion();

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
          <p className="ml-section-label">Mission terminée</p>
          <h2 className="mt-3 font-display text-3xl text-ml-text">
            {title}
          </h2>

          <motion.p
            className="mt-4 font-mono text-2xl text-ml-reward"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            +{xp} XP
          </motion.p>

          {insight && (
            <motion.div
              className="mt-5 border border-ml-border bg-ml-bg-1 px-3 py-3 text-sm leading-relaxed text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
            >
              <p>Tu n’as pas simplement parlé à une IA.</p>
              <p className="mt-2 font-medium">
                Tu viens de configurer une application pour utiliser
                automatiquement un modèle IA.
              </p>
            </motion.div>
          )}

          <p className="mt-3 text-xs text-ml-text-muted">
            Mission suivante débloquée sur la carte d&apos;expédition.
          </p>

          <div className="mt-7">
            <p className="mb-3 ml-section-label">Concepts découverts</p>
            <ul className="space-y-2.5">
              {concepts.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.08 }}
                  className="border border-ml-border bg-ml-bg-1/80 px-3 py-2.5"
                  style={{ borderRadius: "var(--ml-frame-radius)" }}
                >
                  <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-accent">
                    {c.label}
                  </p>
                  <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-body">
                    {c.explanation}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={onContinue}
            >
              Continuer l&apos;aventure
            </Button>
            <Link href="/royaume" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Voir la carte
              </Button>
            </Link>
          </div>
        </Frame>
      </motion.div>
    </motion.div>
  );
}
