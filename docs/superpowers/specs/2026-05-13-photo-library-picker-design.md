# Photo Library Picker — Design Spec

**Date:** 2026-05-13
**Scope:** WebFrontDashboard — panneau "Photos carousel" pour les pages `lunch_weekend` et `apero`

---

## Problème

Aujourd'hui, pour ajouter une photo au carousel TV, l'utilisateur doit naviguer dans l'explorateur de fichiers de son ordinateur à chaque fois. Les photos déjà uploadées dans Supabase ne sont pas visibles dans le dashboard — impossible de les réutiliser sans re-uploader.

## Objectif

Afficher une bibliothèque de toutes les photos déjà uploadées pour une page, directement dans le dashboard, pour pouvoir sélectionner et réutiliser des photos sans passer par l'explorateur de fichiers.

---

## Contraintes

- Les bibliothèques sont **séparées par page** : les photos de `lunch_weekend` ne s'affichent pas dans la section `apero` et vice versa.
- Retirer une photo du carousel ne la supprime pas : elle reste dans la bibliothèque.
- Le bouton "Uploader" reste disponible pour ajouter de nouvelles photos.

---

## Modèle de données

La table `wf_photos` possède déjà un champ `active` (boolean). Le comportement change :

| Action | Avant | Après |
|---|---|---|
| Retirer du carousel | DELETE de `wf_photos` | `active = false` (reste en bibliothèque) |
| Ajouter depuis la biblio | — (impossible) | `active = true`, `sort_order` = dernier + 1 |
| Uploader une nouvelle photo | INSERT `active = true` | Inchangé — INSERT `active = true` |

Les photos en bibliothèque = toutes les lignes `wf_photos` de la page, actives ou non.

---

## Interface

Le panneau "Photos carousel" est remplacé par deux sections :

### Section 1 — Carousel actif

- Liste verticale des photos avec `active = true`, triées par `sort_order`
- Chaque ligne : thumbnail 52×52 · nom du fichier · boutons ↑ ↓ × 
- ↑ / ↓ : réordonnent (`sort_order`) — comportement identique à aujourd'hui
- × : met `active = false`, `sort_order = null` — la photo disparaît du carousel et réapparaît dans la bibliothèque

### Section 2 — Bibliothèque

- Grille 4 colonnes, toutes les photos de la page (actives + inactives)
- Photos déjà actives : grisées (opacity 0.35) + badge ✓ vert — non cliquables
- Photos inactives : plein opacity + badge "+" bleu marine — cliquer → `active = true`, ajoutée en dernière position du carousel
- Bouton "Uploader" en haut à droite : ouvre le file picker comme aujourd'hui, upload vers Supabase storage + INSERT dans `wf_photos` avec `active = true`

---

## Comportement lors de l'upload

Inchangé fonctionnellement : la photo est uploadée dans le bucket `photos` de Supabase et un record est inséré dans `wf_photos` avec `active = true`. Elle apparaît immédiatement dans le carousel actif ET dans la bibliothèque (grisée car déjà active).

---

## Composants à modifier

- `WebFrontDashboard/page.jsx` — logique `handlePhotoDelete` → remplacer DELETE par `UPDATE active = false`; ajouter `handlePhotoActivate(id)` pour activer depuis la bibliothèque; `fetchPhotos` récupère toutes les photos (actives et inactives)
- Le rendu du panneau photos (actuellement lignes 665–722) — remplacer par les deux sections décrites ci-dessus

## Composants inchangés

- `useMenuData.ts` — vérifier qu'il filtre bien sur `active = true` (ou ajouter le filtre si absent) pour que les photos inactives n'apparaissent pas sur les écrans TV
- `LunchScreen.tsx` / `HappyHourScreen.tsx` — aucune modification
- Supabase storage — aucune modification
