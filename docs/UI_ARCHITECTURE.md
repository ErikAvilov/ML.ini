# UI Architecture — MLINI

**Status:** documents **current** runtime vs **target** `/app` redesign. The target is **not** implemented yet.

## Documentation authority

For `/app` redesign work:

1. [`UX_FOUNDATION.md`](UX_FOUNDATION.md)
2. [`MLINI_DESIGN_SYSTEM.md`](MLINI_DESIGN_SYSTEM.md)
3. [`MLINI_INTERACTIONS.md`](MLINI_INTERACTIONS.md)
4. Specialized docs (MISSION-UX, QOL, SKILL_TREE, NARRATIVE, …)
5. Legacy [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — landing `/` only when still Adventure Tech

Stitch (`design-reference/stitch/`) = **visual reference only**. Never curriculum, telemetry, or HTML architecture.

Product data (missions, XP, validation, AI, MILDRED, skills) always comes from the repo (`src/data`, `src/lib`, APIs).

---

## Current architecture (as shipped today)

| Route | Layout | Notes |
|-------|--------|-------|
| `/` | Scroll marketing | `HomeExperience` — **keep during `/app` redesign** |
| `/royaume` | Map + detail panel | Single Kingdom hub (`KingdomHub`) |
| `/missions/[missionId]` | Full-viewport shell | Brief / playground ; `SiteHeader` hidden |
| `/skills` | Canvas pan/zoom + detail | Real skills only |
| `/profil` | Scrollable profile | Progress-derived stats ; account tools |

**Nav today (`SiteHeader`):** Royaumes · Arbre · Missions · Profil (+ auth chrome).  
**Auth:** soft-auth — pages are reachable anonymously; progression = localStorage (anon) or Neon (authenticated).

### Reusable components (current)

- **Brand** : `MliniEmblem`, `BrandLogo`
- **Shell** : `SiteHeader`, `SiteAtmosphere`
- **Kingdom** : `KingdomHub`, `MissionPath`, `MissionNode`
- **Mission** : `MissionWorkspace`, `MissionBriefing`, `MissionPlayground`, …
- **Skills** : `SkillTreeView`
- **Profile** : `ProfileView`, `ActivityHeatmap`, `AchievementBadge`
- **Data profile** : `src/data/profile/{titles,frames,achievements}.ts`

---

## Target architecture (approved — not yet implemented)

### Route hierarchy

Real App Router segment `src/app/app/…` (a route group `(app)` alone does **not** create `/app`):

| Target URL | Screen |
|------------|--------|
| `/` | Marketing landing (unchanged in this redesign) |
| `/app` | **World** — application home (soft-auth) |
| `/app/kingdom/[kingdomId]` | Kingdom |
| `/app/kingdom/[kingdomId]/mission/[missionId]` | Mission workspace (focus shell) |
| `/app/tree` | Skill Tree |
| `/app/profile` | Profile / settings (avatar entry) |

**Temporary redirects** from `/royaume`, `/missions/[missionId]`, `/skills`, `/profil` until cut-over is complete.

**Result (V1):** in-mission completion **overlay** — no dedicated `/result` route.

### World

New primary surface. Pathway/progression structure; cartographic identity as layer only. Render **only** Kingdoms present in repo data — no invented locked Kingdoms or Stitch curriculum.

### Mission focus shell

When a mission is active:

- de-emphasize / replace global World · Skill Tree nav;
- clear back navigation to the parent Kingdom;
- mission title, step, progress, Exit;
- Learning Pane + polymorphic Workspace (do not hardcode Python-only).

Detail: [`design/MISSION-UX.md`](design/MISSION-UX.md) + `MLINI_DESIGN_SYSTEM` / `MLINI_INTERACTIONS`.

### Primary nav (target)

**World** · **Skill Tree** only. Profile via avatar. Compact progression indicator. Contextual Continue Mission allowed — not a third permanent nav item.

---

## Cosmétiques V1

Titres / cadres / achievements : fondations + résolution depuis la progression réelle.  
Pas d’économie, pas de points à dépenser, pas de leaderboard.

Heatmap : `activityDates` (YYYY-MM-DD) — vide OK pour un nouveau compte.

## Intensité / identité visuelle

- **App `/app`:** Editorial Cartographic — [`MLINI_DESIGN_SYSTEM.md`](MLINI_DESIGN_SYSTEM.md).
- **Landing `/` (until redesigned):** Adventure Tech notes in legacy [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) §1 may still apply; scope tokens so app styles do not break the landing.
