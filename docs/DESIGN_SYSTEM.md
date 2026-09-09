# MLINI Design System — Arcane Academy

> Toute nouvelle interface MLINI doit utiliser les design tokens existants avant de créer de nouvelles valeurs arbitraires.

Thème par défaut : **Arcane Academy** (`data-theme="arcane-academy"`).  
Alias conservé : `arcane-tech` (mêmes tokens).

---

## 1. Philosophie

MLINI = **école technique de l’IA déguisée en RPG**.

### Split fondamental

| Couche | Feeling |
|--------|---------|
| **Learning UI** (missions, brief, playground) | Calme, lisible, confortable, moderne |
| **Meta progression** (`/skills` skill tree) | Plus riche — réseau de connaissances, teal de progression |
| **Atmosphere** | Texture minérale (`/images/background-1.jpg`) — ~15–25% visible sous wash `--ml-bg-0` (~80%). Classes `.ml-atmosphere*` dans `globals.css` via `SiteAtmosphere`. |
| **Rewards / Boss** | Prestige rare (bronze) |

**Pas :** terminal militaire, cockpit sci-fi, cyberpunk, Matrix, fantasy médiévale lourde, dashboard SaaS violet.

Références mentales :
- Boot.dev → confort, densité, workspace
- Path of Exile → profondeur & prestige **futurs** (nodes, frames, rewards)
- Identité originale MLINI

Priorité des décisions :

1. Lisibilité  
2. Ergonomie  
3. Concentration  
4. Identité  
5. Game feel  
6. Décoration  

---

## 2. Typographie

### Polices

| Rôle | Police | Usage |
|------|--------|-------|
| Corps / UI | **Source Sans 3** (`--font-body`) | Brief, assignment, playground, navigation |
| Prestige | **Source Serif 4** (`--font-display`) | Titres de mission, Royaume, Boss, rewards |
| Technique | **JetBrains Mono** (`--font-mono`) | Code, tests values, XP, badges catégories |

### Échelle desktop (cibles)

| Token | Taille | Usage |
|-------|--------|-------|
| `--ml-text-base` | **17px** | Body pédagogique |
| `--ml-text-md` | 15px | Secondaire confortable |
| `--ml-text-sm` | 14px | Labels humains |
| `--ml-text-xs` | **13px min** | HUD rare (jamais 9–10px utile) |
| `--ml-text-lg` | 18px | Sous-titres |
| `--ml-text-xl` | 20px | Assignment |
| `--ml-text-2xl` | ~28px | Titre mission |
| `--ml-leading-body` | **1.65** | Lecture longue |

### Règles

- **Monospace rare** — code, valeurs, XP, états techniques uniquement.
- **Majuscules + tracking** — très limités. Préférer « Mission 01 », « Message client ».
- Helpers : `.ml-section-label` (humain), `.ml-hud` (rare mono).

---

## 3. Palette (expérience Arcane Academy)

Source de vérité : `src/app/globals.css` (`:root` / `[data-theme="arcane-academy"]`).

### Core

| Rôle | Hex | Token |
|------|-----|-------|
| Background | `#09131D` | `--ml-bg-0` / `--color-bg` |
| Text (ivoire) | `#EEE8DA` | `--ml-text` / `--color-text` |
| Primary (teal) | `#42BDB1` | `--ml-accent` / `--color-primary` |
| Secondary | `#607B92` | `--ml-secondary` / `--color-secondary` |
| Accent prestige | `#CFA552` | `--ml-reward` / `--color-accent` |

### Surfaces & texte

| Token | Approx | Rôle |
|-------|--------|------|
| `--ml-surface-1` | `#101D29` | Panels |
| `--ml-surface-2` | `#152433` | Panels élevés |
| `--ml-text-body` | `#B8B5AA` | Corps pédagogique |
| `--ml-text-muted` | `#7F8C96` | Labels |
| `--ml-border` | `#263A4C` | Bordures |
| `--ml-border-strong` | `#3B596B` | Hover / actif |

### Usage

- **Teal** : RUN, focus, nodes unlocked, connexions completed — pas partout.
- **Gold** : XP, boss, milestones majeurs — rare.
- **Secondary** : boutons secondaires, borders support, nodes available.
- Body text reste ivoire / warm grey — **jamais** blanc pur.

---

## 4. Hiérarchie Learning vs Prestige

```
LEARNING UI     = sobre, neutre, lisible
META PROGRESSION = plus riche (futur)
REWARDS / BOSS  = prestigieux (bronze, frames)
```

Mission 1 normale = confort.  
Le « Path of Exile feel » arrive surtout sur skill tree, frames cosmétiques, Boss, certifications.

---

## 5. Borders & frames

| Niveau | Traitement |
|--------|------------|
| Normal | `--ml-border` discret |
| Important | `--ml-border-strong` |
| Prestige | `--ml-frame-boss` / bronze |

`.ml-frame` = coins subtils (hook cosmétique).  
`.ml-assignment` = bloc Assignment clairement séparé.

---

## 6. Nodes (fondation skill tree)

Tokens : `--ml-node-*`, `--ml-connection-*`  
Composant : `ProgressNode`  
Pas de skill tree complet pour l’instant.

---

## 7. Mission shell (inchangé structurellement)

Desktop : brief gauche (scroll interne) · playground droite (toujours visible).  
Pas de scroll global de page.  
Lisibilité > densifier artificiellement la typo.

---

## 8. Pipeline

`Message → Instruction → Model → Output`

Idle calme · Running teal · Success / Fail discrets.  
Pas de HUD militaire (éviter ALL CAPS mono partout).

---

## 9. Interdits

1. Hex arbitraires → tokens `--ml-*` d’abord  
2. Look sci-fi / cockpit / neon Matrix  
3. Purple SaaS gradients  
4. Glow teal décoratif permanent  
5. Or partout  
6. 9–11px pour du contenu utile  
7. Monospace + uppercase sur tout le brief  
8. Casser le contraste avec un futur skin  

---

## 10. Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/components/ui/SiteAtmosphere.tsx` | Texture ardoise + wash Arcane Academy |
| `src/app/globals.css` | Tokens Arcane Academy + `.ml-atmosphere*` |
| `src/app/layout.tsx` | Fonts + `data-theme` |
| `src/components/mission/*` | Brief / playground |
| `src/components/skills/*` | Skill tree meta-progression |
| `src/data/skills/tree.ts` | Registry des compétences |
| `docs/design/` | Produit, UX mission, pédagogie |
| `docs/SKILL_TREE.md` | Modèle & règles unlock |
| `docs/QOL.md` | Navigation, drafts, erreurs |
