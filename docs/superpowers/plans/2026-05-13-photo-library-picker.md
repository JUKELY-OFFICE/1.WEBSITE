# Photo Library Picker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher une bibliothèque de photos dans le dashboard pour sélectionner des photos déjà uploadées sans passer par l'explorateur de fichiers.

**Architecture:** Un seul fichier modifié (`WebFrontDashboard/page.jsx`) — on change 4 fonctions et on réécrit le bloc JSX `wizardAction === 'photos'`. Les photos inactives sont conservées en DB avec `active = false` et `sort_order = null`. `useMenuData.ts` filtre déjà sur `active = true` : les écrans TV ne changent pas.

**Tech Stack:** Next.js (App Router), React hooks, Supabase JS client, inline styles (pattern du fichier existant)

---

## Fichiers touchés

| Fichier | Rôle |
|---|---|
| `src/app/[locale]/WebFrontDashboard/page.jsx` | Toutes les modifications — handlers + render |
| `src/lib/tv/useMenuData.ts` | Vérification uniquement — déjà correct, pas de changement |

---

## Task 1 : Vérifier que `useMenuData.ts` filtre sur `active = true`

**Files:**
- Read: `src/lib/tv/useMenuData.ts:60`

- [ ] **Étape 1 : Vérifier la requête photos**

Ouvrir `src/lib/tv/useMenuData.ts` ligne 60. Elle doit contenir `.eq('active', true)` :

```ts
supabase.from("wf_photos").select("*").eq("venue_id", VENUE_ID).eq("active", true).order("sort_order"),
```

✅ Déjà présent — aucune modification nécessaire. Les photos inactives n'apparaîtront jamais sur les écrans TV.

---

## Task 2 : Mettre à jour `fetchPhotos` pour récupérer toutes les photos (actives + inactives)

**Files:**
- Modify: `src/app/[locale]/WebFrontDashboard/page.jsx:227-231`

- [ ] **Étape 1 : Retirer le filtre `active` dans `fetchPhotos`**

Remplacer (ligne ~227) :

```js
const fetchPhotos = async (page) => {
  const { data } = await supabase.from('wf_photos').select('*')
    .eq('venue_id', venueId).eq('page', page).eq('active', true).order('sort_order');
  setPhotos(data ?? []);
};
```

Par :

```js
const fetchPhotos = async (page) => {
  const { data } = await supabase.from('wf_photos').select('*')
    .eq('venue_id', venueId).eq('page', page).order('sort_order');
  setPhotos(data ?? []);
};
```

- [ ] **Étape 2 : Vérifier manuellement**

Dans le dashboard, naviguer vers une page avec photos (Lunch WE ou Apéro) → action "Photos carousel". Ouvrir la console réseau et vérifier que la requête Supabase ne contient plus `active=eq.true`.

---

## Task 3 : Remplacer `handlePhotoDelete` par `handlePhotoDeactivate` + ajouter `handlePhotoActivate` + corriger `handlePhotoUpload` et `handlePhotoReorder`

**Files:**
- Modify: `src/app/[locale]/WebFrontDashboard/page.jsx:233-269`

- [ ] **Étape 1 : Remplacer `handlePhotoDelete` par `handlePhotoDeactivate`**

Remplacer (ligne ~255) :

```js
const handlePhotoDelete = async (photo) => {
  const { error } = await supabase.from('wf_photos').delete().eq('id', photo.id);
  if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
  else { setStatus({ ok: true, text: 'Photo supprimée.' }); fetchPhotos(wizardPage); refreshPreview(); }
};
```

Par :

```js
const handlePhotoDeactivate = async (photo) => {
  const { error } = await supabase.from('wf_photos').update({ active: false, sort_order: null }).eq('id', photo.id);
  if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
  else { setStatus({ ok: true, text: 'Photo retirée du carousel.' }); fetchPhotos(wizardPage); refreshPreview(); }
};
```

- [ ] **Étape 2 : Ajouter `handlePhotoActivate` juste après `handlePhotoDeactivate`**

```js
const handlePhotoActivate = async (photo) => {
  const nextSortOrder = photos.filter(p => p.active).length + 1;
  const { error } = await supabase.from('wf_photos').update({ active: true, sort_order: nextSortOrder }).eq('id', photo.id);
  if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
  else { setStatus({ ok: true, text: 'Photo ajoutée au carousel.' }); fetchPhotos(wizardPage); refreshPreview(); }
};
```

- [ ] **Étape 3 : Corriger `handlePhotoReorder` pour travailler sur les photos actives uniquement**

Remplacer (ligne ~261) :

```js
const handlePhotoReorder = async (idx, direction) => {
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= photos.length) return;
  const next = [...photos];
  [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  setPhotos(next);
  await Promise.all(next.map((p, i) => supabase.from('wf_photos').update({ sort_order: i + 1 }).eq('id', p.id)));
  refreshPreview();
};
```

Par :

```js
const handlePhotoReorder = async (idx, direction) => {
  const activePhotos = photos.filter(p => p.active).sort((a, b) => a.sort_order - b.sort_order);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= activePhotos.length) return;
  const next = [...activePhotos];
  [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  await Promise.all(next.map((p, i) => supabase.from('wf_photos').update({ sort_order: i + 1 }).eq('id', p.id)));
  fetchPhotos(wizardPage);
  refreshPreview();
};
```

- [ ] **Étape 4 : Corriger `handlePhotoUpload` — sort_order et active explicites**

Dans `handlePhotoUpload` (ligne ~246), remplacer le bloc d'insert :

```js
const { error: insertError } = await supabase.from('wf_photos').insert({
  venue_id: venueId, page: wizardPage, url: publicUrl, sort_order: photos.length + 1,
});
```

