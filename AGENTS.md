<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mlini — consignes agents

## Autorité documentation (produit Mlini)

Ordre strict — en cas de conflit, le rang supérieur gagne :

1. [`docs/UX_FOUNDATION.md`](docs/UX_FOUNDATION.md) — IA, navigation, World → Kingdom → Mission, routes canoniques
2. [`docs/MLINI_DESIGN_SYSTEM.md`](docs/MLINI_DESIGN_SYSTEM.md) — identité visuelle Editorial Cartographic (produit entier ; tokens §3–§5)
3. [`docs/MLINI_INTERACTIONS.md`](docs/MLINI_INTERACTIONS.md) — motion, timings exacts, skeletons, états
4. Docs spécialisés — [`docs/design/MISSION-UX.md`](docs/design/MISSION-UX.md), [`docs/QOL.md`](docs/QOL.md), [`docs/SKILL_TREE.md`](docs/SKILL_TREE.md), [`docs/NARRATIVE.md`](docs/NARRATIVE.md), [`docs/design/PEDAGOGY.md`](docs/design/PEDAGOGY.md), [`docs/design/PRODUCT.md`](docs/design/PRODUCT.md), [`docs/UI_ARCHITECTURE.md`](docs/UI_ARCHITECTURE.md)
5. Archive historique — [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) (Adventure Tech, pré-unification). **Ne pas appliquer** ; ne pas utiliser pour implémenter une surface actuelle.

Index design : [`docs/design/README.md`](docs/design/README.md).

Si `graphify-out/graph.json` existe : préférer `graphify query` pour naviguer l’architecture avant d’explorer au hasard ; `graphify --update` après gros changements.

## Rappels non négociables (V0)

- `/app/**` = authentifié uniquement (gate proxy + layout) ; `/` = landing anonyme ; `/` connecté → redirect `/app`
- Progression = compte cloud uniquement (pas de mode anonyme produit)
- Pas d’exposition de `GEMINI_API_KEY` / `OPENAI_API_KEY` côté client
- Pas de Stripe / auth alternative / nouvelle DB sans demande explicite (runtime = Better Auth + Neon)
- Missions desktop = viewport shell, pas page SaaS scrollable centrée
- Théorie après pratique
- Contenu pédagogique dans `src/data/missions/`, pas enfoui dans le JSX
- Compétences globales dans `src/data/skills/`, pas enfouies dans le JSX
- Identités narratives (Mira, Veyra, MILDRED) via `src/data/narrative/canon.ts`
- UI : tokens sémantiques Editorial Cartographic selon [`docs/MLINI_DESIGN_SYSTEM.md`](docs/MLINI_DESIGN_SYSTEM.md) (pas de hex arbitraire) — site-wide ; variantes contextuelles Marketing / Utility / Application
- Continuité narrative : ne pas casser le canon sans demande explicite du product owner
- Skill tree ≠ progression MILDRED / carte Royaume — deux systèmes distincts
- IA serveur via `src/lib/ai-client.ts` (`completeChat`) — provider Gemini par défaut
- Stitch = référence visuelle only — jamais curriculum / telemetry inventés
