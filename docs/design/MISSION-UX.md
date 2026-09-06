# UX Mission — Shell plein écran

## Principe fondamental

Sur **desktop (≥ ~1024px)**, une mission occupe **presque tout le viewport**.

Ce n’est **pas** une page article centrée (`max-w-5xl` / `max-w-6xl` + gros scroll).

Ressembler à : **environnement de jeu + IDE + espace de travail**.

## Shell applicatif

```
┌─────────────────────────────────────────────┐
│ GLOBAL HEADER (compact)                     │  logo, Royaume, XP, streak
├─────────────────────────────────────────────┤
│ MISSION NAV BAR (compacte)                  │  ← Royaume | Mission N — titre | ●●○…🐉 | ‹ ›
├──────────────────────┬──────────────────────┤
│ LEFT ~45%            │ RIGHT ~55%           │
│ Briefing / cours     │ Playground           │
│ overflow-y: auto     │ visible en permanence│
│ SI besoin            │ message, éditeur,    │
│                      │ RUN, pipeline, tests │
└──────────────────────┴──────────────────────┘
```

### Règles CSS mentales

- Page mission : hauteur viewport (`h-dvh` / flex restant), `overflow: hidden` sur le shell
- **Pas de scroll global** de la page pendant une mission desktop normale
- Colonnes : `minmax(0, 45fr) / minmax(0, 55fr)`, enfants `min-width: 0`, `min-height: 0`
- Seul le panneau briefing (et éventuellement la zone tests) scroll en interne

## Mission Nav Bar

Toujours visible. Le joueur doit savoir :

- où il est
- quelle mission
- progression vers le Boss (`1/10`, points, 🐉)

Actions : retour Royaume, prev/next si missions débloquées.

## Panneau gauche — Brief

Documentation / briefing de mission :

- titres, séparateurs, typo
- **peu de cards imbriquées**
- intro, « Comment ça marche », Assignment, indices

Contenu pédagogique : données dans `src/data/missions/*.ts`, rendu dense dans `MissionBriefing`.

## Panneau droit — Playground

Toujours visible sans scroller la page :

1. Message client  
2. Instruction du système + textarea + **RUN**  
3. Pipeline **horizontal** compact  
4. Tests compacts (○ → Running → PASS/FAIL)

Le bouton RUN reste à côté de l’éditeur — jamais « écrire puis chercher RUN plus bas sur la page ».

## Pipeline

Compact, horizontal sur desktop :

`Message → Instruction → AI Model → Output`

Pendant RUN : état qui circule gauche → droite. Pas une tour verticale géante.

## Responsive

| Breakpoint | Comportement |
|------------|----------------|
| Desktop ≥ 1024px | 2 colonnes fullscreen, pas de scroll page |
| Tablette / mobile | onglets **Brief \| Workspace** ; scroll global OK |

## Fichiers clés

- `MissionWorkspace.tsx` — orchestration shell
- `MissionNavBar.tsx` — barre de progression mission
- `MissionBriefing.tsx` — colonne gauche
- `MissionPlayground.tsx` — colonne droite
- `PipelineVisual.tsx` — pipeline horizontal
- `TestResults.tsx` — batterie de tests compacte
- `src/app/missions/layout.tsx` — conteneur plein hauteur

## À ne pas refaire

- Recentrer le workspace dans un `max-w-*`
- Empiler briefing + playground en une seule colonne scrollable sur desktop
- Remettre de grosses cards pour chaque paragraphe du brief
