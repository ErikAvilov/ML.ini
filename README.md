# Mlini

Plateforme interactive pour apprendre l’IA **en la construisant** — missions, progression, Royaume.

Prototype V0 : Royaume I chez **Veyra**, projet **MILDRED**. Tu configures un système qui utilise un modèle, tu ne « discutes pas avec ChatGPT ».

## Lancer

```bash
cp .env.example .env.local
# GEMINI_API_KEY=...
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Variables : `AI_PROVIDER` (`gemini` par défaut / `openai`), `GEMINI_API_KEY`, optionnel `GEMINI_MODEL`. Jamais de clé API côté client.

## Ce qui est jouable (V0)

| # | Mission | Concept |
|---|---------|---------|
| 00 | Intro | Entrée Royaume / Mira |
| 01 | The Black Box | input → instruction → model → output |
| 02 | Signal in the Noise | règles métier, contraintes |
| 03 | Speak Machine | sortie structurée prévisible |
| 04 | Broken Payload | JSON + réparation de payload |
| 05 | The Fork | lire une valeur, `if` / `else`, routage déterministe |
| 06 | Bring It to Life | appeler l’IA depuis du code (`ai.ask`) + parse + décider |
| 07–10 | Placeholders | carte seulement |

Progression : XP / niveau, skill tree, capacités MILDRED — **localStorage**, pas de DB / auth / Stripe.

## UX mission (règle produit)

```
GAUCHE = comprendre (brief, Mira, objectif, concepts, hints)
DROITE = faire (prompt / code éditable, RUN, tests, feedback)
```

Missions code (05+) : grille ~38 / 62. Shell plein viewport desktop — pas une page SaaS scrollable.

Détail : [`docs/design/MISSION-UX.md`](docs/design/MISSION-UX.md).

## Modes d’exercice

- **prompt** (M01–M04) : instruction éditable → Gemini → validation déterministe
- **logic** (M05) : codeFill éditable → **pas** d’IA au RUN → scénarios de route
- **ai-integration** (M06) : codeFill + instruction fournie → **vrai** Gemini → JSON → route

Ne pas confondre `codeFill` avec « pas d’IA » : c’est `codeFill.mode` qui décide.

## Architecture utile

```
src/data/missions/       # pédagogie (données, pas JSX massif)
src/data/skills/         # arbre de compétences
src/data/narrative/      # canon Mira / Veyra / MILDRED
src/components/mission/  # shell, briefing, playground, codeFill
src/lib/ai-client.ts     # completeChat (serveur)
src/lib/validation.ts    # tests, code-fill, JSON, routes
src/app/api/ai/          # classify, classify-batch, hint
```

Self-check code-fill : `npx tsx scripts/check-code-fill.ts`

## Docs

| Doc | Contenu |
|-----|---------|
| [`docs/design/PRODUCT.md`](docs/design/PRODUCT.md) | Scope V0, non-négociables |
| [`docs/design/MISSION-UX.md`](docs/design/MISSION-UX.md) | Shell mission, colonnes |
| [`docs/design/PEDAGOGY.md`](docs/design/PEDAGOGY.md) | Pratique avant théorie |
| [`docs/NARRATIVE.md`](docs/NARRATIVE.md) | Canon fictionnel |
| [`docs/SKILL_TREE.md`](docs/SKILL_TREE.md) | Skills ≠ carte Royaume |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens `--ml-*` |

## Stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS · Gemini (serveur, OpenAI en fallback)

## Hors scope sans demande explicite

Login, DB, Stripe, Supabase, leaderboard, admin, marketplace.
