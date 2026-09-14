"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ProgressNode } from "@/components/ui/ProgressNode";
import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { getMissionStatus } from "@/lib/progression";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { useLocale } from "@/i18n/locale-context";
import { useMissionRoutes } from "@/components/mission/MissionRouteProvider";
import type { MissionDefinition, MissionStatus } from "@/lib/types";
import type { AuthIdentity } from "@/lib/auth/types";

interface MissionTopBarProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  identity?: AuthIdentity | null;
}

/**
 * Focus-mode chrome for `/app/kingdom/.../mission/...`.
 * No World / Skill Tree nav — work surface only.
 */
export function MissionTopBar({
  mission,
  missions,
  identity = null,
}: MissionTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const routes = useMissionRoutes();
  const { progress, ready, authStatus, identity: liveIdentity } =
    useEffectiveProgress();
  const { messages, t } = useLocale();
  const sorted = [...missions].sort((a, b) => a.order - b.order);
  const resolvedIdentity =
    authStatus === "authenticated"
      ? liveIdentity ?? identity
      : authStatus === "anonymous"
        ? null
        : identity;

  function statusOf(m: MissionDefinition): MissionStatus {
    if (!ready) return m.order === 0 ? "available" : "locked";
    return getMissionStatus(m.id, progress, m.order);
  }

  const coreMissions = sorted.filter((m) => m.kind !== "intro");
  const coreIndex = coreMissions.findIndex((m) => m.id === mission.id);
  const progressLabel =
    mission.kind === "intro"
      ? messages.introLabel
      : coreIndex >= 0
        ? `${coreIndex + 1}/${coreMissions.length}`
        : null;

  function goToMission(m: MissionDefinition) {
    const st = statusOf(m);
    if (st === "locked") return;
    if (m.id === mission.id) return;
    router.push(routes.missionHref(m.slug));
  }

  return (
    <div className="shrink-0 border-b border-ml-border bg-ml-surface-1">
      <div className="flex h-12 w-full items-center gap-2 px-2 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <BrandLogo href="/app" compact className="!gap-1.5" />
          <Link
            href={routes.kingdomHref}
            className="inline-flex max-w-[9rem] items-center gap-0.5 truncate font-mono text-[11px] tracking-[0.04em] text-ml-text-muted uppercase transition-colors hover:text-ml-text-primary sm:max-w-none"
          >
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{messages.backToKingdom}</span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-4">
          <p
            className="w-full max-w-[14rem] truncate text-center text-[length:var(--ml-text-sm)] text-ml-text-secondary sm:max-w-[16rem] sm:text-left"
            title={mission.title}
          >
            <span className="font-medium text-ml-text-primary">
              {mission.title}
            </span>
          </p>
          {progressLabel && (
            <div className="flex min-w-0 items-center justify-center gap-2">
              <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.06em] text-ml-text-muted uppercase sm:inline">
                {messages.missionKingdomPath}
              </span>
              <span className="hidden shrink-0 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted tabular-nums sm:inline">
                {progressLabel}
              </span>
              <div
                className="hidden items-center gap-1 md:flex"
                role="navigation"
                aria-label={messages.missionKingdomPath}
              >
                {sorted.map((m, i) => {
                  const st = statusOf(m);
                  const isCurrent = m.id === mission.id;
                  const prevM = sorted[i - 1];
                  const prevSt = prevM ? statusOf(prevM) : null;
                  const connClass =
                    prevSt === "completed"
                      ? "ml-connection ml-connection-completed"
                      : st !== "locked" || isCurrent
                        ? "ml-connection ml-connection-available"
                        : "ml-connection";
                  const clickable = st !== "locked";
                  const title = t(messages.missionNavLabel, {
                    order:
                      m.kind === "intro"
                        ? "00"
                        : String(m.order).padStart(2, "0"),
                    title: m.title,
                  });

                  return (
                    <span key={m.id} className="flex items-center gap-1">
                      {i > 0 && <span className={connClass} aria-hidden />}
                      {clickable ? (
                        <button
                          type="button"
                          onClick={() => goToMission(m)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm transition hover:bg-ml-surface-hover focus-visible:outline-none"
                          title={title}
                          aria-label={title}
                          aria-current={isCurrent ? "step" : undefined}
                        >
                          <ProgressNode
                            status={st}
                            current={isCurrent}
                            boss={m.kind === "boss"}
                            intro={m.kind === "intro"}
                            title={title}
                          />
                        </button>
                      ) : (
                        <span
                          className="inline-flex h-7 w-7 cursor-not-allowed items-center justify-center"
                          title={title}
                          aria-label={title}
                        >
                          <ProgressNode
                            status={st}
                            current={isCurrent}
                            boss={m.kind === "boss"}
                            intro={m.kind === "intro"}
                            title={title}
                          />
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Link
            href={routes.kingdomHref}
            className="hidden border border-ml-border px-2.5 py-1.5 font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase transition-colors hover:border-ml-border-strong hover:text-ml-text-primary sm:inline-flex"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {messages.missionExit}
          </Link>
          {authStatus === "loading" ? (
            <div
              className="h-8 w-8 animate-pulse rounded-full border border-ml-border bg-ml-surface-2"
              aria-hidden
            />
          ) : resolvedIdentity ? (
            <AuthUserMenu identity={resolvedIdentity} />
          ) : (
            <Link
              href={`/auth?next=${encodeURIComponent(pathname || "/")}`}
              className="inline-flex cursor-pointer items-center border border-ml-border-strong bg-ml-surface-1 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-ml-text uppercase transition hover:border-ml-accent hover:bg-ml-surface-hover hover:text-ml-accent"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {messages.authSignIn}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
