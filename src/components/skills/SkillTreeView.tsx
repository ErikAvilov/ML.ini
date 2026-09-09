"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { resolveSkillTree, type ResolvedSkillNode } from "@/lib/skills";
import { useProgress } from "@/lib/progress-context";
import { useLocale } from "@/i18n/locale-context";
import { getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { getMissionById } from "@/data/missions";
import type { SkillEdge, SkillNodeState } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const NODE_W = 168;
const NODE_H = 56;
const CANVAS_W = 720;
const CANVAS_H = 520;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.6;

function nodeCenter(node: ResolvedSkillNode) {
  const originX = CANVAS_W / 2;
  const originY = 80;
  return {
    x: originX + node.position.x,
    y: originY + node.position.y,
  };
}

function edgeStroke(from: ResolvedSkillNode, to: ResolvedSkillNode): string {
  if (from.state === "unlocked" && to.state === "unlocked") {
    return "var(--ml-connection-completed)";
  }
  if (
    from.state === "unlocked" &&
    (to.state === "available" || to.state === "unlocked")
  ) {
    return "var(--ml-connection-available)";
  }
  return "var(--ml-connection-locked)";
}

function edgeOpacity(from: ResolvedSkillNode, to: ResolvedSkillNode): number {
  if (from.state === "unlocked" && to.state === "unlocked") return 0.95;
  if (from.state === "unlocked") return 0.7;
  return 0.28;
}

function nodeClasses(
  state: SkillNodeState,
  type: ResolvedSkillNode["type"],
  selected: boolean
) {
  const base =
    "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border px-3 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ml-accent)_45%,transparent)]";
  const size =
    type === "major" || type === "keystone"
      ? "min-w-[11.5rem] min-h-[3.6rem]"
      : "min-w-[10rem] min-h-[3.25rem]";
  const selectedRing = selected
    ? "ring-2 ring-[color-mix(in_srgb,var(--ml-accent)_55%,transparent)]"
    : "";

  if (state === "unlocked") {
    const major =
      type === "major" || type === "keystone"
        ? "border-[color-mix(in_srgb,var(--ml-reward)_50%,transparent)] bg-[color-mix(in_srgb,var(--ml-surface-2)_86%,var(--ml-reward-soft))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--ml-reward)_14%,transparent)]"
        : "border-[color-mix(in_srgb,var(--ml-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--ml-surface-2)_88%,var(--ml-accent-soft))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--ml-accent)_18%,transparent)]";
    return `${base} ${size} ${selectedRing} ${major} text-ml-text`;
  }
  if (state === "available") {
    return `${base} ${size} ${selectedRing} border-[color-mix(in_srgb,var(--ml-secondary)_65%,var(--ml-border))] bg-ml-surface-2/90 text-ml-text-secondary`;
  }
  return `${base} ${size} ${selectedRing} border-ml-border bg-ml-surface-1/80 text-ml-text-muted opacity-75`;
}

function stateLabel(
  state: SkillNodeState,
  messages: {
    skillStateLocked: string;
    skillStateAvailable: string;
    skillStateUnlocked: string;
    skillStateMastered: string;
  }
) {
  switch (state) {
    case "unlocked":
      return messages.skillStateUnlocked;
    case "available":
      return messages.skillStateAvailable;
    case "mastered":
      return messages.skillStateMastered;
    default:
      return messages.skillStateLocked;
  }
}

function applyWorldTransform(
  el: HTMLElement | null,
  x: number,
  y: number,
  scale: number
) {
  if (!el) return;
  el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

export function SkillTreeView() {
  const { progress } = useProgress();
  const { locale, messages, t } = useLocale();
  const { nodes, edges } = useMemo(
    () => resolveSkillTree(progress, locale),
    [progress, locale]
  );
  const kingdoms = useMemo(() => getKingdoms(locale), [locale]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const rafRef = useRef(0);
  const pendingOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const preferredId =
    nodes.find((n) => n.state === "unlocked")?.id ??
    nodes.find((n) => n.state === "available")?.id ??
    nodes[0]?.id ??
    null;
  const activeId = selectedId ?? preferredId;
  const selected = nodes.find((n) => n.id === activeId) ?? null;
  const kingdom = selected
    ? kingdoms.find((k) => k.id === selected.kingdomId)
    : null;
  const mission = selected
    ? getMissionById(selected.unlockedByMissionId, locale)
    : null;

  const paintWorld = useCallback(() => {
    const { x, y, scale } = viewRef.current;
    applyWorldTransform(worldRef.current, x, y, scale);
  }, []);

  const setScale = useCallback(
    (next: number | ((prev: number) => number)) => {
      const prev = viewRef.current.scale;
      const value = typeof next === "function" ? next(prev) : next;
      viewRef.current.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
      paintWorld();
    },
    [paintWorld]
  );

  const resetView = useCallback(() => {
    viewRef.current = { x: 0, y: 0, scale: 1 };
    paintWorld();
  }, [paintWorld]);

  useEffect(() => {
    paintWorld();
  }, [paintWorld]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setScale((s) => s + delta);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [setScale]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function flushPan() {
    rafRef.current = 0;
    const pending = pendingOffsetRef.current;
    if (!pending) return;
    pendingOffsetRef.current = null;
    viewRef.current.x = pending.x;
    viewRef.current.y = pending.y;
    paintWorld();
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-skill-node]")) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: viewRef.current.x,
      originY: viewRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    pendingOffsetRef.current = {
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushPan);
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (pendingOffsetRef.current) flushPan();
    dragRef.current = null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="shrink-0 border-b border-ml-border bg-ml-surface-1/60 px-4 py-3 sm:px-6">
        <p className="ml-section-label">{messages.skillsNav}</p>
        <h1 className="mt-1 font-display text-[length:var(--ml-text-2xl)] text-ml-text">
          {messages.skillsTitle}
        </h1>
        <p className="mt-1 max-w-2xl text-[length:var(--ml-text-sm)] text-ml-text-secondary">
          {messages.skillsLead}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="relative min-h-0 min-w-0">
          <div
            ref={viewportRef}
            className="absolute inset-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="application"
            aria-label={messages.skillsCanvasLabel}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--ml-accent) 6%, transparent), transparent 55%), radial-gradient(color-mix(in srgb, var(--ml-secondary) 10%, transparent) 1px, transparent 1px)",
                backgroundSize: "auto, 22px 22px",
              }}
              aria-hidden
            />

            <div
              ref={worldRef}
              className="absolute left-1/2 top-1/2 origin-center will-change-transform"
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                marginLeft: -CANVAS_W / 2,
                marginTop: -CANVAS_H / 2,
                transform: "translate(0px, 0px) scale(1)",
              }}
            >
              <svg
                className="pointer-events-none absolute inset-0"
                width={CANVAS_W}
                height={CANVAS_H}
                aria-hidden
              >
                {edges.map((edge: SkillEdge) => {
                  const from = nodes.find((n) => n.id === edge.from);
                  const to = nodes.find((n) => n.id === edge.to);
                  if (!from || !to) return null;
                  const a = nodeCenter(from);
                  const b = nodeCenter(to);
                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={edgeStroke(from, to)}
                      strokeOpacity={edgeOpacity(from, to)}
                      strokeWidth={from.state === "unlocked" ? 2.25 : 1.5}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {nodes.map((node) => {
                const c = nodeCenter(node);
                const locked = node.state === "locked";
                return (
                  <button
                    key={node.id}
                    type="button"
                    data-skill-node
                    className={nodeClasses(
                      node.state,
                      node.type,
                      activeId === node.id
                    )}
                    style={{
                      left: c.x,
                      top: c.y,
                      borderRadius: "var(--ml-frame-radius)",
                      width: NODE_W,
                      minHeight: NODE_H,
                    }}
                    onClick={() => setSelectedId(node.id)}
                    aria-pressed={activeId === node.id}
                    aria-label={`${node.name}. ${stateLabel(node.state, messages)}`}
                  >
                    <span
                      className={`mb-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${
                        node.state === "unlocked"
                          ? "text-ml-accent"
                          : "text-ml-text-muted"
                      }`}
                    >
                      {node.name}
                    </span>
                    <span
                      className={`text-[length:var(--ml-text-xs)] leading-snug ${
                        locked ? "text-ml-text-muted" : "text-ml-text"
                      }`}
                    >
                      {node.displayName}
                    </span>
                    {node.type === "major" && node.state === "unlocked" && (
                      <span className="mt-1 font-mono text-[9px] tracking-[0.14em] text-ml-reward uppercase">
                        {messages.skillTypeMajor}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute right-3 bottom-3 z-10 flex gap-1.5 sm:right-4 sm:bottom-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => s + 0.12)}
              aria-label={messages.skillsZoomIn}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScale((s) => s - 0.12)}
              aria-label={messages.skillsZoomOut}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              aria-label={messages.skillsResetView}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{messages.skillsResetView}</span>
            </Button>
          </div>
        </div>

        <aside className="min-h-0 overflow-y-auto border-t border-ml-border bg-ml-bg-1/70 p-4 sm:p-5 lg:border-t-0 lg:border-l">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-accent uppercase">
                  {selected.name}
                </p>
                <h2 className="mt-1 font-display text-[length:var(--ml-text-xl)] text-ml-text">
                  {selected.displayName}
                </h2>
                <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-muted">
                  {t(messages.skillLevel, { level: selected.level })} ·{" "}
                  {stateLabel(selected.state, messages)}
                </p>
              </div>

              <p className="text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text-body">
                {selected.description}
              </p>

              <div
                className="border border-ml-border bg-ml-surface-1/50 px-3 py-3"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                <p className="ml-section-label">{messages.skillAcquiredFrom}</p>
                <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text">
                  {kingdom?.name ?? messages.skillUnknownKingdom}
                </p>
                {mission && (
                  <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
                    {t(messages.missionNavLabel, {
                      order: String(mission.order).padStart(2, "0"),
                      title: mission.title,
                    })}
                  </p>
                )}
                {selected.state === "unlocked" && mission && (
                  <Link
                    href={`/missions/${mission.slug}`}
                    className="mt-3 inline-block text-[length:var(--ml-text-sm)] text-ml-accent transition hover:text-ml-accent-bright"
                  >
                    {messages.skillOpenMission}
                  </Link>
                )}
                {selected.state === "locked" && (
                  <p className="mt-3 text-[length:var(--ml-text-sm)] text-ml-text-muted">
                    {messages.skillLockedHint}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
              {messages.skillsSelectHint}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
