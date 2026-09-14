# Mlini — UX Foundation

**Status:** Gate 0 PASS · Gate 1 APPROVED — ready for implementation planning  
**Purpose:** Define the product navigation, screen hierarchy, interaction model, and non-negotiable UX rules before visual implementation.

---

## 1. Product principle

Mlini is not a dashboard and not a content library.

The core loop is:

**World → Kingdom → Mission → Result → Kingdom**

The interface must always answer three questions in a few seconds:

1. Where am I?
2. What am I learning/building now?
3. What should I do next?

If an element does not help answer one of these questions, it is secondary.

---

## 2. Global information architecture

### Primary destinations

- **World** — application home (`/app`) and global learning progression. Soft-auth: available to anonymous and authenticated users.
- **Skill Tree** — acquired, active, and unlockable skills.

### Contextual destinations

- **Kingdom** — one learning domain and its mission path.
- **Mission** — the active learning/building workspace.
- **Result** — completion feedback and transition to the next step.
- **Profile / Settings** — accessed from the avatar only.

### Explicitly removed

- No global **Missions** navigation item.
- No separate marketing-style home page inside `/app` (landing stays at `/`).
- No permanent dashboard section for generic stats.

Missions belong to Kingdoms. Profile is utility, not primary navigation.

### Soft-auth (authoritative)

Mlini is **soft-auth**. The `/app` experience is not an authentication wall.

- Anonymous users may enter `/app`, view World, access the free Kingdom, play free missions, and keep progression via the existing **local** persistence mechanism.
- Authenticated users use the existing **cloud** progression system.
- Authentication upgrades persistence and account capabilities; it is **not** an entry requirement for the free learning path.
- Do not rewrite progression/auth architecture as part of the UI redesign.

---

## 3. Route model

Target hierarchy (Next.js App Router — the `app` **segment** must exist as `src/app/app/…`; a route group `(app)` alone does **not** create `/app`):

```text
/
  Marketing landing page (unchanged during the /app redesign)

/app
  World (application home — soft-auth)

/app/kingdom/[kingdomId]
  Kingdom view

/app/kingdom/[kingdomId]/mission/[missionId]
  Mission workspace

/app/tree
  Skill Tree

/app/profile
  Profile / account settings
```

**Mission result (V1):** keep the existing **in-mission completion overlay** architecture. Do **not** add a dedicated `/result` route.

**Legacy URLs** — preserve temporarily via Next.js redirects:

- `/royaume` → Kingdom (canonical free Kingdom)
- `/missions/[missionId]` → nested mission under its Kingdom
- `/skills` → `/app/tree`
- `/profil` → `/app/profile`

The hierarchy above is fixed; temporary redirect targets may use the free Kingdom’s real `kingdomId` from repo data.

---

## 4. Persistent navigation

### Desktop header

Left:
- Mlini mark / wordmark

Center:
- **World**
- **Skill Tree**

Right:
- compact global progression indicator
- avatar / account menu

### Rules

- The primary navigation never contains more than **World** and **Skill Tree**.
- The active destination is visually obvious without relying only on color.
- Profile/settings live inside the avatar menu.
- A user must be able to return to World from any non-modal screen in one action.
- The current mission may have a contextual **Continue Mission** action, but it is not a third permanent navigation destination.

---

## 5. World screen

### Purpose

The World is the **application home** at `/app`. It gives a clear global view and gets the user back into learning quickly — whether they are anonymous (local progress) or authenticated (cloud progress).

### It must show

- all Kingdoms or the meaningful portion of the learning path;
- completed, active, and locked states;
- the current Kingdom;
- the active mission;
- global progression;
- what completing the current mission/Kingdom unlocks;
- a clear **Continue Mission** action.

### Preferred structure

Use the **progression/pathway concept as the structural foundation**.

Reason:
- strongest hierarchy;
- active Kingdom and active mission are immediately readable;
- completed and locked content remain visible without competing with the current task;
- it scales better than a pure spatial map.

### Cartographic layer

The World may borrow cartographic language from the spatial map concept:

- fine route lines;
- territory markers;
- restrained map/grid motifs;
- subtle sense of discovery;
- waypoint/node language.

The cartographic layer must never reduce readability.

### Avoid

