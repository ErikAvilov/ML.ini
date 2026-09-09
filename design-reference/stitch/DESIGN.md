---
name: Technical Expedition System
colors:
  surface: '#0f1414'
  surface-dim: '#0f1414'
  surface-bright: '#353a3a'
  surface-container-lowest: '#0a0f0f'
  surface-container-low: '#171c1d'
  surface-container: '#1b2021'
  surface-container-high: '#262b2b'
  surface-container-highest: '#313636'
  on-surface: '#dfe3e3'
  on-surface-variant: '#bcc9ca'
  inverse-surface: '#dfe3e3'
  inverse-on-surface: '#2c3131'
  outline: '#879394'
  outline-variant: '#3d494a'
  surface-tint: '#6bd6e1'
  primary: '#6bd6e1'
  on-primary: '#00363b'
  primary-container: '#269fa9'
  on-primary-container: '#002f33'
  inverse-primary: '#006970'
  secondary: '#a7cdd2'
  on-secondary: '#0d3639'
  secondary-container: '#2a4f53'
  on-secondary-container: '#99bfc3'
  tertiary: '#ffb689'
  on-tertiary: '#512300'
  tertiary-container: '#ce7d46'
  on-tertiary-container: '#471e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#89f3fd'
  primary-fixed-dim: '#6bd6e1'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f55'
  secondary-fixed: '#c2eaee'
  secondary-fixed-dim: '#a7cdd2'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#274c50'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb689'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#733502'
  background: '#0f1414'
  on-background: '#dfe3e3'
  surface-variant: '#313636'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: 0em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: 0em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-metric:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-badge:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  panel-gap: 1rem
  max-content-width: 90rem
---

## Brand & Style

This design system establishes a visual language centered on **Technical Fantasy and Rigorous Exploration**. Built for engineers mastering machine learning and systems architecture, it evokes the solemn wonder of an ancient cartographer’s atlas fused with the uncompromising precision of modern technical instruments. It intentionally rejects the ephemeral cliches of contemporary generative AI interfaces—such as synthetic neon purples, amorphous floating orbs, and hyper-rounded, weightless glass sheets.

Instead, the aesthetic draws upon:
- **Aged Mineral Plaster & Deep Basalt Surfaces:** Grounded, opaque surfaces that provide tangible weight, visual permanence, and comfortable low-strain contrast.
- **Cartographic Precision & Adventure Tooling:** Sharp architectural lines, fine filigree dividers, coordinate markers, and geometric diamond/rhombic nodes that treat learning pathways like charting uncharted archipelagos.
- **Deliberate Tactility:** Crisp bevels, subtle chiseled border accents, mechanical corner notches, and structured panels that feel physically constructed rather than digitally rendered.

The interface cultivates intense focus, discipline, and scholarly prestige, transforming code execution and model training into a momentous expedition across complex cognitive territory.

## Colors

The color system operates on an absolute dark mineral substrate, maintaining strict chromatic restraint to ensure that interactive cues command instant recognition and historical weight.

### Palette Roles & Distribution

- **Base Void (`#737878`):** Deep abyssal slate acting as the canvas backdrop, screen margins, and low-priority gutters.
- **Primary Panel Layer (`#05929c`):** Grounded mineral surface used for primary application panels, navigation docks, and code viewports.
- **Elevated Surface (`#587d81`):** Raised interactive containers, inspection drawers, and module cards.
- **Structural Outlines (`#737878`):** Fine structural linework, panel borders, and coordinate grid lines.
- **Text Ivory (`#EEE8DA`):** Warm parchment-tinted typography providing high-contrast readability without the sterile harshness of pure `#FFFFFF`.
- **Secondary Slate (`#587d81`):** Muted navigational labels, inactive node links, and technical metadata.
- **Primary Teal (`#05929c`):** The engine of active discovery. Signifies executable actions, passing test suites, pipeline throughput, active nodes, and completed milestones.
- **Prestige Accent (`#E48F57`):** Used exclusively for high-tier milestone achievements, final architecture convergence, and boss-level evaluations. Never used for utility buttons or decorative filler.
- **Diagnostic Ochre & Crimson:** Diagnostic states utilize an oxidized clay rust (`#D45D5D`) for pipeline failures and an amber beacon (`#E5A93C`) for latency/memory warnings.

## Typography

The typographical hierarchy balances historical authority with industrial-grade runtime clarity using a strict three-tier classification:

1. **Title & Banner Typography (Playfair Display):** Used for realm headers, module codices, milestone achievements, and major system titles. It lends an authoritative, legendary cadence to the learning narrative without compromising structural alignment.
2. **Operational Text (Plus Jakarta Sans):** Used for architecture descriptions, contextual instructions, conversational guides, and interactive button states. Neutral, warm, and highly legible across dense interfaces.
3. **Machine & Telemetry (JetBrains Mono):** Bound to source code, vector dimensions, loss calculations, latency trackers, and terminal feeds. All uppercase metrics are tracked with widened letter spacing (`0.08em` to `0.12em`) to mirror calibrated telemetry readouts.

## Layout & Spacing

The layout model is governed by an architectural fixed-pane philosophy paired with a structured 12-column grid for scrollable workspaces. Learning screens mimic high-density mission control desks rather than open marketing surfaces.

