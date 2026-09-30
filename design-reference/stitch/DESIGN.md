---
name: Mlini Studio
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301f'
  on-tertiary-container: '#24a375'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a focused, executive-caliber learning environment tailored for technical practitioners, founders, and knowledge professionals. Departing from the saturated blues, dark neon glows, and synthetic AI motifs common in technical tooling, this aesthetic draws inspiration from high-grade publication design, architectural blueprints, and elite operating utilities like Linear and Stripe Docs.

### Visual Character
- **Restrained & Authoritative:** Confidence through rigorous whitespace, crisp 1-pixel structural boundaries, and disciplined contrast rather than decorative flair.
- **Editorial Utility:** Complex curriculums, analytical dashboards, and deep technical documentation are structured with precise optical hierarchy, making deep focus effortless.
- **Subtle Materiality:** The interface favors dry, tactile paper-and-slate surfaces. Elements rely on razor-thin perimeter boundaries, whisper-soft neutral fills, and focused amber focal points.

## Colors

The palette is engineered around neutral tonalities: graphite, slate, cool zinc, and bone white. It eliminates high-chroma primary hues in favor of purposeful, contextual accents that convey status and deliberate action.

### Palette Architecture
- **Primary (`#1E293B` - Deep Slate Graphite):** Used for key structural anchors, high-contrast CTA backgrounds, primary headers, and definitive iconography.
- **Secondary (`#D97706` / `#F59E0B` - Restrained Warm Amber / Brass):** Denotes active progress markers, highlighted learning milestones, actionable insights, and live focus rings. Used sparely to direct cognitive attention.
- **Tertiary (`#059669` - Forest Emerald):** Exclusively reserved for validated mastery, completed course units, certified achievements, and positive delta values.
- **Neutral Foundation:**
  - **Canvas Base:** `#FAFAF9` (Soft warm zinc-tinted paper white)
  - **Surface Elevated:** `#FFFFFF` (Pure crisp white for card layers and tables)
  - **Border / Divider:** `#E2E8F0` (Default subtle structural edge) and `#CBD5E1` (Interactive border focus)
  - **Muted Body Text:** `#475569` (Charcoal slate for prolonged reading ease)
  - **Subtle Wash:** `#F1F5F9` (Hover states and nested module backdrops)

## Typography

The typographic hierarchy pairs the structured geometry of **Plus Jakarta Sans** for headlines with the neutral, hyper-legible ergonomics of **Inter** for reading surfaces, controls, and micro-copy. **JetBrains Mono** is introduced strictly for literal code snippets, numerical IDs, telemetry values, and algorithmic outputs.

### Editorial Guidelines
- **Optical Tightening:** Large editorial headers leverage negative letter tracking (`-0.02em` to `-0.03em`) to impart an authoritative, published finish.
- **Reading Rhythm:** Body text maintains a relaxed 1.6x leading (`body-lg`) in instructional environments to minimize fatigue during long study sessions.
- **Label Case:** Micro-labels (`label-sm`) use subtle uppercase with expanded letter-spacing (`+0.05em`) strictly when functioning as category tags or metadata descriptors.

## Layout & Spacing

The layout is grounded in a disciplined 12-column grid anchored by a 4px/8px incremental spacing rhythm. It utilizes generous negative space to elevate conceptual density without inducing visual strain.

### Viewport Adaptations
- **Desktop (1280px+):** Fixed max-container widths (1200px or 1440px wide canvas) framed by `margin: 2.5rem`, using a 12-column layout with `gutter: 1.5rem`. Side-by-side split panes support simultaneous reading and interactive exercise evaluation.
- **Tablet (768px - 1023px):** 8-column layout with `margin: 1.5rem`. Secondary meta rails collapse into contextual sheet overlays or horizontal stacks below core content.
- **Mobile (Below 768px):** 4-column fluid stack with strict `margin-mobile: 1rem` and `gutter-mobile: 1rem`. Component-internal padding condenses from `space-lg` to `space-md` to preserve horizontal text scanning space.

## Elevation & Depth

Visual hierarchy is expressed through precise line boundaries and subtle tonal stacking rather than heavy shadows or dramatic elevations.

