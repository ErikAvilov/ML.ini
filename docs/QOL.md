# QoL — patterns ergonomiques (V1)

Patterns retenus pour que le joueur reste des heures sur Mlini sans lutter contre l’UI.

## Navigation missions

- Barre : Royaume ← · titre · `order/total` · nœuds cliquables · ← →
- Nœuds **completed / available / current** : navigation directe
- Nœud **locked** : pas de navigation ; tooltip « termine Mission XX d’abord »
- Page locked : message clair + lien mission précédente / carte

## Raccourcis

| Raccourci | Action |
|-----------|--------|
| `Ctrl/Cmd + Enter` | Run (évite double appel si déjà running) |
| `Alt + ←` | Mission précédente (si débloquée) |
| `Alt + →` | Mission suivante débloquée |

Éviter de détourner les raccourcis navigateur critiques hors de ce périmètre.

## Drafts

- Couche : `src/lib/persistence/mission-drafts.ts` (pas de `localStorage` direct dans l’UI)
- Clé : `mlini-mission-drafts-v1` → `{ [missionId]: instruction }`
- Survive refresh, map, skill tree, retour mission
- Après un Run raté : l’instruction **n’est jamais** effacée

## Indices

- Révélation manuelle uniquement
- Compteur persisté en `sessionStorage` (`hint-session.ts`) pendant l’onglet

## Erreurs

| Type | Affichage |
|------|-----------|
| API / réseau / timeout | **ERREUR SYSTÈME** + texte d’aide (« pas un échec de ta solution ») |
| Tests en échec | **SOLUTION À AJUSTER** + feedback pédagogique |

Ne jamais présenter une panne OpenAI comme un mauvais exercice du joueur.

## Run

- Bouton disabled + `aria-busy` pendant le run
- Pipeline existant pour Idle → Running → Evaluating → Complete
- Pas de double fetch parallèle involontaire

## Continue learning (données)

- `PlayerProgress.lastPlayedMissionId` mis à jour à l’ouverture / completion
- Helpers : `getLastUnlockedMissionId`, `getContinueMissionId` dans `progression.ts`
- Pas de dashboard complet en V1 — la donnée est prête

## Mobile

- Missions : tabs Brief | Workspace (existant)
- Skill tree : canvas pan + fiche détail dessous / à côté ; pas d’arbre illisible figé à 320px
