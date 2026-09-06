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

1. Il travaille sur un **système fictif d’entreprise**
2. Une **IA est déjà connectée**
3. Il écrit l’**instruction du système** (réutilisable)
4. Cette instruction s’applique à **plusieurs messages**
5. Son job : rendre le comportement **fiable**
6. Il **ne discute pas** simplement avec ChatGPT

Label éditeur : **Instruction du système**  
Sous-titre : « Écrite par toi · utilisée automatiquement sur chaque message »

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
