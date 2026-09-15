# Design Mlini — Index

Documentation pour les agents et contributeurs.

## Autorité (produit Mlini)

Ordre strict — le rang supérieur gagne en cas de conflit :

| Rang | Document | Rôle |
|------|----------|------|
| 1 | [`../UX_FOUNDATION.md`](../UX_FOUNDATION.md) | IA, navigation, World → Kingdom → Mission, routes canoniques |
| 2 | [`../MLINI_DESIGN_SYSTEM.md`](../MLINI_DESIGN_SYSTEM.md) | Identité Editorial Cartographic **produit entier** ; tokens, typo, variantes contextuelles |
| 3 | [`../MLINI_INTERACTIONS.md`](../MLINI_INTERACTIONS.md) | Motion, timings d’implémentation, skeletons, états |
| 4 | Docs spécialisés (ci-dessous) | Mission shell, pédagogie, canon, skills, QoL, archi UI |
| 5 | Archive historique | Ancien système Adventure Tech — **ne pas appliquer** |

**Archive — ne pas utiliser pour l’implémentation :**

| Document | Statut |
|----------|--------|
| [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) | **Historique** (Adventure Tech, pré-unification). Référence archéologique uniquement. |
| [`VISUAL.md`](./VISUAL.md) | **Deprecated**. Remplacé par [`../MLINI_DESIGN_SYSTEM.md`](../MLINI_DESIGN_SYSTEM.md). |

## Docs spécialisés

| Document | Quand le lire |
|----------|----------------|
| [PRODUCT.md](./PRODUCT.md) | Vision produit / scope (vérifier fraîcheur vs runtime actuel) |
| [MISSION-UX.md](./MISSION-UX.md) | Shell mission plein écran + hiérarchie info + Mission 0 |
| [PEDAGOGY.md](./PEDAGOGY.md) | Boucle d’apprentissage |
| [`../NARRATIVE.md`](../NARRATIVE.md) | Canon fiction Royaume I (Veyra, MILDRED, Mira) |
| [`../SKILL_TREE.md`](../SKILL_TREE.md) | Arbre de compétences (meta-progression) |
| [`../QOL.md`](../QOL.md) | Patterns ergonomiques missions |
| [`../UI_ARCHITECTURE.md`](../UI_ARCHITECTURE.md) | Architecture UI unifiée : shells, routes, redirects |

**Règle courte :** Mlini est une école technique de l’IA déguisée en jeu vidéo — pas un dashboard SaaS, pas un article de blog, pas ChatGPT dans une page.
