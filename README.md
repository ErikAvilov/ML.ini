# Mlini

Prototype V0.1 — école technique de l'IA déguisée en jeu vidéo.

## Design (agents & contributeurs)

Voir [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) et [`docs/design/README.md`](docs/design/README.md).

## Lancer

```bash
cp .env.example .env.local
# Ajoute ta clé Gemini : GEMINI_API_KEY=...
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Gemini (API côté serveur, OpenAI en fallback)
