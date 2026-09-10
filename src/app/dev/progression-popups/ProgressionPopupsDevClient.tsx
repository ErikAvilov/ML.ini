"use client";

import { useMemo, useState } from "react";
import { ProgressionPopup } from "@/components/progression/ProgressionPopup";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import type {
  ProgressionCelebration,
  ProgressionPopupVariant,
} from "@/lib/progression-celebrations";

const VARIANTS: ProgressionPopupVariant[] = [
  "level-up",
  "level-up-reward",
  "milestone",
  "kingdom-complete",
];

function fixtures(
  locale: "fr" | "en"
): Record<ProgressionPopupVariant, ProgressionCelebration> {
  const isFr = locale === "fr";
  return {
    "level-up": {
      id: "preview-level-up",
      variant: "level-up",
      level: 3,
      previousLevel: 2,
      xpGained: 120,
      currentXpInLevel: 140,
      nextLevelXp: 600,
    },
    "level-up-reward": {
      id: "preview-level-reward",
      variant: "level-up-reward",
      level: 4,
      previousLevel: 3,
      xpGained: 140,
      currentXpInLevel: 80,
      nextLevelXp: 800,
      reward: {
        type: "title",
        id: "systems-builder",
        name: isFr ? "Constructeur de systèmes" : "Systems Builder",
        rarity: "rare",
      },
    },
    milestone: {
      id: "preview-milestone",
      variant: "milestone",
      level: 10,
      previousLevel: 9,
      xpGained: 200,
      currentXpInLevel: 40,
      nextLevelXp: 2000,
      reward: {
        type: "profile-frame",
        id: "boss-gold",
        name: isFr ? "Or du Boss" : "Boss Gold",
        rarity: "legendary",
      },
    },
    "kingdom-complete": {
      id: "preview-kingdom",
      variant: "kingdom-complete",
      level: 8,
      previousLevel: 7,
      xpGained: 250,
      currentXpInLevel: 100,
      nextLevelXp: 1600,
      kingdom: {
        id: "construire-avec-ia",
        name: isFr ? "Construire avec l'IA" : "Building with AI",
        completedMissions: 10,
        totalMissions: 10,
      },
      rewards: [
        {
          type: "title",
          id: "kingdom-conqueror",
          name: isFr ? "Conquérant de Royaume" : "Kingdom Conqueror",
          rarity: "legendary",
        },
        {
          type: "achievement",
          id: "BOSS_DEFEATED",
          name: isFr ? "Épreuve finale" : "Final Trial",
          rarity: "legendary",
        },
      ],
    },
  };
}

export function ProgressionPopupsDevClient() {
  const { locale, messages } = useLocale();
  const all = useMemo(() => fixtures(locale), [locale]);
  const [variant, setVariant] = useState<ProgressionPopupVariant>("level-up");
  const [open, setOpen] = useState(true);
  const [equippedId, setEquippedId] = useState<string | null>(null);

  const celebration = all[variant];

  return (
    <main className="min-h-dvh bg-ml-bg-0 px-4 py-8 text-ml-text">
      <div className="mx-auto max-w-lg space-y-4">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-text-muted uppercase">
          Dev · Progression popups
        </p>
        <h1 className="font-display text-2xl">Preview</h1>
        <div className="flex flex-wrap gap-2">
          {VARIANTS.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={variant === v ? "primary" : "secondary"}
              onClick={() => {
                setVariant(v);
                setOpen(true);
                setEquippedId(null);
              }}
            >
              {v}
            </Button>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {messages.progressionContinue}
        </Button>
      </div>

      {open && (
        <ProgressionPopup
          celebration={celebration}
          onContinue={() => setOpen(false)}
          onEquipReward={(reward) => setEquippedId(reward.id)}
          equippedRewardId={equippedId}
        />
      )}
    </main>
  );
}