Par :

```js
const { error: insertError } = await supabase.from('wf_photos').insert({
  venue_id: venueId, page: wizardPage, url: publicUrl,
  active: true, sort_order: photos.filter(p => p.active).length + 1,
});
```

---

## Task 4 : Réécrire le bloc JSX `wizardAction === 'photos'` (lignes 664–722)

**Files:**
- Modify: `src/app/[locale]/WebFrontDashboard/page.jsx:664-722`

- [ ] **Étape 1 : Remplacer le bloc entier**

Remplacer tout le bloc `{wizardAction === 'photos' && ( ... )}` (lignes 664–722 incluses) par :

```jsx
{/* Étape photos */}
{wizardAction === 'photos' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

    {/* Section 1 — Carousel actif */}
    <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      Carousel actif ({photos.filter(p => p.active).length})
    </p>

    {photos.filter(p => p.active).length === 0 ? (
      <p style={{ color: BRUME, fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
        Aucune photo active.
      </p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {photos.filter(p => p.active).sort((a, b) => a.sort_order - b.sort_order).map((photo, idx, arr) => (
          <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem', borderRadius: '8px', border: `1px solid ${BORDER}`,
            background: 'rgba(15,39,72,0.4)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ color: CRAIE, fontSize: '0.75rem', fontFamily: 'var(--font-display)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Photo {idx + 1}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <button onClick={() => handlePhotoReorder(idx, 'up')} disabled={idx === 0}
                style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(148,165,188,0.3)' : BRUME,
                  cursor: idx === 0 ? 'default' : 'pointer', fontSize: '0.7rem', lineHeight: 1 }}>▲</button>
              <button onClick={() => handlePhotoReorder(idx, 'down')} disabled={idx === arr.length - 1}
                style={{ background: 'none', border: 'none', color: idx === arr.length - 1 ? 'rgba(148,165,188,0.3)' : BRUME,
                  cursor: idx === arr.length - 1 ? 'default' : 'pointer', fontSize: '0.7rem', lineHeight: 1 }}>▼</button>
            </div>
            <button onClick={() => handlePhotoDeactivate(photo)}
              style={{ background: 'none', border: 'none', color: BRIQUE, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}>
              ×
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Séparateur */}
    <div style={{ borderTop: `1px solid ${BORDER}`, margin: '0.25rem 0' }} />

    {/* Section 2 — Bibliothèque */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Bibliothèque ({photos.length})
      </p>
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading}
          style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', border: 'none', background: NUIT,
            color: CRAIE, fontSize: '0.75rem', cursor: photoUploading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-display)', opacity: photoUploading ? 0.6 : 1 }}>
          {photoUploading ? '…' : '+ Uploader'}
        </button>
      </div>
    </div>

    {photos.length === 0 ? (
      <p style={{ color: BRUME, fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
        Aucune photo. Uploadez-en une.
      </p>
    ) : (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {photos.map(photo => (
            <div key={photo.id}
              style={{ position: 'relative', opacity: photo.active ? 0.35 : 1, cursor: photo.active ? 'default' : 'pointer' }}
              onClick={() => !photo.active && handlePhotoActivate(photo)}
              title={photo.active ? 'Déjà dans le carousel' : 'Cliquer pour ajouter au carousel'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover',
                borderRadius: '6px', border: `2px solid ${photo.active ? '#22c55e' : 'transparent'}`, display: 'block' }} />
              {photo.active ? (
                <div style={{ position: 'absolute', top: '3px', right: '3px', background: '#22c55e', borderRadius: '50%',
                  width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: 'white' }}>✓</div>
              ) : (
                <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: NUIT, borderRadius: '50%',
                  width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: CRAIE }}>+</div>
              )}
            </div>
          ))}
        </div>
        <p style={{ color: BRUME, fontSize: '0.68rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          ✓ = dans le carousel · cliquer une photo pour l'ajouter
        </p>
      </>
    )}

    <button type="button" onClick={resetWizard}
      style={{ background: 'none', border: 'none', color: BRUME, fontSize: '0.8rem',
        cursor: 'pointer', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <ChevronLeft size={13} /> Retour
    </button>
  </div>
)}
```

- [ ] **Étape 2 : Vérification — démarrer le serveur de dev**

```bash
cd /Users/corentindesjars/Documents/code/5.JUKELY/new_website
npm run dev
```

- [ ] **Étape 3 : Scénario 1 — Retirer une photo du carousel**

1. Dashboard → Lunch WE → Photos carousel
2. Cliquer × sur une photo active
3. ✅ La photo disparaît du "Carousel actif"
4. ✅ Elle réapparaît dans la bibliothèque sans badge vert (non grisée, cliquable)

- [ ] **Étape 4 : Scénario 2 — Ajouter une photo depuis la bibliothèque**

1. Cliquer sur une photo dans la bibliothèque (badge +)
2. ✅ La photo passe en "Carousel actif"
3. ✅ Dans la bibliothèque, elle est maintenant grisée avec badge ✓

- [ ] **Étape 5 : Scénario 3 — Upload d'une nouvelle photo**

1. Cliquer "+ Uploader" dans la bibliothèque
2. Choisir une image depuis l'ordinateur
3. ✅ La photo apparaît dans le carousel actif
4. ✅ Elle apparaît aussi dans la bibliothèque (grisée car active)

- [ ] **Étape 6 : Scénario 4 — Vérifier l'écran TV**

Aller sur `/fr/TVDisplay` et passer en mode `lunch_weekend`
✅ Seules les photos actives s'affichent dans le carousel TV