### Elevation Principles
- **Low-Contrast Perimeter Borders:** Surfaces sit on crisp 1-pixel borders (`#E2E8F0` on light mode). Elevation changes do not invoke dark blurry drops, maintaining a clean architectural sheet feel.
- **Tonal Stepping:**
  - **Level 0 (Canvas):** `#FAFAF9` (Background foundation).
  - **Level 1 (Default Containers):** `#FFFFFF` bordered by `#E2E8F0`.
  - **Level 2 (Dropdowns, Floating Overlays, Modals):** `#FFFFFF` paired with an ultra-diffused micro shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.05)`, edged by a 1px border (`#CBD5E1`).
- **No Heavy Blurs:** Avoid intense frosted-glass blurs or multi-colored glow halos. State shifts are communicated through border tone shifts (e.g., `#E2E8F0` transitioning to `#1E293B` or `#D97706`).

## Shapes

The design system adopts a **Soft (`1`)** shape language. Curves are engineered to remain understated and crisp, preventing elements from looking toy-like while easing the sharp technical severity of standard data consoles.

### Geometric Rules
- **Base Components (Inputs, Buttons, Badges):** 0.25rem (4px) corner radius, preserving a tailored, precise edge.
- **Cards & Content Blocks:** 0.5rem (8px) corner radius, providing adequate structural containment for nested content.
- **Dialogs & Code Consoles:** 0.75rem (12px) maximum radius.
- **Strict Prohibition:** Full pill buttons (`border-radius: 9999px`) are forbidden for primary actions, permitted exclusively for small tabular status markers.

## Components

### Buttons
- **Primary:** Solid `#1E293B` background, `#FFFFFF` text, 0.25rem radius, 1px solid `#0F172A`. Hover transitions to `#334155`. Subtle active compression (`transform: scale(0.995)`). No drop shadows.
- **Secondary:** `#FFFFFF` background with 1px border `#E2E8F0`, `#1E293B` text. Hover state updates border to `#CBD5E1` and background to `#F8FAFC`.
- **Tertiary / Ghost:** Transparent fill, `#475569` text. Hover shifts background to `#F1F5F9` and text to `#0F172A`.
- **Accent Action:** Warm amber outline or solid (`#D97706`) reserved only for critical forward progression or purchase checkout flows.

### Cards & Module Containers
- Solid `#FFFFFF` fill, 1px uniform border `#E2E8F0`, 0.5rem radius, padded with `space-lg` (24px).
- Interactive cards (e.g., course chapters) feature a border change to `#94A3B8` on hover without translation jumps or float shadows.
- Headers within cards contain clear separation using a single 1px divider border at the bottom edge.

### Input Fields
- Crisp `#FFFFFF` surface, 1px border `#CBD5E1`, 0.25rem corner radius, font size `14px` (`body-md`).
- Focus state: Subtle 1px ring in `#1E293B` or `#D97706` (for learning inputs) with zero multi-pixel spread or cyber glow.
- Placeholder text: Neutral `#94A3B8`.

### Chips & Metadata Badges
- 0.25rem radius, height of 24px, typography set to `label-sm`.
- **Default/Neutral:** `#F1F5F9` fill, `#475569` text, no border.
- **Achievement/Complete:** `#ECFDF5` fill, `#047857` text, 1px border `#A7F3D0`.
- **Active Progress:** `#FFFBEB` fill, `#B45309` text, 1px border `#FDE68A`.

### Checkboxes & Radio Controls
- 16px square (checkbox) or circle (radio), 1px border `#CBD5E1` on `#FFFFFF`.
- Checked state: `#1E293B` fill featuring a precise 1.5px white geometric checkmark or central dot.
- Completed curriculum checklists swap active check fill to Forest Emerald (`#059669`).

### Lists & Curriculum Navigation
- Multi-tier structured hierarchy. Row items framed by hairline dividers (`#F1F5F9`), utilizing hover transitions (`background: #F8FAFC`).
- Left-rail indicator: A 2px amber (`#D97706`) vertical bar denotes current lesson position.

### Specialized EdTech Components
- **Code Reference Blocks:** Monospaced text block set against `#0F172A` with subdued syntax tokens; includes clean 1px border `#1E293B` and an understated header indicating execution path or language.
- **Milestone Progress Trackers:** Hairline progress tracks (4px height) with light slate backings (`#E2E8F0`) and solid warm amber (`#D97706`) progress indicators. Upon module completion, the entire track transitions seamlessly to forest emerald (`#059669`).