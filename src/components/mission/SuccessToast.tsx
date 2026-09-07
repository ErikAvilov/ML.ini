"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/i18n/locale-context";

export interface SuccessToastData {
  missionTitle: string;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number | null;
  replay: boolean;
  nextMissionHref: string | null;
  nextMissionTitle: string | null;
}

interface SuccessToastProps {
  data: SuccessToastData | null;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 7000;

export function SuccessToast({ data, onDismiss }: SuccessToastProps) {
  const { messages, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(1);
  const pausedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!data) {
      setProgress(1);
      return;
    }

    setProgress(1);
    pausedRef.current = false;
    let remaining = TOAST_DURATION_MS;
    let last = performance.now();
    let frame = 0;

    function tick(now: number) {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) {
        remaining -= dt;
        setProgress(Math.max(0, remaining / TOAST_DURATION_MS));
        if (remaining <= 0) {
          onDismissRef.current();
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={`${data.missionTitle}-${data.xpGained}-${data.newLevel ?? "x"}`}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 bottom-4 z-50 w-[min(100%-2rem,22rem)] sm:right-6 sm:bottom-6"
          initial={reduceMotion ? false : { opacity: 0, x: "110%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 1,
                  x: "110%",
                  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-auto overflow-hidden border border-[color-mix(in_srgb,var(--ml-reward)_40%,var(--ml-border))] bg-ml-surface-1/95 shadow-[0_12px_40px_color-mix(in_srgb,var(--ml-bg-0)_55%,transparent)] backdrop-blur-md"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            onFocusCapture={() => {
              pausedRef.current = true;
            }}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                pausedRef.current = false;
              }
            }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-reward uppercase">
                    {messages.missionComplete}
                  </p>
                  <p className="mt-1.5 truncate font-display text-[length:var(--ml-text-lg)] text-ml-text">
                    {data.missionTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="shrink-0 cursor-pointer p-1 text-ml-text-muted transition hover:bg-ml-surface-hover hover:text-ml-text"
                  style={{ borderRadius: "var(--ml-frame-radius)" }}
                  aria-label={messages.dismissToast}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!data.replay && data.xpGained > 0 && (
                <p className="mt-3 font-mono text-[length:var(--ml-text-xl)] text-ml-reward">
                  +{data.xpGained} XP
                </p>
              )}

              {data.leveledUp && data.newLevel != null && (
                <p className="mt-2 border-l-2 border-ml-accent pl-3 text-[length:var(--ml-text-sm)] text-ml-accent">
                  {t(messages.levelUpToast, { level: data.newLevel })}
                </p>
              )}

              {data.replay && (
                <p className="mt-3 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
                  {messages.missionReplayCleared}
                </p>
              )}

              {data.nextMissionHref && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={data.nextMissionHref}
                    className="inline-flex cursor-pointer items-center border border-ml-border-strong bg-ml-accent px-3 py-2 text-[length:var(--ml-text-sm)] font-medium text-[var(--ml-text-inverse)] transition hover:bg-ml-accent-bright"
                    style={{ borderRadius: "var(--ml-frame-radius)" }}
                  >
                    {messages.nextMission}
                    {data.nextMissionTitle ? ` · ${data.nextMissionTitle}` : ""}
                  </Link>
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="cursor-pointer px-2 py-2 text-[length:var(--ml-text-sm)] text-ml-text-muted transition hover:text-ml-text"
                  >
                    {messages.stayOnMission}
                  </button>
                </div>
              )}
            </div>

            <div
              className="h-0.5 w-full bg-ml-bg-0/50"
              aria-hidden
            >
              <div
                className="h-full origin-left bg-ml-reward transition-[width] duration-75 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
