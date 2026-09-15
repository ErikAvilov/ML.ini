# UI Architecture — MLINI

**Status:** architecture **actuelle** post-unification Editorial Cartographic (Marketing, Utility, Application).

## Documentation authority

1. [`UX_FOUNDATION.md`](UX_FOUNDATION.md)
2. [`MLINI_DESIGN_SYSTEM.md`](MLINI_DESIGN_SYSTEM.md) — tokens and contextual variants (§2)
3. [`MLINI_INTERACTIONS.md`](MLINI_INTERACTIONS.md)
4. Specialized docs (MISSION-UX, QOL, SKILL_TREE, NARRATIVE, …)
5. [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — **historical archive only** (Adventure Tech); do not apply

Stitch (`design-reference/stitch/`) = **visual reference only**. Never curriculum, telemetry, or HTML architecture.

Product data (missions, XP, validation, AI, MILDRED, skills) always comes from the repo (`src/data`, `src/lib`, APIs).

---

## Shells

| Shell | Layout role | Variant | Typical routes |
|-------|-------------|---------|----------------|
| **PublicShell** | Marketing, legal | Marketing | `/`, `/legal/*` |
| **UtilityShell** | Auth, onboarding | Utility | `/auth/*`, onboarding flows |
| **AppShell** | Persistent World · Skill Tree nav | Application | `/app`, `/app/tree`, `/app/profile`, `/app/kingdom/[kingdomId]` |
| **Mission focus** | De-emphasized global nav; Learning Pane + Workspace | Application | `/app/kingdom/[kingdomId]/mission/[missionId]` |

Route groups `(public)`, `(utility)`, and segment `app/` organize layouts under `src/app/`. A route group alone does **not** create `/app` — the `app` segment must exist as `src/app/app/…`.

---

## Canonical routes

| URL | Screen |
|-----|--------|
| `/` | Public marketing (anonymous). Authenticated → `/app` |
| `/auth/*` | Sign-in, sign-up (utility) |
| `/app` | **World** — application home (authenticated only) |
| `/app/kingdom/[kingdomId]` | Kingdom |
| `/app/kingdom/[kingdomId]/mission/[missionId]` | Mission workspace (focus shell) |
| `/app/tree` | Skill Tree |
| `/app/profile` | Profile / settings (avatar entry) |

**Auth gate:** `/app/**` requires authentication (proxy + layout). Primary CTA **Start learning** → `/auth?next=/app`. Authenticated `/` redirects to `/app`. Anonymous progression is not a product path.

**Result (V1):** in-mission completion **overlay** — no dedicated `/result` route.

**Primary nav (AppShell):** **World** · **Skill Tree** only. Profile via avatar. Contextual Continue Mission allowed — not a third permanent nav item.

---

## Legacy redirects

Preserve until traffic drops (Next.js redirects; resolve IDs from repo data):

| Legacy | Canonical |
|--------|-----------|
| `/profil` | `/app/profile` |
| `/skills` | `/app/tree` |
| `/royaume` | `/app` |
| `/missions/[missionId]` | `/app/kingdom/[kingdomId]/mission/[missionId]` |

---

## Mission focus shell

When a mission is active:

- de-emphasize / replace global World · Skill Tree nav;
- clear back navigation to the parent Kingdom;
- mission title, step, progress, Exit;
- Learning Pane + polymorphic Workspace (do not hardcode Python-only).

Detail: [`design/MISSION-UX.md`](design/MISSION-UX.md) + `MLINI_DESIGN_SYSTEM` / `MLINI_INTERACTIONS`.

### World

Pathway/progression structure; cartographic identity as layer only. Render **only** Kingdoms present in repo data — no invented locked Kingdoms or Stitch curriculum.

---

## Reusable components

- **Brand** : `MliniEmblem`, `BrandLogo`
- **Shells** : PublicShell, UtilityShell, AppShell (+ mission focus layout)
- **Kingdom** : `KingdomHub`, `MissionPath`, `MissionNode`
- **Mission** : `MissionWorkspace`, `MissionBriefing`, `MissionPlayground`, …
- **Skills** : `SkillTreeView`
- **Profile** : `ProfileView`, `ActivityHeatmap`, `AchievementBadge`
- **Data profile** : `src/data/profile/{titles,frames,achievements}.ts`

---

## Cosmétiques V1

Titres / cadres / achievements : fondations + résolution depuis la progression réelle.  
Pas d’économie, pas de points à dépenser, pas de leaderboard.

Heatmap : `activityDates` (YYYY-MM-DD) — vide OK pour un nouveau compte.

## Identité visuelle

**Site-wide:** Editorial Cartographic — semantic tokens and typography from [`MLINI_DESIGN_SYSTEM.md`](MLINI_DESIGN_SYSTEM.md). Marketing, Utility, and Application variants share the same DNA at different densities.
