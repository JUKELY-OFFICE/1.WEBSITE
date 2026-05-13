# Lunch Photo Alternation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alterner automatiquement l'écran TV lunch entre le menu (5 min) et un écran de photos (2 min), avec une nouvelle page `lunch_photo` dans le dashboard pour gérer ces photos.

**Architecture:** Timer dans `TVDisplay` gérant l'état `showLunchPhotos`; nouveau composant `LunchPhotoScreen` avec bannière identique à `LunchScreen`; `useMenuData` expose `lunchPhotos`; dashboard étendu avec la page `lunch_photo`.

**Tech Stack:** React hooks (useState, useEffect), TypeScript, Supabase, inline styles (pattern existant)

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/lib/tv/useMenuData.ts` | Modifier — ajouter `lunchPhotos` |
| `src/components/tv/LunchPhotoScreen.tsx` | Créer |
| `src/app/[locale]/TVDisplay/page.jsx` | Modifier — timer + import + renderScreen |
| `src/app/[locale]/WebFrontDashboard/page.jsx` | Modifier — PAGES + filtre actions |

---

## Task 1 : Ajouter `lunchPhotos` dans `useMenuData.ts`

**Files:**
- Modify: `src/lib/tv/useMenuData.ts:35-50` (interface + EMPTY)
- Modify: `src/lib/tv/useMenuData.ts:101-106` (setData)

- [ ] **Étape 1 : Ajouter `lunchPhotos` à l'interface `MenuData` et à `EMPTY`**

Dans `src/lib/tv/useMenuData.ts`, remplacer (lignes 35-51) :

```ts
  lwPhotos:           Photo[]
  aperoPhotos:        Photo[]
  loading:            boolean
}

const VENUE_ID = "saint-placide"
const REFRESH_INTERVAL = 30_000

const EMPTY: MenuData = {
  breakfastFormulas: [], breakfastACarte: [], breakfastOeufs: [],
  lunchEntree: null, lunchPlat: null, lunchDessert: null, lunchVins: [],
  lwEntree: null, lwPlat: null, lwDessert: null, lwVins: [],
  hhCocktails: [], hhBieres: [], hhVins: [], hhTapasSignature: [], hhSpiritueux: [], hhMessageBas: null,
  aperoCocktails: [], aperoBieres: [], aperoVins: [], aperoTapasSignature: [], aperoSpiritueux: [], aperoMessageBas: null,
  lwPhotos: [],
  aperoPhotos: [],
  loading: true,
}
```

Par :

```ts
  lwPhotos:           Photo[]
  aperoPhotos:        Photo[]
  lunchPhotos:        Photo[]
  loading:            boolean
}

const VENUE_ID = "saint-placide"
const REFRESH_INTERVAL = 30_000

const EMPTY: MenuData = {
  breakfastFormulas: [], breakfastACarte: [], breakfastOeufs: [],
  lunchEntree: null, lunchPlat: null, lunchDessert: null, lunchVins: [],
  lwEntree: null, lwPlat: null, lwDessert: null, lwVins: [],
  hhCocktails: [], hhBieres: [], hhVins: [], hhTapasSignature: [], hhSpiritueux: [], hhMessageBas: null,
  aperoCocktails: [], aperoBieres: [], aperoVins: [], aperoTapasSignature: [], aperoSpiritueux: [], aperoMessageBas: null,
  lwPhotos: [],
  aperoPhotos: [],
  lunchPhotos: [],
  loading: true,
}
```

- [ ] **Étape 2 : Ajouter `lunchPhotos` dans `setData` de `fetchAll`**

Dans `setData({...})` (ligne ~101-107), remplacer :

```ts
      lwPhotos: (photoRows ?? []).filter((r: any) => r.page === "lunch_weekend").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      aperoPhotos: (photoRows ?? []).filter((r: any) => r.page === "apero").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      loading:           false,
```

Par :

```ts
      lwPhotos: (photoRows ?? []).filter((r: any) => r.page === "lunch_weekend").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      aperoPhotos: (photoRows ?? []).filter((r: any) => r.page === "apero").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      lunchPhotos: (photoRows ?? []).filter((r: any) => r.page === "lunch_photo").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      loading:           false,
```

- [ ] **Étape 3 : Vérifier le build TypeScript**

```bash
cd /Users/corentindesjars/Documents/code/5.JUKELY/new_website
npx tsc --noEmit 2>&1 | head -20
```

Attendu : aucune erreur sur `useMenuData.ts`.

- [ ] **Étape 4 : Commit**

```bash
git add src/lib/tv/useMenuData.ts
git commit -m "feat: add lunchPhotos to useMenuData"
git push
```

---

## Task 2 : Créer `LunchPhotoScreen.tsx`

**Files:**
- Create: `src/components/tv/LunchPhotoScreen.tsx`

- [ ] **Étape 1 : Créer le fichier**

Créer `src/components/tv/LunchPhotoScreen.tsx` avec ce contenu exact :

```tsx
import { useState, useEffect } from "react"
import MenuFrame from "./MenuFrame"
import type { Photo } from "@/lib/tv/useMenuData"

