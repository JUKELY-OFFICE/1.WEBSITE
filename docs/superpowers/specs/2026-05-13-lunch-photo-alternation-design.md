# Lunch Photo Alternation — Design Spec

**Date:** 2026-05-13
**Scope:** Écran TV lunch (lundi–vendredi) + nouvelle page `lunch_photo` dans le dashboard

---

## Objectif

Pendant les heures de déjeuner en semaine, l'écran TV alterne automatiquement entre le menu du jour et un écran de photos. Le gérant peut gérer ces photos depuis le dashboard, exactement comme pour Lunch WE et Apéro.

---

## Timing

| Phase | Durée |
|---|---|
| Menu affiché | 5 minutes |
| Photos affichées | 2 minutes |
| Retour menu | 5 minutes |
| … | … |

- L'alternance ne démarre que si au moins une photo est uploadée pour `lunch_photo`.
- Si aucune photo : le menu reste affiché en permanence (comportement actuel inchangé).
- Le cycle repart toujours du menu au début de la plage horaire lunch.

---

## Écran photo (`LunchPhotoScreen`)

### Layout

Composant standalone : `src/components/tv/LunchPhotoScreen.tsx`

```
┌─────────────────────────────────────────────────┐
│  Déjeuner          (bannière identique LunchScreen) │
│  — de 11h30 à 15h —                              │
│ ─────────────────────────────────────────────── │
│                                                   │
│  ┌─────────────────────────┐  ┌────────────────┐ │
│  │                         │  │                │ │
│  │    Photo principale     │  │    Photo 2     │ │
│  │       (2/3 width)       │  │                │ │
│  │                         │  ├────────────────┤ │
│  │                         │  │                │ │
│  │                         │  │    Photo 3     │ │
│  └─────────────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Bannière (copie exacte de `LunchScreen`)

- Fond : `MenuFrame theme="slate"` (identique à LunchScreen — `#1C1C1E`)
- Titre : `'Almond Butter', cursive`, `3.8vw`, couleur `#F2EDE4` (CHALK), `letterSpacing: "-0.04em"`
- Sous-titre : `var(--font-chalk), cursive`, `1.2vw`, `letterSpacing: "0.2em"`, couleur CHALK, `opacity: 0.45`
- Séparateur : `height: 1px`, `background: rgba(242,237,228,0.22)`, `margin: 1vh 0`

### Grille photos

- `display: grid`, `gridTemplateColumns: "2fr 1fr"`, `gap: "1.5%"`
- Colonne gauche : 1 grande photo (`border-radius: 8px`, `objectFit: "cover"`)
- Colonne droite : 2 petites photos empilées (`gridTemplateRows: "1fr 1fr"`, même gap)
- Si seulement 1 photo : colonne droite absente (photo grande pleine largeur)
- Si seulement 2 photos : colonne droite avec 1 seule photo (row entier)

### Cycle de photos

- Les photos sont affichées par **groupe de 3** (indices 0-1-2, puis 3-4-5, etc.)
- Chaque groupe est affiché **15 secondes** avec un fondu de 600ms entre groupes
- Après la dernière photo, retour au premier groupe (boucle)
- Props : `photos: Photo[]` (interface existante dans `useMenuData.ts`)

---

## Alternance dans `TVDisplay`

**Fichier :** `src/app/[locale]/TVDisplay/page.jsx`

Ajouter un état local :
```js
const [showLunchPhotos, setShowLunchPhotos] = useState(false)
```

`useEffect` déclenché quand `mode === 'lunch'` et `menu.lunchPhotos.length > 0` :
- Démarre le cycle : 5 min menu (`showLunchPhotos = false`) → 2 min photos (`showLunchPhotos = true`) → repeat
- Utilise `setInterval` avec alternance de timeouts
- Se nettoie (`clearInterval`/`clearTimeout`) quand `mode` change ou composant démonté
- Quand `mode !== 'lunch'` ou `menu.lunchPhotos.length === 0` : `showLunchPhotos = false`

Rendu dans le `switch(mode)` pour `"lunch"` :
```jsx
case "lunch":
  if (showLunchPhotos && menu.lunchPhotos.length > 0)
    return <LunchPhotoScreen photos={menu.lunchPhotos} />
  return <LunchScreen entree={...} plat={...} dessert={...} vins={...} showDice />
```

---

## Données — `useMenuData.ts`

Ajouter `lunchPhotos: Photo[]` dans `MenuData` et dans `EMPTY` :

```ts
lunchPhotos: (photoRows ?? [])
  .filter((r: any) => r.page === "lunch_photo")
  .map((r: any) => ({ id: r.id, url: r.url, sortOrder: r.sort_order })),
```

La requête Supabase existante (`wf_photos` filtrée sur `venue_id` + `active = true`) récupère déjà toutes les pages — il suffit d'ajouter le filtre `lunch_photo`.

---

## Dashboard — `WebFrontDashboard/page.jsx`

### Nouvelle page

Ajouter dans `PAGES` :
```js
{ id: 'lunch_photo', label: 'Lunch Photo' },
```

### Autoriser l'action "Photos carousel" pour `lunch_photo`

Modifier le filtre des actions :
```js
if (a.id === 'photos') return ['lunch_weekend', 'apero', 'lunch_photo'].includes(wizardPage);
```

### Sections

`lunch_photo` n'a pas d'éléments de menu (pas d'entrée/plat/dessert). Les actions `ajouter`, `modifier`, `supprimer`, `réordonner` ne s'appliquent pas. Seule l'action `photos` est disponible.

Modifier le filtre pour `lunch_photo` :
```js
if (wizardPage === 'lunch_photo') return a.id === 'photos';
```

---

## Composants modifiés / créés

| Composant | Action |
|---|---|
| `src/components/tv/LunchPhotoScreen.tsx` | **Créer** |
| `src/lib/tv/useMenuData.ts` | Ajouter `lunchPhotos` |
| `src/app/[locale]/TVDisplay/page.jsx` | Ajouter état + timer d'alternance |
| `src/app/[locale]/WebFrontDashboard/page.jsx` | Ajouter page + autoriser photos |

## Composants inchangés

- `LunchScreen.tsx` — aucune modification
- `scheduler.ts` — aucune modification
- `types/tv.ts` — aucune modification (ScreenMode reste le même)
