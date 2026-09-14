"use client";

import type { WorldKingdomSnapshot } from "@/lib/world/resolve-world";
import { WorldKingdomItem } from "@/components/world/WorldKingdomItem";
import { WorldActiveKingdom } from "@/components/world/WorldActiveKingdom";

interface WorldPathProps {
  kingdoms: WorldKingdomSnapshot[];
  isNewLearner: boolean;
}

/**
 * Adaptive path: active kingdom renders as the single expanded panel;
 * completed/locked stay compact. With one kingdom, only the expanded panel shows.
 */
export function WorldPath({ kingdoms, isNewLearner }: WorldPathProps) {
  if (kingdoms.length === 0) return null;

  return (
    <ol className="m-0 list-none p-0">
      {kingdoms.map((item, index) => {
        const isLast = index === kingdoms.length - 1;
        if (item.status === "active" || (item.status === "completed" && kingdoms.length === 1)) {
          const soleKingdom = kingdoms.length === 1;
          return (
            <li key={item.kingdom.id} className="relative flex gap-4">
              {!soleKingdom && (
                <div className="flex w-4 shrink-0 flex-col items-center" aria-hidden>
                  <span className="mt-3 h-3 w-3 shrink-0 rounded-full bg-ml-state-active shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-active)_28%,transparent)]" />
                  {!isLast && (
                    <span className="mt-1 w-px flex-1 bg-[color-mix(in_srgb,var(--ml-border)_85%,transparent)]" />
                  )}
                </div>
              )}
              <div className={`min-w-0 flex-1 ${soleKingdom ? "" : "mb-4"}`}>
                <WorldActiveKingdom
                  active={item}
                  isNewLearner={isNewLearner}
                  dominant={soleKingdom}
                />
              </div>
            </li>
          );
        }

        return (
          <WorldKingdomItem
            key={item.kingdom.id}
            item={item}
            isLast={isLast}
          />
        );
      })}
    </ol>
  );
}