### Layout Philosophy

- **Stationary Canvas Paneling:** The primary interface uses a non-scrolling viewport composition split into three core functional zones:
  1. *Navigation / Graph Codex (Left Rail or Top Horizon)*
  2. *Interactive Workbench / Code & System Graph (Center Stage)*
  3. *Telemetry / Verification & Execution Logs (Right Rail or Bottom Tray)*
- **Micro-Grid & Dividers:** Whitespace is disciplined and bounded. Elements do not float arbitrarily in negative space; they are compartmentalized within framed mineral panels linked by `1px` structural borders (`#737878`).
- **Responsive Adaptations:**
  - **Desktop (≥ 1280px):** Multi-pane split architecture with expandable drawer systems and synchronized viewports.
  - **Tablet (768px - 1279px):** Collapsible codex drawer with persistent side-by-side workspace and execution console.
  - **Mobile (< 768px):** Strict single-column stack utilizing a segment switcher (Codex | Graph | Terminal) anchored to a persistent bottom telemetry strip.

## Elevation & Depth

This system avoids floating drop-shadows and blurred backdrops in favor of **Tonal Mineral Layering** and **Chiseled Structural Outlines**.

### Stacking Hierarchy

- **Substratum (`#737878`):** Background abyss. Zero elevation.
- **Tier 1 - Ground Panels (`#05929c`):** Primary panel layer bounded by a `1px` continuous border of `#737878`.
- **Tier 2 - Operational Blocks (`#587d81`):** Active card surfaces, selected code containers, and hovering controls. They use a dual-border effect: a `1px` exterior stroke of `#737878` paired with an inset top highlight of `1px solid rgba(238, 232, 218, 0.05)`.
- **Tier 3 - Floating Modals & System Palettes (`#587d81`):** Deep directional grounding using an ambient non-diffuse shadow: `0px 8px 0px 0px rgba(0, 0, 0, 0.45)`, reinforced with a full `#737878` border.

### Decorative Depth Motifs

- **Corner Notch Accents:** Key structural panels feature 45-degree chamfered top-right or dual corners, revealing the deep void layer underneath.
- **Cartographic Registration Crosses:** Fine `5px` crosshairs (`+`) rendered in `#737878` sit at intersecting borders of compound panels.

## Shapes

The shape system is strictly architectural and tactile. Soft pill buttons and expansive bubbly corners are prohibited.

- **Base Radius:** Elements enforce a disciplined `4px` corner radius (`0.25rem`), extending to a maximum of `6px` (`0.375rem`) for massive structural viewports.
- **Geometric Nodes & Gems:** System progress indicators, map nodes, and milestone markers take the form of geometric diamonds (rhombuses rotated 45 degrees) or regular hexagons. Active nodes retain hard angular facets.
- **Notched Mineral Frames:** Primary reward panels and code terminal headers utilize an explicit `6px` diagonal cut-corner (chamfer) styled via clip-paths to reinforce stone masonry and expedition instrument casings.

## Components

### Buttons
- **Primary (Execution & Action):** Solid `#05929c` fill with `#EEE8DA` bold sans-serif text. On hover, shifts to high-luminosity teal. Press state introduces an inset `1px` dark shadow. Border radius is locked to `4px`.
- **Secondary (Exploration & Tools):** Background of `#587d81` with a `1px` border of `#737878` and `#EEE8DA` text. On hover, the border changes and the background brightens.
- **Prestige / Boss Milestone:** Reserved for sovereign challenge submissions. Bordered in `#E48F57` with text in `#E48F57` and a dark tinted background (`rgba(228, 143, 87, 0.08)`). Glows with an ambient `0 0 12px rgba(228, 143, 87, 0.2)` upon readiness.

### Inputs & Code Fields
- **Terminal & Parameter Inputs:** Background `#737878` inset into `#05929c` panels. Border is `1px solid #737878`. Font is `JetBrains Mono` sized at `13px`. Placeholder text rendered in muted `#587d81`. Focus state triggers a crisp `1px solid #05929c` outline without outer glow rings.

### Checkboxes & Binary Selectors
- **Form Controls:** Checkboxes are squared (`3px` radius) or diamond-oriented (`rhombus`) indicators. The unchecked state has a `#737878` surface with a `#737878` border; checked state turns solid `#05929c` with an `#EEE8DA` chiseled check icon.

### Chips & Badges
- **Telemetry Chips:** Rectangular frames with `2px` radiuses. Font is `JetBrains Mono` (`10px` uppercase). Background is `#05929c` bordered with `#737878`. Status indicators display a preceding `4px` solid diamond dot in `#05929c` (active) or `#E48F57` (legendary).

### Cards & System Canvases
- **Architecture Module Card:** Structured box with a `#05929c` body and a top header strip separated by a hairline divider (`#737878`). The header holds the module name in `Playfair Display` alongside a monospace parameter footprint. Hovering yields an instantaneous border illumination.

### Knowledge Graph Nodes (Platform-Specific)
- **Interactive System Graph:** Interconnected nodes use diamond primitives linked by orthogonal `1px` lines. Incomplete paths are dashed `#737878`; active paths burn solid `#05929c`; conquered sovereign nodes gleam in faceted `#E48F57`.