- giant marketing hero;
- generic analytics dashboard;
- card-grid home screen;
- decorative coordinates with no product meaning;
- excessive map controls;
- information duplicated in three places.

---

## 6. Kingdom screen

### Purpose

A Kingdom is a focused learning territory.

It explains:

- what this Kingdom teaches;
- what the user has completed;
- the current mission;
- what comes next;
- the final project / boss / capstone;
- what skills will be gained.

### Recommended composition

The Kingdom can lean more heavily into the **cartographic / exploration** concept than the World screen.

Use:
- a mission path;
- waypoints/nodes;
- active, completed, locked states;
- an inspector/details panel only when useful.

Do not turn the Kingdom into a free-roaming decorative map. The mission order must remain obvious.

### Primary action

The active mission is always resumable in one click.

---

## 7. Mission screen

### Purpose

The Mission screen is the work surface. It prioritizes learning and execution over atmosphere.

### It must show

- mission objective;
- concise context / scenario;
- current step;
- instructions;
- user workspace or interaction area;
- validation/tests/feedback;
- progress inside the mission;
- exit/back to Kingdom.

### Workshop influence

The system-building / workbench concept may be used here selectively:

- build stages;
- component states;
- test results;
- execution feedback;
- diagrams or system previews.

It must not look like a fake IDE unless the mission genuinely requires an IDE-like environment.

### Rule

**Narrative styling may decorate the task; it may never obscure the task.**

---

## 8. Result screen / completion transition

Mission completion should feel meaningful but remain fast.

Sequence target:

1. validation succeeds;
2. mission state locks as complete;
3. earned skill / progression is revealed;
4. next path/node becomes available;
5. user gets one dominant next action.

Target duration for completion animation: roughly **600–1000 ms**, excluding any user-controlled details panel.

Avoid confetti, slot-machine reward patterns, and repeated celebration noise.

---

## 9. Skill Tree

### Purpose

The Skill Tree answers:

**What can I now do, and what am I working toward?**

It is not a duplicate mission map.

### Skill states

- Locked
- Available / discoverable
- In progress
- Mastered

### Relationships

A mission may unlock one or more skill nodes.
A Kingdom groups learning progression.
The Skill Tree represents capabilities, not content order.

---

## 10. New user vs returning user

### New user

The first session in `/app` (anonymous or authenticated) should:

- briefly establish the World;
- make Kingdom I the obvious starting point;
- explain no more than necessary;
- provide one dominant CTA: **Start Kingdom I** / **Start First Mission**.

Do not force a dashboard tour.

### Returning user

The first priority is continuity.

The World must immediately surface:

- current Kingdom;
- active mission;
- current mission progress if meaningful;
- **Continue Mission**.

Returning users should never have to search for their last task.

---

## 11. Visual direction locked for UX work

Working identity: **Editorial Cartographic**.

Desired feeling:

- exploratory;
- thoughtful;
- technical without being sterile;
- mature;
- quiet rather than flashy;
- tactile but not skeuomorphic.

### Structural visual rules

- dark obsidian/slate surfaces;
- fine borders and separators;
- low-intensity ambient glows;
- restrained amber for active/current;
- emerald for completed/validated;
- muted text for locked/secondary;
- Plus Jakarta Sans for major headings;
- Inter for body copy;
- JetBrains Mono only for metadata, identifiers, technical labels, shortcuts, and real system data.

### Important correction

The visual system may use cartographic terminology, but **product copy must stay understandable**.

Use fiction/lore sparingly.

Good:
- Kingdom II
- Current Mission
- Skill unlocked
- Continue Mission
- 3 of 8 missions complete

Acceptable in secondary flavor text:
- Territory
- Waypoint
- Expedition

Avoid unless technically accurate and pedagogically necessary:
- cognitive primitive
- topological horizon
- tensor territory
- traverse ledger
- synthetic cognition stabilizer
- pseudo-scientific telemetry

Mlini must sound intelligent because it is clear, not because it uses difficult words.

---

## 12. Motion system

Animations must communicate state or spatial movement.

**Exact implementation timings, easing, and interaction sequences** are defined in [`MLINI_INTERACTIONS.md`](MLINI_INTERACTIONS.md). That document wins if numbers differ from the intent bands below.

### Intent bands (summary only)

