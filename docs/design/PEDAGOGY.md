# Pédagogie

## Boucle voulue

```
PROBLÈME → TENTATIVE → EXÉCUTION → ERREUR → COMPRÉHENSION → CORRECTION → RÉUSSITE
```

**Éviter :**

```
COURS THÉORIQUE → QUIZ → COURS → QUIZ
```

La théorie arrive **après** la pratique (ex. overlay Mission Cleared).

## Rôle du joueur (Mission 1 — modèle mental)

Avant de cliquer RUN, le joueur doit comprendre :

1. Il vient d’arriver chez **Veyra** (équipe **Automation**)
2. Il travaille sur **Project MILDRED**
3. Une **IA est déjà connectée**
4. Il écrit l’**instruction de MILDRED** (réutilisable)
5. Cette instruction s’applique à **plusieurs messages**
6. Son job : rendre le comportement **fiable**
7. Il **ne discute pas** simplement avec ChatGPT

Label éditeur : **Instruction de MILDRED**  
Sous-titre : « Écrite par toi · réutilisée automatiquement sur chaque message »

## Écran de réussite

Ordre pédagogique :

1. Réaction Mira  
2. Mission complete + XP  
3. MILDRED upgraded (avant / maintenant + capability ONLINE)  
4. What you just learned (langage clair)  
5. Skill unlocked  
6. Termes techniques (optionnel, replié)  

Données : `mission.completion` (`MissionCompletionContent`).  
Canon fiction : [`docs/NARRATIVE.md`](../NARRATIVE.md).


## Briefing type (esprit Boot.dev, design Mlini)

1. Accueil / rôle fictif clair  
2. Contexte court  
3. « Comment ça marche » (flux visuel)  
4. **Assignment** + tâche numérotée concrète  

Lecture cible : ~30–45 secondes. Phrases courtes, peu de jargon, pas corporate.

## Validation

- Le modèle **génère** ; la réussite se juge avec des **tests déterministes** (pas un second LLM juge)
- Feedback d’échec format : expliquer sans coller la solution complète
- Hints progressifs ; un hint ne donne pas immédiatement le prompt parfait

## Concepts révélés après succès (Mission 1)

INPUT → INSTRUCTIONS → MODEL → OUTPUT  

Courte explication seulement **après** 3/3 tests.

## Contenu vs UI

- Ne pas enterrer le contenu pédagogique dans d’énormes composants React
- Définir missions dans `src/data/missions/`
- L’UI mission affiche / orchestre ; elle ne réinvente pas le scénario à chaque refactor
