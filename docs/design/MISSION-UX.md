# UX Mission — Shell plein écran

## Principe fondamental

Sur **desktop (≥ ~1024px)**, une mission occupe **presque tout le viewport**.

Ce n’est **pas** une page article centrée (`max-w-5xl` / `max-w-6xl` + gros scroll).

Ressembler à : **environnement de jeu + IDE + espace de travail**.

## Hiérarchie d’information (règle produit)

Pour toute mission normale, le premier viewport doit répondre :

1. **Qu’est-ce qui est cassé ?** — message Mira court (2–4 lignes)
2. **Que dois-je faire ?** — bloc OBJECTIF (teal)
3. **Où le faire ?** — workspace + Run visibles sans scroll page

Ordre de contenu dans le brief :

1. Problème court (Mira)
2. Objectif clair
3. Nouveau concept / règles actuelles
4. Workspace (colonne droite dominante)
5. Tests / feedback
6. Règles déjà apprises — **repliées**
7. Indices — **repliés**

### Connaissance

- **NOUVELLE** = dominante (teal, ouverte)
- **ANCIENNE** = accessible mais secondaire (repliée, blue-grey)

### Narratif

- Mira parle en **2–4 lignes** max pendant une mission active
- L’exposition Royaume (Veyra, Mira, MILDRED, boucle de mission, XP, boss) vit dans **Mission 0** — pas dans chaque mission

## Mission 0 — Intro Royaume

- `kind: "intro"`, `order: 0`, XP 0
- Hors des 10 défis du Royaume
- Nœud START distinct sur la carte
- Débloque la Mission 01
- Les joueurs déjà avancés skippent automatiquement l’intro (migration progress)

## Shell applicatif

```
┌─────────────────────────────────────────────┐
│ GLOBAL HEADER / MISSION NAV (compact)       │
├──────────────────────┬──────────────────────┤
│ LEFT ~40%            │ RIGHT ~60%           │
│ Objectif / concept   │ Playground           │
│ overflow-y: auto     │ éditeur + RUN + tests│
└──────────────────────┴──────────────────────┘
```

### Règles CSS mentales

- Page mission : hauteur viewport, `overflow: hidden` sur le shell
- **Pas de scroll global** de la page pendant une mission desktop normale
- Colonnes : `minmax(0, 40fr) / minmax(0, 60fr)`, enfants `min-width: 0`, `min-height: 0`
- Seul le panneau briefing (et la zone résultats) scroll en interne

## Mission Nav Bar

Toujours visible. Progression cœur : `1/10` (intro exclue du compteur).

## Panneau gauche — Brief compact

- Titre mission + statut
- `MiraMessage` (pas de bannière VEYRA / INCOMING ASSIGNMENT)
- Objectif teal
- Nouveau concept / format comparé / contrat
- Règles actuelles si nouvelles
- `CollapsibleBlock` : règles précédentes, théorie optionnelle, indices

Contenu : `src/data/missions/*.ts` via champs `shortBrief`, `objectiveText`, `newConcept`, `formatCompare`, `previousRules`, etc.

## Panneau droit — Playground

Toujours visible sans scroller la page :

1. Message client  
2. Instruction + textarea + **RUN**  
3. Pipeline horizontal compact  
4. Tests (scroll interne si besoin)

## Responsive

| Breakpoint | Comportement |
|------------|----------------|
| Desktop ≥ 1024px | 2 colonnes fullscreen, pas de scroll page |
| Tablette / mobile | onglets **Brief \| Workspace** ; scroll global OK |

## Fichiers clés

- `MissionWorkspace.tsx` — orchestration shell
- `MissionIntro.tsx` — Mission 0
- `MissionNavBar.tsx` — barre de progression
- `MissionBriefing.tsx` — colonne gauche compacte
- `MiraMessage.tsx` / `CollapsibleBlock.tsx` / `BriefBlocks.tsx`
- `MissionPlayground.tsx` — colonne droite
- `src/app/missions/layout.tsx` — conteneur plein hauteur

## À ne pas refaire

- Bannière Veyra / Incoming Assignment sur chaque mission
- Recentrer le workspace dans un `max-w-*`
- Empiler briefing + playground en une seule colonne scrollable sur desktop
- Remettre de grosses cards / longs paragraphes avant l’exercice
- Afficher les règles déjà apprises en bloc permanent
