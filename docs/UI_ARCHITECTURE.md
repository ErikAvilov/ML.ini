# UI Architecture — MLINI

## Sources de vérité

| Domaine | Source |
|---------|--------|
| Missions, XP, validation, AI, MILDRED, skills unlock | Repo MLINI (`src/data`, `src/lib`, APIs) |
| Layout, typo, nodes, panels, profile presentation | Stitch (`design-reference/stitch/`) + tokens `--ml-*` |

Stitch ne définit **jamais** le curriculum.

## Layouts

| Route | Layout | Notes |
|-------|--------|-------|
| `/` | Scroll marketing centré | Hero → loop → MILDRED → skills → CTA |
| `/royaume` | Map + panneau détail | Sélection de nœud, MILDRED réel |
| `/missions/[id]` | Shell plein viewport | Brief ~45% / playground ~55% ; pas de SiteHeader |
| `/skills` | Canvas pan/zoom + détail | Skills réels uniquement |
| `/profil` | Fiche scrollable | Stats dérivées de `PlayerProgress` |

## Composants réutilisables

- **Brand** : `MliniEmblem`, `BrandLogo`
- **Shell** : `SiteHeader`, `SiteAtmosphere`
- **Kingdom** : `KingdomHub`, `MissionPath`, `MissionNode`
- **Mission** : `MissionWorkspace`, `MissionBriefing`, `MissionPlayground`, …
- **Skills** : `SkillTreeView`
- **Profile** : `ProfileView`, `ActivityHeatmap`, `AchievementBadge`
- **Data profile** : `src/data/profile/{titles,frames,achievements}.ts`

## Cosmétiques V1

Titres / cadres / achievements : fondations + résolution depuis la progression réelle.  
Pas d’économie, pas de points à dépenser, pas de leaderboard.

Heatmap : `activityDates` (YYYY-MM-DD) — vide OK pour un nouveau compte.

## Intensité RPG

Voir `docs/DESIGN_SYSTEM.md` §1.
