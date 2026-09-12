"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
const SLIDE_S = 0.4;

export function SuccessToast({ data, onDismiss }: SuccessToastProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <AnimatePresence>
        {data ? (
          <SuccessToastCard
            key="mission-success-toast"
            data={data}
            onDismiss={onDismiss}
          />
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function SuccessToastCard({
  data,
  onDismiss,
}: {
  data: SuccessToastData;
  onDismiss: () => void;
}) {
  const { messages, t } = useLocale();
  const onDismissRef = useRef(onDismiss);
  const barRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  function dismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismissRef.current();
  }

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    let raf = 0;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / TOAST_DURATION_MS);
      el!.style.transform = `scaleX(${1 - t})`;
      if (t >= 1) {
        dismiss();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    el.style.transformOrigin = "left center";
    el.style.transform = "scaleX(1)";
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute right-4 bottom-4 w-[min(100%-2rem,22rem)] sm:right-6 sm:bottom-6"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: SLIDE_S, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-auto overflow-hidden border border-[color-mix(in_srgb,var(--ml-reward)_40%,var(--ml-border))] bg-ml-surface-1/95 shadow-[0_12px_40px_color-mix(in_srgb,var(--ml-bg-0)_55%,transparent)] backdrop-blur-md"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
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
              onClick={dismiss}
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
                onClick={dismiss}
                className="cursor-pointer px-2 py-2 text-[length:var(--ml-text-sm)] text-ml-text-muted transition hover:text-ml-text"
              >
                {messages.stayOnMission}
              </button>
            </div>
          )}
        </div>

        <div className="h-0.5 w-full bg-ml-bg-0/50" aria-hidden>
          <div
            ref={barRef}
            className="h-full w-full bg-ml-reward"
            style={{ transformOrigin: "left center", transform: "scaleX(1)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
