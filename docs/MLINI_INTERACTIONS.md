# Mlini — INTERACTIONS.md
Status: **Gate 2 specification**
Version: 1.0

**Authority:** exact motion timings, easing, and interaction sequences in this file win over summary bands in [`UX_FOUNDATION.md`](UX_FOUNDATION.md) §12.

## Goal

Mlini should feel responsive, deliberate and spatial without behaving like a game UI. Motion communicates state, hierarchy and movement through the learning path.

## 1. Motion timing

### Immediate feedback
Use for hover, press, focus and selection:
- 100–160ms

### Interface transitions
Use for panels, drawers, expandable content and local state:
- 180–280ms

### Navigation transitions
Use for World → Kingdom, Kingdom → Mission, Mission completion:
- 280–450ms

No routine interaction should take >500ms.

## 2. Easing

Default:
- ease-out for entrances;
- ease-in for exits;
- standard ease-in-out for size/layout changes.

Avoid spring/bounce by default.
Use physical spring only for a rare deliberate unlock moment.

## 3. World interactions

### Kingdom hover
- slightly raise local luminance;
- reveal/strengthen border;
- no scale larger than ~1.01.

### Enter Kingdom
Sequence:
1. selected Kingdom gains amber emphasis;
2. nearby path content reduces slightly;
3. page transitions to Kingdom view.

Total target: ~350ms.

### Continue Mission
Primary CTA always has immediate pressed feedback.
No confirmation modal.

## 4. Kingdom interactions

### Mission states
Completed:
- stable green marker;
- subtle hover for review.

Active:
- restrained amber pulse only on a small marker, never the entire card;
- no infinite glowing border animation.

Locked:
- no hover implying clickability unless a prerequisite tooltip/detail is available.

### Capstone
Collapsed by default.
Expand/collapse: 180–240ms.
Content height transition must not cause abrupt page jumps.

## 5. Mission focus mode

Entering a Mission should feel like entering a workspace:
- global navigation is replaced by mission context;
- split pane appears without theatrical animation;
- user focus lands on the current task/workspace.

### Workspace actions
`Run`, `Validate`, `Submit`, etc. must expose:
- idle;
- running;
- success;
- failure.

Never simulate success client-side in production.

### Validation success
Sequence:
1. action enters validating state;
2. result appears;
3. current step switches to completed green;
4. next step becomes active amber;
5. CTA updates to next action.

Target after server response: 250–400ms.

### Validation failure
- keep user in place;
- show actionable error near the failing surface;
- never shake the whole screen;
- do not use red for ordinary hints.

## 6. Mission completion

Completion is one of the few elevated moments.

Sequence:
1. final validation succeeds;
2. mission marker resolves from amber → green;
3. path connector to next mission becomes active;
4. XP/progression, if present, updates once;
5. next action becomes `Continue`.

No confetti by default.
No multi-second cutscene.

## 7. Skill unlock

When a mission unlocks a skill:
- small node reveal;
- short glow/fade;
- optional connector draw.

Duration: 350–500ms max.
Do not interrupt the primary flow with a mandatory modal.

## 8. Skeletons and loading

Skeletons MUST mirror real component geometry:
- World: Kingdom path + active Kingdom region + right context column.
- Kingdom: mission list/path + contextual panel.
- Mission: learning pane + workspace frame.

Rules:
- no layout shift when data arrives;
- no full-screen spinner unless the entire route truly cannot render;
- shimmer, if used, is subtle and low contrast;
- keep navigation shell stable.

## 9. Empty and error states

Empty state:
- explain what is missing;
- give one next action.

Route/data error:
- preserve shell/navigation;
- show retry action locally where possible.

Workspace runtime failure:
- preserve user input;
- show diagnostic output;
- never reset the Mission unless explicitly requested.

## 10. Accessibility

- respect `prefers-reduced-motion`;
- all state changes remain understandable without animation;
- focus states are visible;
- keyboard navigation works for primary flows;
- hover-only information must have a focus/tap equivalent.

## Gate 2 acceptance criteria

Gate 2 is complete when:
- motion timings are implemented consistently;
- World → Kingdom → Mission transitions feel coherent;
- active/completed/locked states behave consistently;
- Mission validation has real loading/success/failure states;
- skeletons preserve layout;
- reduced-motion behavior exists;
- no animation is purely decorative noise.
