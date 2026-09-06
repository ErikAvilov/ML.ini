# Produit — Mlini

## Phrase fondatrice

> Une école technique de l’IA déguisée en jeu vidéo.

Inspirations **conceptuelles** (pas visuelles) : Boot.dev, école 42, RPG / progression, plateformes de coding interactives.

**Ne pas copier** le design ni le branding de Boot.dev. Reprendre sa *philosophie* UX : environnement de travail, largeur utile, lire à gauche / agir à droite.

## Public (Royaume 1)

Le joueur sait utiliser un ordinateur et un navigateur.  
Il ne connaît pas forcément : programmation, JSON, API, LLM, prompts, variables.

Un joueur expérimenté doit pouvoir aller vite, sans tutoriel obligatoire interminable.

## Ce que le joueur doit ressentir

- Explorer un **monde pédagogique**, pas remplir un formulaire
- Être dans un **atelier / IDE / jeu**, pas sur une landing
- **Configurer un système** qui utilise une IA — pas « discuter avec ChatGPT »

## Scope prototype (V0)

### À faire / déjà en place

- Royaume « Construire avec l’IA »
- Carte de progression (missions visibles, Boss au bout)
- Mission 1 jouable de bout en bout (IA réelle, tests, hints, XP, unlock Mission 2)
- Progression locale (`localStorage`)
- Appels LLM **uniquement** via routes serveur Next.js

### À ne pas ajouter sans demande explicite

Login, DB, Stripe, Supabase, Prisma, abonnements, leaderboard complet, admin, équipes, marketplace, saisons, certification.

## Royaume actuel

- **Nom :** Construire avec l’IA  
- **Sous-titre :** Pars de zéro. Construis ton premier système IA.  
- Gratuit dans le produit final  
- ~10 missions sur la carte ; seul le contenu Mission 1 est développé ; Mission 2 = placeholder débloqué après M1

## Structure code utile

```
src/data/missions/     # définitions pédagogiques (données, pas JSX massif)
src/data/kingdoms/     # royaumes
src/components/mission/  # shell mission, briefing, playground
src/components/kingdom/  # hub / carte
src/lib/               # progression, validation, ai-client (NVIDIA)
src/app/api/ai/        # classify, hint — clé API serveur uniquement
```

## Variables d’environnement

- `NVIDIA_API_KEY` dans `.env` ou `.env.local` (jamais dans le frontend / Git)
- Optionnel : `NVIDIA_MODEL` (défaut `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`)
- Voir `.env.example`
- Clé : [build.nvidia.com](https://build.nvidia.com) (préfixe `nvapi-`)
