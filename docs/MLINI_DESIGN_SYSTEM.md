# Mlini — DESIGN_SYSTEM.md
Status: **LOCKED — Gate 1**
Version: 1.0
Scope: application UI under `/app` (soft-auth: anonymous + authenticated). Marketing landing `/` is out of scope until a separate redesign.

## 1. Product identity

Mlini uses an **Editorial Cartographic** visual language: dark, quiet, precise, exploratory, technical without pretending to be a scientific instrument.

Cartography is a **visual metaphor**, not product vocabulary. The interface may use paths, waypoints, contour lines, maps, nodes and subtle drafting motifs, but must never invent fake coordinates, telemetry, system IDs or pseudo-scientific data.

Core qualities:
- calm and focused;
- tactile rather than glossy;
- technical but readable;
- progression-oriented;
- low visual noise;
- no generic “AI futurism”.

## 2. Semantic color system

### Surfaces
- `canvas`: `#0D1117`
- `surface-raised`: `#161B22`
- `surface-inset`: `#090D12`
- `surface-elevated`: `#21262D`
- `border`: `#30363D`

### Content
- `text-primary`: `#E6EDF3`
- `text-secondary`: `#8B949E`

### States
- `active`: `#F59E0B`
- `active-hover`: `#D97706`
- `completed`: `#10B981`
- `conceptual`: `#6366F1`
- `error`: reserved for genuine errors only

Semantic rule:
- amber = current / action / active progression;
- green = completed / validated / healthy;
- muted gray = unavailable / secondary;
- indigo = conceptual/category use only.

Never use color only decoratively when it could imply a state.

## 3. Typography

Only three families:
- **Plus Jakarta Sans** — page titles, Kingdom titles, major headings.
- **Inter** — body copy, instructions, pedagogical content.
- **JetBrains Mono** — code, real technical values, keyboard shortcuts, compact state labels, IDs that exist in the product.

JetBrains Mono MUST NOT be used to make decorative text look “technical”.

Recommended scale:
- Display: 48/56, 600
- H1: 32/40, 600
- H2: 24/32, 500–600
- H3: 18/26, 500
- Body large: 16/26
- Body: 14/22
- Small: 12/18
- Mono labels: 10–13px

## 4. Shapes, depth and spacing

- Base radius: 4px.
- Large containers may use 8px max.
- Pills only for compact states/tags where shape communicates grouping.
- Avoid rounded SaaS-card aesthetics.
- Depth should come mainly from luminance contrast and 1px borders.
- Shadows are restrained and reserved for active/floating elements.
- Spacing follows an 8px rhythm.
- Desktop canvas margin: ~32px.
- Standard gutter: 24px.

## 5. Navigation

Global authenticated navigation:
- `World`
- `Skill Tree`
- Profile via avatar

No global `Missions` page.

Hierarchy:
`World → Kingdom → Mission`

### Mission focus mode
When a mission is active:
- remove/de-emphasize global World / Skill Tree navigation;
- show clear back navigation to the Kingdom;
- show mission title, current step and progress;
- show `Exit Mission`;
- keep autosave/state information compact.

## 6. Screen responsibilities

### World
Must answer within ~3 seconds:
1. Where am I?
2. What am I learning?
3. What should I do next?
4. What comes after?

Required:
- full Kingdom path;
- current Kingdom dominant;
- current Mission inside the active Kingdom;
- one dominant `Continue Mission` action;
- overall curriculum progress;
- meaningful upcoming skill unlocks;
- next Kingdom preview.

Do not duplicate the same learning summary in several panels.

### Kingdom
Required:
- Kingdom title + learning promise;
- sequential mission path;
- completed/current/locked states;
- current Mission visually dominant;
- one dominant `Continue Mission` action;
- Capstone visible as final objective;
- detailed Capstone requirements collapsed by default.

### Mission
Two primary regions:
- **Learning Pane** — concept, objective, instructions, hints, verification criteria.
- **Workspace** — execution surface.

The Workspace is polymorphic. It may render:
- code editor;
- prompt playground;
- JSON/API inspector;
- automation builder;
- visual workflow;
- generated result;
- validation interface.

The Mission shell must never assume every exercise is Python.

## 7. State grammar

### Completed
- green marker;
- reduced emphasis;
- review remains possible where useful.

### Active
- amber marker/border;
- strongest local contrast;
- exactly one dominant CTA.

### Locked
- low contrast;
- prerequisite visible when useful;
- no fake disabled controls.

### Loading
Skeletons preserve final layout geometry.
No generic large shimmering rectangles detached from final component structure.

## 8. Language rules

Preferred product vocabulary:
- World
- Kingdom
- Mission
- Skill Tree
- Skill
- Step
- Progress
- Completed
- Locked
- Current Mission
- Continue
- Objective
- Capstone
- Workspace

Acceptable flavor vocabulary when immediately understandable:
- pathway
- waypoint
- roadmap
- mastery

Forbidden as default UI language:
- telemetry
- GPS/grid coordinates
- chronicle
- expedition log
- atlas ledger
- fabricated version/system identifiers
- pseudo-scientific labels with no functional meaning

Rule: **visual identity may be stylized; learning language must remain literal.**

## 9. Visual motifs

Allowed:
- thin topographic contours;
- subtle grid/drafting lines;
- path connectors;
- node markers;
- restrained ambient glows;
- compact technical diagrams tied to real lesson content.

Not allowed:
- neon cyberpunk;
- holograms;
- generic AI brain imagery;
- excessive glassmorphism;
- animated decoration with no state meaning;
- fake dashboards/telemetry.

## 10. Reference screens

The approved desktop references are:
1. World — vertical curriculum path with active Kingdom expanded.
2. Kingdom — sequential mission waypoints + compact contextual panel.
3. Mission — focused split learning/workspace mode.

These references define hierarchy and composition, not literal lesson content.

## 11. Agent rules

When implementing UI:
1. Do not invent new navigation.
2. Do not invent colors, fonts or radii.
3. Do not invent product terminology.
4. Do not add panels “for completeness”.
5. Do not duplicate information across adjacent components.
6. One screen = one dominant user action.
7. Prefer deletion over decorative complexity.
8. If a requirement conflicts with this file, stop and surface the conflict.
