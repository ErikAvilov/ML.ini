<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mlini — consignes agents

Avant de modifier l’UI, le produit ou une mission, lire :

- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — design tokens Arcane Academy
- [`docs/design/README.md`](docs/design/README.md) — index design
- [`docs/design/PRODUCT.md`](docs/design/PRODUCT.md) — vision produit / scope
- [`docs/design/MISSION-UX.md`](docs/design/MISSION-UX.md) — shell mission plein écran
- [`docs/design/PEDAGOGY.md`](docs/design/PEDAGOGY.md) — pédagogie
- [`docs/NARRATIVE.md`](docs/NARRATIVE.md) — canon narratif Royaume I (Veyra, MILDRED, Mira)
- [`docs/SKILL_TREE.md`](docs/SKILL_TREE.md) — arbre de compétences (meta-progression)
- [`docs/QOL.md`](docs/QOL.md) — patterns ergonomiques missions
- Si `graphify-out/graph.json` existe : préférer `graphify query` pour naviguer l’architecture avant d’explorer au hasard ; `graphify --update` après gros changements

## Rappels non négociables (V0)

- Pas d’exposition de `GEMINI_API_KEY` / `OPENAI_API_KEY` côté client
- Pas de DB / auth / Stripe / Supabase sans demande explicite
- Missions desktop = viewport shell, pas page SaaS scrollable centrée
- Théorie après pratique
- Contenu pédagogique dans `src/data/missions/`, pas enfoui dans le JSX
- Compétences globales dans `src/data/skills/`, pas enfouies dans le JSX
- Identités narratives (Mira, Veyra, MILDRED) via `src/data/narrative/canon.ts`
- UI : tokens `--ml-*` avant toute valeur hex arbitraire
- Continuité narrative : ne pas casser le canon sans demande explicite du product owner
- Skill tree ≠ progression MILDRED / carte Royaume — deux systèmes distincts
- IA serveur via `src/lib/ai-client.ts` (`completeChat`) — provider Gemini par défaut