- Feedback (hover, press, focus, selection): ~100–160 ms
- Interface transitions (panels, drawers, local state): see INTERACTIONS (180–280 ms)
- Navigation / progression moments: see INTERACTIONS (280–450 ms)
- Completion moment: elevated; see INTERACTIONS / celebration rules (do not invent multi-second cutscenes)

### Rules

- no decorative infinite movement except subtle status indicators;
- respect reduced-motion preferences;
- layout must not shift when content loads;
- no animation may delay a primary action.

---

## 13. Loading and skeletons

Skeletons should preserve the final page geometry.

They should communicate structure, not use generic SaaS shimmer blocks.

Examples:
- World skeleton preserves Kingdom path and active-mission region;
- Kingdom skeleton preserves mission nodes/path;
- Mission skeleton preserves instruction pane and workspace.

No meaningful layout shift after loading.

---

## 14. Interaction hierarchy

Every screen should have at most **one dominant primary action**.

Priority order:

1. Continue / Start / Submit
2. Inspect / View details
3. Navigation / secondary actions
4. Metadata controls

If two buttons compete visually for the user's next step, the hierarchy is wrong.

---

## 15. Content language

Default product language should be direct and pedagogical.

A user should not need prior AI knowledge to understand what the interface is asking.

Rules:

- prefer concrete verbs;
- explain technical terms when first introduced;
- do not invent technical terminology for atmosphere;
- narrative copy is optional; learning objectives are not;
- labels must describe real state.

---

## 16. Source concepts — what is retained

### Progression / pathway concept
**Retained as the main structural model.**

Keep:
- vertical/linear progression hierarchy;
- active Kingdom expansion;
- clear active mission card;
- completed / next / locked states;
- imminent skill unlocks;
- roadmap visibility.

### Cartographic map concept
**Retained as identity and Kingdom-level spatial language.**

Keep:
- waypoint grammar;
- territory / map motifs;
- subtle route visualization;
- active node emphasis;
- exploration feeling.

Reject:
- excessive zoom/map controls unless genuinely required;
- decorative bearings/coordinates;
- giant inspector panels that duplicate the active mission.

### Workshop / system concept
**Retained only inside appropriate mission/project experiences.**

Keep:
- stages;
- build/test state;
- system diagrams;
- execution feedback.

Reject globally:
- fake engineering telemetry;
- dashboard density;
- product-wide “machine control room” metaphor.

---

## 17. Non-negotiable product rules

1. World is the application home (`/app`), available under soft-auth (anonymous + authenticated).
2. World and Skill Tree are the only permanent primary navigation destinations.
3. Missions belong to Kingdoms.
4. Profile lives behind the avatar.
5. The active mission is always reachable in one click from World.
6. Every Kingdom has a dedicated view.
7. The current location and next action must be obvious within a few seconds.
8. Visual immersion never outranks readability.
9. Technical copy must be accurate; no pseudo-technical filler.
10. No new visual component is introduced without a reusable product reason.
11. No page is implemented from an AI-generated mockup verbatim.
12. The agent must follow the documented hierarchy rather than inventing navigation.
13. Do not rewrite progression/auth architecture during the UI redesign.

---

## 18. Gate 0 acceptance checklist

Gate 0 is complete when all of the following are accepted:

- [x] Landing (`/`) and application (`/app`) are separate concepts.
- [x] World is the application home (soft-auth: anonymous + authenticated).
- [x] Primary navigation is World + Skill Tree.
- [x] Profile is moved to avatar/account menu.
- [x] Global Missions navigation is removed.
- [x] Hierarchy is World → Kingdom → Mission → Result → Kingdom (Result = overlay in V1).
- [x] Returning-user continuity is a first-class UX rule.
- [x] Progression/pathway is the structural World model.
- [x] Cartography is an identity layer, not the sole navigation model.
- [x] Workshop/system styling is contextual to missions/projects.
- [x] Pseudo-technical jargon is explicitly prohibited.

**Gate 0 status: PASS.**

---

## 19. Gate 1 — Visual System & Reference Screens

Gate 1 required three approved reference screens (World, Kingdom, Mission) sharing one design system before the large UI rewrite.

**Gate 1 status: APPROVED.**

Implementation may proceed under the human decisions recorded with the implementation audit (routing `/app/…`, soft-auth, landing scoped separately, Result overlay V1, canonical Kingdom data only).
