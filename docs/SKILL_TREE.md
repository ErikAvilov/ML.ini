# Skill Tree V1

## Rôle

L’arbre de compétences représente **ce que le joueur a réellement appris et prouvé** en réussissant des missions.

Ce n’est **pas** :

- un arbre de perks avec points à dépenser ;
- la progression narrative MILDRED du Royaume I ;
- un décor de dashboard.

Pour la V1 : unlock = mission terminée. Aucun choix de dépense.

---

## Skill tree ≠ progression Royaume / MILDRED

| Système | Sens |
|---------|------|
| **Skill tree** (`/skills`) | Compétences techniques du joueur (global, multi-royaumes) |
| **Progression Royaume** | Chemin de missions, carte d’expédition |
| **MILDRED capabilities** | Capacités du prototype dans la fiction Veyra |

Les trois coexistent. Ne pas les fusionner dans l’UI.

---

## Modèle

Source de vérité : `src/data/skills/tree.ts`

```ts
SkillDefinition {
  id                  // stable, e.g. prompting-1
  name                // formal: "Prompting I"
  displayName         // player-facing
  description
  category
  level
  type                // minor | normal | major | keystone
  prerequisites       // skill ids
  unlockedByMissionId
  kingdomId
  position            // { x, y } logical canvas
}
```

États runtime (`src/lib/skills.ts`) :

- `locked` — prérequis ou mission non prouvée
- `available` — prérequis OK, mission pas encore réussie
- `unlocked` — mission complétée (ou skill id présent)
- `mastered` — réservé (non utilisé en V1)

Résolution principale : `completedMissions` contient `unlockedByMissionId`.  
`unlockedSkills` est synchronisé au load / complete pour cohérence des saves.

---

## Compétences V1 (Missions 01–03)

| Id | Nom | Mission |
|----|-----|---------|
| `llm-fundamentals-1` | LLM Fundamentals I | mission-01 |
| `prompting-1` | Prompting I | mission-02 |
| `structured-output-1` | Structured Output I | mission-03 |

Chaîne : Fundamentals → Prompting → Structured Output.

Les textes de completion mission (`skillUnlocked.skillId`) doivent matcher le registry.

---

## Architecture UI

- Route : `/skills`
- Composant : `src/components/skills/SkillTreeView.tsx`
- Canvas SVG (liens) + nodes HTML, pan / zoom / reset view
- Fiche détail : nom, niveau, description, royaume, mission, statut

Pas de bibliothèque de graphe lourde.

---

## Ajouter une compétence future

1. Ajouter une entrée dans `SKILL_SEEDS` (`src/data/skills/tree.ts`) avec `copy.fr` / `copy.en`.
2. Ajouter l’edge dans `SKILL_EDGES` si dépendance pédagogique.
3. Poser `position` sur le canvas (peut être recalibré plus tard).
4. Sur la mission : `completion.skillUnlocked.skillId` = id du seed.
5. Ne pas inventer de skills sans mission qui les prouve.

Les Royaumes futurs alimentent le **même** arbre global.
