# MLINI Design System — Adventure Tech

> Toute nouvelle interface MLINI doit utiliser les design tokens `--ml-*` avant toute valeur hex arbitraire.

Thème par défaut : **Adventure Tech** (`data-theme="adventure-tech"`).  
Alias conservés : `arcane-academy`, `arcane-tech` (mêmes tokens).

Références Stitch (`design-reference/stitch/`) = **inspiration visuelle uniquement**.  
Les données produit (missions, skills, XP, MILDRED) viennent toujours du repo réel.

---

## 1. Philosophie

MLINI = plateforme interactive pour apprendre l’IA en la construisant, avec une couche jeu (Royaumes, missions, boss, skills, profile).

### Intensité RPG par surface

| Surface | Intensité | Feeling |
|---------|-----------|---------|
| Mission workspace | ~20% | Calme, lisible, concentration |
| Homepage | ~45% | Entrée forte, désir |
| Kingdom map | ~60% | Carte de progression |
| Skill Tree | ~75% | Réseau de connaissances |
| Profile | ~80% | Fiche joueur / prestige |
| Boss / fin de Royaume | ~90% | Temporaire, rare |

**Pas :** cyberpunk, cockpit militaire, SaaS violet, fantasy médiévale lourde, lore technique inventé (telemetry, tactical, etc.).

Priorité : lisibilité → pédagogie → correction produit → cohérence visuelle → perf → game feel → décoration.

---

## 2. Typographie

| Rôle | Police | Token / usage |
|------|--------|----------------|
| Display / prestige | **Playfair Display** | `--font-display` — titres homepage, Royaume, boss, moments profile |
| Corps / UI | **Plus Jakarta Sans** | `--font-body` — nav, brief, boutons, UI |
| Technique | **JetBrains Mono** | `--font-mono` — code, XP, IDs, états techniques |

Monospace rare. Majuscules + tracking limités.

Échelle : `--ml-text-base` ≈ 17px body ; `--ml-leading-body` 1.65.

---

## 3. Palette

Source : `src/app/globals.css`.

| Rôle | Hex | Token |
|------|-----|-------|
| Background | `#09131D` | `--ml-bg-0` |
| Surface | `#101D29` | `--ml-surface-1` |
| Elevated | `#152433` | `--ml-surface-2` |
| Text | `#EEE8DA` | `--ml-text` |
| Body | `#B8B5AA` | `--ml-text-body` |
| Muted | `#7F8C96` | `--ml-text-muted` |
| Primary / knowledge | `#42BDB1` | `--ml-accent` |
| Secondary | `#607B92` | `--ml-secondary` |
| Prestige | `#CFA552` | `--ml-reward` |
| Border | `#263A4C` | `--ml-border` |

Teal = action / connaissance. Or = rare (boss, legendary). Ne pas copier les teals/or conflictuels de Stitch `DESIGN.md`.

---

## 4. Atmosphere

Texture : `/public/images/background-1.jpg` via `SiteAtmosphere` + `.ml-atmosphere*`.

- Homepage : texture un peu plus visible (`html[data-home="true"]`)
- Missions : wash plus fort, lisibilité d’abord

---

## 5. Emblème

Primitive losange : `MliniEmblem` + `BrandLogo` = `[diamond] MLINI`.  
Réutilisable pour nodes, frames, séparateurs. Pas de double wordmark.

---

## 6. Header

`SiteHeader` (écrans app) : logo · Royaumes · Arbre · Missions · Profil · niveau/XP · avatar.

Masqué sur `/missions/*` (shell mission = `MissionNavBar` compact).

---

## 7. Nodes

États mission : completed (teal) · available/current (teal fort) · locked (slate) · boss (or).

Skill tree : diamonds / facettes ; unlock = mission prouvée (pas de mastery points V1).

---

## 8. Interdits

1. Hex hors tokens  
2. Contenu pédagogique inventé depuis Stitch  
3. École / académie en wording public  
4. Glow teal décoratif permanent / or partout  
5. WebGL / particles / Material Symbols CDN  
6. Fausses stats profile / leaderboard  

---

## 9. Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/app/globals.css` | Tokens + atmosphere |
| `src/components/ui/BrandLogo.tsx` | Marque |
| `src/components/ui/SiteHeader.tsx` | Nav globale |
| `docs/UI_ARCHITECTURE.md` | Layouts & composants |
| `design-reference/stitch/` | Visuel only |