const CHALK      = "#F2EDE4"
const CHALK_LINE = "rgba(242,237,228,0.22)"
const FONT       = "var(--font-chalk), cursive"

interface Props {
  photos: Photo[]
}

export default function LunchPhotoScreen({ photos }: Props) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [visible, setVisible]   = useState(true)

  const totalSlides = Math.max(1, Math.ceil(photos.length / 3))

  useEffect(() => {
    if (photos.length <= 3) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % totalSlides)
        setVisible(true)
      }, 600)
    }, 15_000)
    return () => clearInterval(timer)
  }, [photos.length, totalSlides])

  const group = photos.slice(slideIdx * 3, slideIdx * 3 + 3)
  const [p1, p2, p3] = group

  return (
    <MenuFrame theme="slate">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Bannière — identique à LunchScreen */}
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Almond Butter', cursive",
              fontSize: "3.8vw", color: CHALK,
              lineHeight: 1.2, marginBottom: "0.3vh", letterSpacing: "-0.04em",
            }}>
              Déjeuner
            </h1>
            <p style={{
              fontFamily: FONT, fontSize: "1.2vw", letterSpacing: "0.2em",
              color: CHALK, opacity: 0.45,
            }}>
              — de 11h30 à 15h —
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height: "1px", background: CHALK_LINE, margin: "1vh 0" }} />

        {/* Grille photos */}
        <div style={{
          flex: 1, minHeight: 0,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease",
          display: "grid",
          gridTemplateColumns: p2 ? "2fr 1fr" : "1fr",
          gap: "1.5%",
        }}>
          {p1 && (
            <div style={{ borderRadius: "8px", overflow: "hidden", minHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p1.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
          {p2 && (
            <div style={{ display: "grid", gridTemplateRows: p3 ? "1fr 1fr" : "1fr", gap: "1.5%", minHeight: 0 }}>
              <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p2.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              {p3 && (
                <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p3.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </MenuFrame>
  )
}
```

- [ ] **Étape 2 : Vérifier le build TypeScript**

```bash
cd /Users/corentindesjars/Documents/code/5.JUKELY/new_website
npx tsc --noEmit 2>&1 | head -20
```

Attendu : aucune erreur sur `LunchPhotoScreen.tsx`.

- [ ] **Étape 3 : Commit**

```bash
git add src/components/tv/LunchPhotoScreen.tsx
git commit -m "feat: add LunchPhotoScreen component"
git push
```

---

## Task 3 : Mettre à jour `TVDisplay/page.jsx`

**Files:**
- Modify: `src/app/[locale]/TVDisplay/page.jsx`

- [ ] **Étape 1 : Mettre à jour les imports**

Remplacer (lignes 1-13) :

```jsx
'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useScheduler } from "@/lib/tv/useScheduler"
import { useMenuData } from "@/lib/tv/useMenuData"
import ClosedScreen from "@/components/tv/ClosedScreen"
import BreakfastScreenChalk from "@/components/tv/BreakfastScreenChalk"
import LunchScreen from "@/components/tv/LunchScreen"
import HappyHourScreen from "@/components/tv/HappyHourScreen"
```

Par :

```jsx
'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useScheduler } from "@/lib/tv/useScheduler"
import { useMenuData } from "@/lib/tv/useMenuData"
import ClosedScreen from "@/components/tv/ClosedScreen"
import BreakfastScreenChalk from "@/components/tv/BreakfastScreenChalk"
import LunchScreen from "@/components/tv/LunchScreen"
import LunchPhotoScreen from "@/components/tv/LunchPhotoScreen"
import HappyHourScreen from "@/components/tv/HappyHourScreen"
```

- [ ] **Étape 2 : Ajouter l'état et le timer d'alternance**

Après la ligne `const menu = useMenuData()` (ligne ~19), ajouter :

```jsx
  const [showLunchPhotos, setShowLunchPhotos] = useState(false)

  useEffect(() => {
    if (mode !== 'lunch' || menu.lunchPhotos.length === 0) {
      setShowLunchPhotos(false)
      return
    }
    const MENU_MS   = 5 * 60 * 1000
    const PHOTOS_MS = 2 * 60 * 1000
    let timeout
    const startCycle = () => {
      setShowLunchPhotos(false)
      timeout = setTimeout(() => {
        setShowLunchPhotos(true)
        timeout = setTimeout(startCycle, PHOTOS_MS)
      }, MENU_MS)
    }
    startCycle()
    return () => clearTimeout(timeout)
  }, [mode, menu.lunchPhotos.length])
```

- [ ] **Étape 3 : Mettre à jour `renderScreen` pour le cas `"lunch"`**

Remplacer (ligne ~56) :

```jsx
      case "lunch":         return <LunchScreen entree={menu.lunchEntree} plat={menu.lunchPlat} dessert={menu.lunchDessert} vins={menu.lunchVins} />
```

Par :

```jsx
      case "lunch":
        return showLunchPhotos && menu.lunchPhotos.length > 0
          ? <LunchPhotoScreen photos={menu.lunchPhotos} />
          : <LunchScreen entree={menu.lunchEntree} plat={menu.lunchPlat} dessert={menu.lunchDessert} vins={menu.lunchVins} />
```

- [ ] **Étape 4 : Vérifier le build TypeScript**

```bash
cd /Users/corentindesjars/Documents/code/5.JUKELY/new_website
npx tsc --noEmit 2>&1 | head -20
```

Attendu : aucune erreur.

- [ ] **Étape 5 : Vérification manuelle**

Ouvrir `http://localhost:3000/fr/TVDisplay?preview=lunch` — le menu lunch doit s'afficher normalement.

Pour tester l'alternance sans attendre 5 min, modifier temporairement `MENU_MS = 5_000` (5 secondes) dans le useEffect, vérifier que l'écran bascule vers `LunchPhotoScreen` après 5s (si des photos `lunch_photo` sont en base), puis remettre `5 * 60 * 1000`.

- [ ] **Étape 6 : Commit**

```bash
git add "src/app/[locale]/TVDisplay/page.jsx"
git commit -m "feat: alternate lunch screen with photos every 5/2 min"
git push
```

---

## Task 4 : Mettre à jour le dashboard (`WebFrontDashboard/page.jsx`)

**Files:**
- Modify: `src/app/[locale]/WebFrontDashboard/page.jsx:14-20` (PAGES)
- Modify: `src/app/[locale]/WebFrontDashboard/page.jsx:576-579` (filtre actions)

- [ ] **Étape 1 : Ajouter `lunch_photo` dans `PAGES`**

Remplacer (lignes 14-20) :

```js
const PAGES = [
  { id: 'breakfast',     label: 'Breakfast' },
  { id: 'lunch',         label: 'Lunch' },
  { id: 'lunch_weekend', label: 'Lunch (week-end)' },
  { id: 'happy_hour',    label: 'Happy Hour' },
  { id: 'apero',         label: 'Apéro (week-end)' },
];
```

Par :

```js
const PAGES = [
  { id: 'breakfast',     label: 'Breakfast' },
  { id: 'lunch',         label: 'Lunch' },
  { id: 'lunch_weekend', label: 'Lunch (week-end)' },
  { id: 'lunch_photo',   label: 'Lunch Photo' },
  { id: 'happy_hour',    label: 'Happy Hour' },
  { id: 'apero',         label: 'Apéro (week-end)' },
];
```

- [ ] **Étape 2 : Mettre à jour le filtre des actions**

Remplacer (lignes 576-580) :

```js
              {ACTIONS.filter(a => {
                if (a.id === 'photos') return wizardPage === 'lunch_weekend' || wizardPage === 'apero';
                if (wizardPage === 'lunch') return a.id === 'modifier' || a.id === 'ajouter' || a.id === 'supprimer';
                return a.id !== 'photos';
              }).map(a => (
```

Par :

```js
              {ACTIONS.filter(a => {
                if (a.id === 'photos') return ['lunch_weekend', 'apero', 'lunch_photo'].includes(wizardPage);
                if (wizardPage === 'lunch_photo') return false;
                if (wizardPage === 'lunch') return a.id === 'modifier' || a.id === 'ajouter' || a.id === 'supprimer';
                return a.id !== 'photos';
              }).map(a => (
```

> Note : `if (wizardPage === 'lunch_photo') return false` masque toutes les actions sauf `photos` (qui est déjà autorisée par la ligne du dessus). Cela garantit que seule l'action "Photos carousel" apparaît pour `lunch_photo`.

- [ ] **Étape 3 : Vérification manuelle dans le dashboard**

1. Ouvrir le dashboard → sélectionner "Lunch Photo"
2. ✅ Seule l'action "Photos carousel" apparaît
3. Uploader une photo de test
4. ✅ La photo apparaît dans la bibliothèque avec `page = "lunch_photo"`

- [ ] **Étape 4 : Commit**

```bash
git add "src/app/[locale]/WebFrontDashboard/page.jsx"
git commit -m "feat: add lunch_photo page to dashboard"
git push
```
