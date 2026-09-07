# MLINI — Canon narratif

> **Future agents must preserve narrative continuity unless the product owner explicitly changes the canon.**

Source de vérité fictionnelle pour le **Royaume I**.  
Identités renommables côté code : [`src/data/narrative/canon.ts`](../src/data/narrative/canon.ts).

---

## Univers

| Élément | Canon |
|--------|--------|
| Plateforme | **MLINI** |
| Royaume I | Building with AI / Construire avec l'IA |
| Entreprise | **Veyra Systems** (UI / dialogues : **Veyra**) |
| Équipe | **Automation** |
| Rôle joueur | Junior AI Systems Engineer (ne pas marteler le titre) |
| Projet central | **PROJECT MILDRED** / **MILDRED** |
| Lead | **Mira Vale** — Lead Systems Engineer |

Le joueur doit ressentir : *je construis et j’améliore des systèmes qui utilisent l’IA* — pas *je discute avec un chatbot*.

---

## Project MILDRED

MILDRED est un système interne que Veyra transforme progressivement en automatisation IA.

**Début du Royaume :**

```
Customer message → AI model → ???
```

**Fin du Royaume (cible) :**

```
Input → AI → Structured data → Logic → API / actions → Final result
```

Règles :

- Chaque mission **fait évoluer MILDRED**.
- Une notion technique apparaît parce que le système **rencontre une limite**, pas parce qu’on « enseigne le chapitre JSON ».
- MILDRED n’est **pas** un personnage qui parle. C’est le système que le joueur construit.
- Formulations naturelles : « MILDRED failed Test 2 », « MILDRED is ready », « MILDRED returned an invalid response ».

---

## Mira Vale

Humaine. Supérieure. Mentor. Introduit certaines missions. Personnage récurrent (future mascotte visuelle possible).

**N’est pas une IA.**

### Personnalité

Compétente · calme · concise · légèrement sarcastique · exigeante · jamais méprisante · jamais excessivement enthousiaste.

### Ton — faire

- « The model is connected. Unfortunately, nobody told it what we want. That's your problem now. »
- « Machines are annoyingly literal. One missing comma is enough to ruin their day. And yours. »
- « Remember when this thing only classified three messages? Good times. »

### Ton — éviter absolument

- « Great job!!! 🎉 »
- « You're amazing! »
- « Fantastic work, hero! »
- Félicitations artificielles à chaque action
- Fantasy médiévale, cyberpunk caricatural, corporate e-learning, lore-novel

Style global : **campagne de jeu vidéo professionnelle et moderne**. La gamification (missions, kingdoms, boss, XP) porte le « jeu » ; la fiction reste crédible techniquement.

---

## Structure idéale d’une mission

```
ROLE / CONTEXT
  → PROBLEM
  → WHY IT MATTERS
  → ASSIGNMENT
  → PLAYER ATTEMPT
  → RESULT
  → DISCOVERY
  → MILDRED EVOLVES
```

Théorie / concepts **après** la pratique (overlay de réussite).

---

## Arc provisoire — Royaume I

| # | Titre (EN) | Idée narrative |
|---|------------|----------------|
| 01 | The Black Box | Modèle connecté, pas d’instructions fiables |
| 02 | Signal in the Noise | Messages humains plus ambigus que prévu |
| 03 | Speak Machine | Réponses lisibles par un humain, inutilisables par le système |
| 04 | Broken Payload | Données structurées mal formées, pipeline cassé |
| 05 | The Fork | Analyser ne suffit plus — l’app doit décider |
| 06 | Bring It to Life | Brancher le prototype depuis du vrai code |
| 07 | Beyond the Walls | Communiquer avec un service extérieur |
| 08 | The Chain | Faire tenir les briques ensemble |
| 09 | Red Alert | Scale : erreurs, edge cases, comportements inattendus |
| 10 | Boss: Launch Night | Déploiement — exigences, outils, données, tests ; Mira se retire |

Ce plan est **provisoire** et pourra évoluer avec la pédagogie. Ne pas implémenter les missions 02–10 tant que le product owner ne le demande pas.

---

## Évolution de la relation Mira ↔ joueur

| Phase | Attitude |
|-------|----------|
| Début | Explique beaucoup — « I'll walk you through this one. » |
| Milieu | Suppose des acquis — « You've seen this part before. I'm not explaining it twice. » |
| Mission 9 | Collègue — « We have a problem. Find out what happened. » |
| Boss | Se retire — « I've shown you enough. MILDRED is yours. » |

Ne jamais écrire explicitement « You are becoming a better engineer. » Laisser la relation le montrer.

---

## Feedback Mira

Mira n’intervient **pas** sur chaque erreur. Les tests restent la source principale de feedback.

Elle parle quand un commentaire humain améliore vraiment l’expérience (ex. échec de format Mission 1 : le modèle a compris, l’application non).

---

## Mission 01 — The Black Box (état)

- Pédagogie / tests / RUN inchangés.
- Narration : onboarding Veyra + Automation + première brique MILDRED (instruction réutilisable → labels).
- Découverte post-réussite : INPUT / INSTRUCTIONS / MODEL / OUTPUT.

## Mission 02 — Signal in the Noise (état)

- Jouable. Continuité directe après Mission 01.
- MILDRED doit prioriser (URGENT / NORMAL) via la **Veyra Support Policy**.
- Leçon émergente : context, criteria, constraints, robustness.
- Découverte post-réussite : CONTEXT / CRITERIA / CONSTRAINTS / ROBUSTNESS.

## Mission 03 — Speak Machine (état)

- Jouable. Sortie structurée pré-JSON : `SENTIMENT` + `PRIORITY`.
- Pas de JSON (réservé Mission 04).
- Distingue erreur de **format** vs erreur **sémantique**.
- Capability : Structured Output → ONLINE.

---

## Règles pour les agents

1. Préserver Veyra, MILDRED, Mira, Automation, sauf changement explicite du product owner.
2. Changer les noms via `src/data/narrative/canon.ts`, pas en dur dispersé.
3. Ne pas transformer le briefing en cours théorique.
4. Lier tout nouveau concept à une **limite de MILDRED**.
5. Ne pas casser le shell mission, l’API, les tests, le RUN, les hints, l’XP ou la progression pour une passe narrative.
