'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tv, RefreshCw, Maximize2, Minimize2, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { getCurrentMode } from '@/lib/tv/scheduler';
import { useMenuData } from '@/lib/tv/useMenuData';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGES = [
  { id: 'breakfast',     label: 'Breakfast' },
  { id: 'lunch',         label: 'Lunch' },
  { id: 'lunch_weekend', label: 'Lunch (week-end)' },
  { id: 'happy_hour',    label: 'Happy Hour' },
  { id: 'apero',         label: 'Apéro (week-end)' },
];

const ACTIONS = [
  { id: 'ajouter',    label: 'Ajouter' },
  { id: 'modifier',   label: 'Modifier' },
  { id: 'supprimer',  label: 'Supprimer' },
  { id: 'réordonner', label: 'Réordonner' },
  { id: 'photos',     label: 'Photos carousel' },
];

const PAGE_SECTIONS = {
  breakfast: [
    { id: 'formules',   label: 'Formules',   dbCategory: 'wf_breakfast_formulas',           addCategory: 'breakfast_formula',     itemType: null,       canAdd: true  },
    { id: 'a_la_carte', label: 'À la carte', dbCategory: 'breakfast_item',                  addCategory: 'breakfast_item',        itemType: 'food',     canAdd: true  },
    { id: 'oeufs',      label: 'Les Œufs',   dbCategory: 'breakfast_item (type: egg)',       addCategory: 'breakfast_item',        itemType: 'food',     canAdd: true  },
  ],
  lunch: [
    { id: 'entree',  label: "Entrée du jour",  dbCategory: 'lunch/entree',  addCategory: 'lunch_entree',  itemType: 'food', canAdd: true },
    { id: 'plat',    label: 'Plat du jour',    dbCategory: 'lunch/plat',    addCategory: 'lunch_plat',    itemType: 'food', canAdd: true },
    { id: 'dessert', label: 'Dessert du jour', dbCategory: 'lunch/dessert', addCategory: 'lunch_dessert', itemType: 'food', canAdd: true },
    { id: 'vin',     label: 'Vin du jour',     dbCategory: 'lunch/vin',     addCategory: 'lunch_vin',     itemType: 'food', canAdd: true },
  ],
  happy_hour: [
    { id: 'cocktails',       label: 'Cocktails',  dbCategory: 'happy_hour/cocktails',       addCategory: 'happy_hour_cocktail',   itemType: 'cocktail', canAdd: true },
    { id: 'bieres',          label: 'Bières',     dbCategory: 'happy_hour/bieres',          addCategory: 'happy_hour_beer',       itemType: 'beer',     canAdd: true },
    { id: 'vins',            label: 'Vins',       dbCategory: 'happy_hour/vins',            addCategory: 'happy_hour_vin',        itemType: 'food',     canAdd: true },
    { id: 'tapas_signature', label: 'Nos vins du moment', dbCategory: 'happy_hour/tapas_signature', addCategory: 'happy_hour_tapas',        itemType: 'food',     canAdd: true },
    { id: 'spiritueux',      label: 'Spiritueux',        dbCategory: 'happy_hour/spiritueux',      addCategory: 'happy_hour_spiritueux',   itemType: 'cocktail', canAdd: true },
    { id: 'message_bas',     label: 'Message du bas',   dbCategory: 'happy_hour/message_bas',     addCategory: 'happy_hour_message_bas',  itemType: null,       canAdd: true },
  ],
  lunch_weekend: [
    { id: 'entree',  label: "Entrée du jour",  dbCategory: 'lunch_weekend/entree',  addCategory: 'lunch_weekend_entree',  itemType: 'food', canAdd: true },
    { id: 'plat',    label: 'Plat du jour',    dbCategory: 'lunch_weekend/plat',    addCategory: 'lunch_weekend_plat',    itemType: 'food', canAdd: true },
    { id: 'dessert', label: 'Dessert du jour', dbCategory: 'lunch_weekend/dessert', addCategory: 'lunch_weekend_dessert', itemType: 'food', canAdd: true },
    { id: 'vin',     label: 'Vin du jour',     dbCategory: 'lunch_weekend/vin',     addCategory: 'lunch_weekend_vin',     itemType: 'food', canAdd: true },
  ],
  apero: [
    { id: 'cocktails',       label: 'Cocktails',          dbCategory: 'apero/cocktails',       addCategory: 'apero_cocktail',   itemType: 'cocktail', canAdd: true },
    { id: 'bieres',          label: 'Bières',             dbCategory: 'apero/bieres',          addCategory: 'apero_beer',       itemType: 'beer',     canAdd: true },
    { id: 'vins',            label: 'Vins',               dbCategory: 'apero/vins',            addCategory: 'apero_vin',        itemType: 'food',     canAdd: true },
    { id: 'tapas_signature', label: 'Nos vins du moment', dbCategory: 'apero/tapas_signature', addCategory: 'apero_tapas',      itemType: 'food',     canAdd: true },
    { id: 'spiritueux',      label: 'Spiritueux',         dbCategory: 'apero/spiritueux',      addCategory: 'apero_spiritueux', itemType: 'cocktail', canAdd: true },
    { id: 'message_bas',     label: 'Message du bas',     dbCategory: 'apero/message_bas',     addCategory: 'apero_message_bas',itemType: null,       canAdd: true },
  ],
};

function getItemsForSection(menuData, pageId, sectionId) {
  if (pageId === 'breakfast') {
    if (sectionId === 'formules')   return menuData.breakfastFormulas;
    if (sectionId === 'a_la_carte') return menuData.breakfastACarte;
    if (sectionId === 'oeufs')      return menuData.breakfastOeufs;
  }
  if (pageId === 'lunch') {
    if (sectionId === 'vin') return menuData.lunchVins;
    const item = sectionId === 'entree'  ? menuData.lunchEntree
               : sectionId === 'plat'    ? menuData.lunchPlat
               : sectionId === 'dessert' ? menuData.lunchDessert
               : null;
    return item ? [item] : [];
  }
  if (pageId === 'lunch_weekend') {
    if (sectionId === 'vin') return menuData.lwVins;
    const item = sectionId === 'entree'  ? menuData.lwEntree
               : sectionId === 'plat'    ? menuData.lwPlat
               : sectionId === 'dessert' ? menuData.lwDessert
               : null;
    return item ? [item] : [];
  }
  if (pageId === 'happy_hour') {
    if (sectionId === 'cocktails')        return menuData.hhCocktails;
    if (sectionId === 'bieres')           return menuData.hhBieres;
    if (sectionId === 'vins')             return menuData.hhVins;
    if (sectionId === 'tapas_signature')  return menuData.hhTapasSignature;
    if (sectionId === 'vins_du_moment')   return menuData.hhVinsDuMoment;
    if (sectionId === 'spiritueux')       return menuData.hhSpiritueux;
    if (sectionId === 'message_bas')      return menuData.hhMessageBas ? [menuData.hhMessageBas] : [];
  }
  if (pageId === 'apero') {
    if (sectionId === 'cocktails')        return menuData.aperoCocktails;
    if (sectionId === 'bieres')           return menuData.aperoBieres;
    if (sectionId === 'vins')             return menuData.aperoVins;
    if (sectionId === 'tapas_signature')  return menuData.aperoTapasSignature;
    if (sectionId === 'spiritueux')       return menuData.aperoSpiritueux;
    if (sectionId === 'message_bas')      return menuData.aperoMessageBas ? [menuData.aperoMessageBas] : [];
  }
  return [];
}

function priceToString(item) {
  return item?.prix != null ? `${item.prix}€` : '';
}

export default function WebFrontDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'fr';
  const menuData = useMenuData();

  const [venueId, setVenueId] = useState(null);
  const [venueName, setVenueName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(/** @type {{ok: boolean, text: string}|null} */ (null));
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState(/** @type {string} */ (getCurrentMode()));
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [wizardPage, setWizardPage] = useState(/** @type {string|null} */ (null));
  const [wizardAction, setWizardAction] = useState(/** @type {string|null} */ (null));
  const [wizardSection, setWizardSection] = useState(/** @type {string|null} */ (null));
  const [wizardElement, setWizardElement] = useState(/** @type {any|null} */ (null));
  const [selectedElements, setSelectedElements] = useState(/** @type {any[]} */ ([]));
  const [wizardFields, setWizardFields] = useState({ titre: '', description: '', prix: '' });
  const [reorderItems, setReorderItems] = useState(/** @type {any[]} */ ([]));
  const [photos, setPhotos] = useState(/** @type {any[]} */ ([]));
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  const previewRef = useRef(null);
  const inputRef   = useRef(null);

  // Get venue info on mount
  useEffect(() => {
    const getVenueInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${params.locale || 'fr'}/WebFrontLogin`);
        return;
      }

      const { data: wfUser, error: wfError } = await supabase
        .from('wf_users')
        .select('venue_id, venue_name')
        .eq('user_id', user.id)
        .single();

      if (wfError || !wfUser) {
        router.push(`/${params.locale || 'fr'}/WebFrontLogin`);
        return;
      }

      setVenueId(wfUser.venue_id);
      setVenueName(wfUser.venue_name);
    };

    getVenueInfo();
  }, [router]);

  const sections         = wizardPage ? (PAGE_SECTIONS[/** @type {keyof typeof PAGE_SECTIONS} */ (wizardPage)] ?? []) : [];
  const needsSectionStep = sections.length > 1;
  const sectionReady     = !!wizardAction && (!needsSectionStep || !!wizardSection);
  const effectiveSection = needsSectionStep ? sections.find(s => s.id === wizardSection) : (sections[0] ?? null);

  const showSectionStep   = !!wizardAction && needsSectionStep && !wizardSection;
  const isMessageBas      = effectiveSection?.id === 'message_bas';
  const showElementList   = sectionReady && (wizardAction === 'modifier' || wizardAction === 'supprimer') && !wizardElement && !isMessageBas;
  const showReorderList   = sectionReady && wizardAction === 'réordonner';
  const showFormStep      = sectionReady && (wizardAction === 'ajouter' || (wizardAction === 'modifier' && (!!wizardElement || isMessageBas)));

  const sectionItems = (showElementList || showReorderList) && wizardPage
    ? getItemsForSection(menuData, wizardPage, effectiveSection?.id ?? sections[0]?.id)
    : [];

  useEffect(() => {
    if (showReorderList && sectionItems.length > 0) {
      setReorderItems([...sectionItems]);
    }
  }, [showReorderList, wizardSection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  useEffect(() => {
    if (showFormStep && inputRef.current) inputRef.current.focus();
  }, [showFormStep]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) previewRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }, [isFullscreen]);

  useEffect(() => {
    const handleDashboardRefresh = () => setPreviewKey(k => k + 1);
    const handleDashboardFullscreen = () => toggleFullscreen();

    window.addEventListener('jukely-dashboard-refresh', handleDashboardRefresh);
    window.addEventListener('jukely-dashboard-toggle-fullscreen', handleDashboardFullscreen);

    return () => {
      window.removeEventListener('jukely-dashboard-refresh', handleDashboardRefresh);
      window.removeEventListener('jukely-dashboard-toggle-fullscreen', handleDashboardFullscreen);
    };
  }, [toggleFullscreen]);

  const resetWizard = () => {
    setWizardPage(null);
    setWizardAction(null);
    setWizardSection(null);
    setWizardElement(null);
    setSelectedElements([]);
    setWizardFields({ titre: '', description: '', prix: '' });
    setReorderItems([]);
    setPhotos([]);
  };

  const fetchPhotos = async (page) => {
    const { data } = await supabase.from('wf_photos').select('*')
      .eq('venue_id', venueId).eq('page', page).order('sort_order');
    setPhotos(data ?? []);
  };

  const compressImage = (file, maxPx = 1920, quality = 0.82) =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = url;
    });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !venueId) return;
    setPhotoUploading(true);
    setStatus(null);
    let baseOrder = photos.filter(p => p.active).length + 1;
    let errors = 0;
    for (const file of files) {
      const compressed = await compressImage(file);
      const path = `${wizardPage}_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, compressed, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (uploadError) { errors++; continue; }
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
      const { error: insertError } = await supabase.from('wf_photos').insert({
        venue_id: venueId, page: wizardPage, url: publicUrl,
        active: true, sort_order: baseOrder++,
      });
      if (insertError) errors++;
    }
    if (errors) setStatus({ ok: false, text: `${errors} photo(s) n'ont pas pu être uploadées.` });
    else setStatus({ ok: true, text: `${files.length} photo(s) ajoutée(s).` });
    fetchPhotos(wizardPage);
    refreshPreview();
    setPhotoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoDeactivate = async (photo) => {
    const { error } = await supabase.from('wf_photos').update({ active: false, sort_order: null }).eq('id', photo.id);
    if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
    else { setStatus({ ok: true, text: 'Photo retirée du carousel.' }); fetchPhotos(wizardPage); refreshPreview(); }
  };

  const handlePhotoDeletePermanent = async (photo) => {
    const storagePath = photo.url.split('/photos/')[1];
    if (storagePath) await supabase.storage.from('photos').remove([storagePath]);
    const { error } = await supabase.from('wf_photos').delete().eq('id', photo.id);
    if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
    else { setStatus({ ok: true, text: 'Photo supprimée.' }); fetchPhotos(wizardPage); refreshPreview(); }
  };

  const handlePhotoActivate = async (photo) => {
    const nextSortOrder = photos.filter(p => p.active).length + 1;
    const { error } = await supabase.from('wf_photos').update({ active: true, sort_order: nextSortOrder }).eq('id', photo.id);
    if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
    else { setStatus({ ok: true, text: 'Photo ajoutée au carousel.' }); fetchPhotos(wizardPage); refreshPreview(); }
  };

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

  const moveItem = (idx, direction) => {
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= reorderItems.length) return;
    const next = [...reorderItems];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setReorderItems(next);
  };

  const handleSaveOrder = async () => {
    if (loading || !venueId) return;
    setLoading(true);
    setStatus(null);
    const updates = reorderItems.map((item, idx) =>
      supabase.from('wf_display_items').update({ sort_order: idx + 1 }).eq('id', item.id)
    );
    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed) setStatus({ ok: false, text: `Erreur : ${failed.error.message}` });
    else { setStatus({ ok: true, text: 'Ordre enregistré.' }); resetWizard(); refreshPreview(); }
    setLoading(false);
  };

  const selectElement = (item) => {
    setWizardElement(item);
    setWizardFields({
      titre:       item.name ?? '',
      description: item.description ?? '',
      prix:        priceToString(item),
    });
  };

  const toggleElement = (item) => {
    setSelectedElements(prev =>
      prev.some(e => e.id === item.id)
        ? prev.filter(e => e.id !== item.id)
        : [...prev, item]
    );
  };

  const refreshPreview = () => {
    setTimeout(() => setPreviewKey(k => k + 1), 300);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedElements.length || loading) return;
    setLoading(true);
    setStatus(null);
    const ids = selectedElements.map(e => e.id);
    const { error } = await supabase
      .from('wf_display_items')
      .update({ active: false })
      .in('id', ids);
    if (error) {
      setStatus({ ok: false, text: `Erreur : ${error.message}` });
    } else {
      setStatus({ ok: true, text: `${ids.length} élément(s) supprimé(s).` });
      resetWizard();
      refreshPreview();
    }
    setLoading(false);
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    const isMessageBas = effectiveSection?.id === 'message_bas';
    if (!wizardFields.titre.trim() || (!isMessageBas && !wizardFields.prix.trim()) || loading || !venueId) return;
    const priceNum = isMessageBas ? 0 : parseFloat(wizardFields.prix.replace(',', '.').replace(/[^0-9.]/g, ''));
    if (!isMessageBas && isNaN(priceNum)) { setStatus({ ok: false, text: 'Prix invalide.' }); return; }
    setLoading(true);
    setStatus(null);

    if (wizardAction === 'ajouter') {
      // Pour les sections à item unique (lunch, sauf vin), désactiver l'existant d'abord
      if ((wizardPage === 'lunch' && effectiveSection?.id !== 'vin') ||
          (wizardPage === 'happy_hour' && effectiveSection?.id === 'message_bas')) {
        await supabase.from('wf_display_items')
          .update({ active: false })
          .eq('venue_id', venueId)
          .eq('page', wizardPage)
          .eq('section', effectiveSection?.id);
      }
      const { error } = await supabase.from('wf_display_items').insert({
        venue_id:    venueId,
        page:        wizardPage,
        section:     effectiveSection?.id,
        name:        wizardFields.titre.trim(),
        description: wizardFields.description.trim() || null,
        prix:        priceNum,
        active:      true,
        sort_order:  1,
      });
      if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
      else { setStatus({ ok: true, text: `"${wizardFields.titre.trim()}" ajouté.` }); resetWizard(); refreshPreview(); }

    } else {
      const { error } = await supabase
        .from('wf_display_items')
        .update({
          name:        wizardFields.titre.trim(),
          description: wizardFields.description.trim() || null,
          prix:        priceNum,
        })
        .eq('id', wizardElement.id);
      if (error) setStatus({ ok: false, text: `Erreur : ${error.message}` });
      else { setStatus({ ok: true, text: `"${wizardFields.titre.trim()}" mis à jour.` }); resetWizard(); refreshPreview(); }
    }
    setLoading(false);
  };

  const NUIT      = '#0F2748';
  const ARDOISE   = '#1E4976';
  const CRAIE     = '#FDFBF5';
  const MOUTARDE  = '#F4C542';
  const BRUME     = '#94A5BC';
  const BRIQUE    = '#E56A4E';
  const BORDER    = 'rgba(148,165,188,0.2)';
  const BORDER_HV = 'rgba(244,197,66,0.6)';

  const inputCls = {
    width: '100%', padding: '0.6rem 0.75rem',
    background: 'rgba(15,39,72,0.6)',
    border: `1px solid ${BORDER}`, borderRadius: '8px',
    color: CRAIE, fontSize: '0.875rem',
    fontFamily: 'var(--font-display)', outline: 'none',
  };

  const btnBase = {
    width: '100%', padding: '0.6rem',
    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.15s',
    fontFamily: 'var(--font-display)', border: 'none',
  };

  if (!venueId) {
    return (
      <div style={{ height: '100vh', background: NUIT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: BRUME, fontFamily: 'var(--font-display)' }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: NUIT, display: 'flex', overflow: 'hidden' }}>

      {/* ── Preview TV ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.75rem' }}>
        <div ref={previewRef} style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#000' }}>
          <iframe
            key={previewKey}
            src={isFullscreen ? `/${locale}/TVDisplay` : `/${locale}/TVDisplay?preview=${previewMode}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="TV Preview"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { id: 'breakfast',     label: 'Breakfast' },
            { id: 'lunch',         label: 'Lunch' },
            { id: 'lunch_weekend', label: 'Lunch WE' },
            { id: 'happy_hour',    label: 'Happy Hour' },
            { id: 'apero',         label: 'Apéro WE' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setPreviewMode(id); setPreviewKey(k => k + 1); }}
              style={{
                fontSize: '0.75rem', padding: '0.25rem 0.75rem',
                borderRadius: '9999px', border: `1px solid`,
                borderColor: previewMode === id ? MOUTARDE : BORDER,
                color: previewMode === id ? NUIT : BRUME,
                background: previewMode === id ? MOUTARDE : 'transparent',
                fontFamily: 'var(--font-display)', cursor: 'pointer',
                transition: 'all 0.15s', fontWeight: previewMode === id ? 700 : 400,
              }}
            >
              {label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
            <button onClick={() => { setPreviewKey(k => k + 1); }}
              style={{ background: 'rgba(148,165,188,0.1)', border: `1px solid ${BORDER}`, borderRadius: '8px',
                color: BRUME, cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Rafraîchir">
              <RefreshCw size={14} />
            </button>
            <button onClick={toggleFullscreen}
              style={{ background: 'rgba(148,165,188,0.1)', border: `1px solid ${BORDER}`, borderRadius: '8px',
                color: BRUME, cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Panneau modification ── */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${BORDER}`, background: ARDOISE }}>

        <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: '1.5rem', height: '3px', background: MOUTARDE, borderRadius: '2px', marginBottom: '0.6rem' }} />
          <h2 style={{ color: CRAIE, fontFamily: 'var(--font-almond)', fontSize: '1.4rem', letterSpacing: '0.02em', margin: 0 }}>Modifier le menu</h2>
          <p style={{ color: BRUME, fontSize: '0.72rem', marginTop: '0.2rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            Modifiez votre menu en quelques clics
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Breadcrumb */}
          {(wizardPage || wizardAction) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: BRUME, flexWrap: 'wrap' }}>
              <button onClick={resetWizard} style={{ background: 'none', border: 'none', color: BRUME, cursor: 'pointer', fontFamily: 'var(--font-display)', padding: 0 }}>Page</button>
              {wizardPage && (<>
                <span>/</span>
                <button onClick={() => { setWizardAction(null); setWizardSection(null); setWizardElement(null); setSelectedElements([]); }}
                  style={{ background: 'none', border: 'none', color: BRUME, cursor: 'pointer', fontFamily: 'var(--font-display)', padding: 0 }}>
                  {PAGES.find(p => p.id === wizardPage)?.label}
                </button>
              </>)}
              {wizardAction && (<>
                <span>/</span>
                <button onClick={() => { setWizardSection(null); setWizardElement(null); setSelectedElements([]); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', padding: 0,
                    color: (wizardSection || (!needsSectionStep && wizardElement)) ? BRUME : MOUTARDE }}>
                  {ACTIONS.find(a => a.id === wizardAction)?.label}
                </button>
              </>)}
              {wizardSection && (<>
                <span>/</span>
                <button onClick={() => { setWizardElement(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', padding: 0,
                    color: wizardElement ? BRUME : MOUTARDE }}>
                  {sections.find(s => s.id === wizardSection)?.label}
                </button>
              </>)}
              {wizardElement && (<>
                <span>/</span>
                <span style={{ color: MOUTARDE, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wizardElement.name}</span>
              </>)}
            </div>
          )}

          {/* Étape 1 — Page */}
          {!wizardPage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quelle page ?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {PAGES.map(p => (
                  <button key={p.id}
                    onClick={() => { setWizardPage(p.id); setPreviewMode(p.id); setPreviewKey(k => k + 1); }}
                    style={{ padding: '0.6rem', borderRadius: '8px', border: `1px solid ${BORDER}`, color: CRAIE,
                      background: 'rgba(15,39,72,0.4)', fontSize: '0.8rem', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', transition: 'border-color 0.15s' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2 — Action */}
          {wizardPage && !wizardAction && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Action ?</p>
              {ACTIONS.filter(a => {
                if (a.id === 'photos') return wizardPage === 'lunch_weekend' || wizardPage === 'apero';
                if (wizardPage === 'lunch') return a.id === 'modifier' || a.id === 'ajouter' || a.id === 'supprimer';
                return a.id !== 'photos';
              }).map(a => (
                <button key={a.id} onClick={() => { setWizardAction(a.id); if (a.id === 'photos') fetchPhotos(wizardPage); }}
                  style={{ padding: '0.6rem', borderRadius: '8px', border: `1px solid ${BORDER}`, color: CRAIE,
                    background: 'rgba(15,39,72,0.4)', fontSize: '0.875rem', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Étape 3 — Section */}
          {showSectionStep && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Section ?</p>
              {sections.filter(s => {
                if (s.id === 'message_bas' && wizardAction !== 'modifier') return false;
                const items = getItemsForSection(menuData, wizardPage, s.id);
                if (wizardAction === 'supprimer' || wizardAction === 'modifier' || wizardAction === 'réordonner') return items.length > 0;
                if (wizardAction === 'ajouter' && wizardPage === 'lunch' && s.id !== 'vin') return items.length === 0;
                return true;
              }).map(s => (
                <button key={s.id}
                  onClick={() => {
                    setWizardSection(s.id);
                    if (s.id === 'message_bas' && wizardAction === 'modifier') {
                      const item = getItemsForSection(menuData, wizardPage, 'message_bas')[0];
                      if (item) selectElement(item);
                    }
                  }}
                  style={{ padding: '0.6rem', borderRadius: '8px', border: `1px solid ${BORDER}`, color: CRAIE,
                    background: 'rgba(15,39,72,0.4)', fontSize: '0.875rem', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Étape 4 — Liste */}
          {showElementList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {wizardAction === 'modifier' ? 'Quel élément ?' : 'Éléments à supprimer'}
              </p>
              {menuData.loading ? (
                <p style={{ color: BRUME, fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>Chargement…</p>
              ) : sectionItems.length === 0 ? (
                <p style={{ color: BRUME, fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>Aucun élément trouvé.</p>
              ) : (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {sectionItems.map(item => {
                    const isSelected = selectedElements.some(e => e.id === item.id);
                    return wizardAction === 'supprimer' ? (
                      <button key={item.id} onClick={() => toggleElement(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem',
                          borderRadius: '8px', border: `1px solid ${isSelected ? BRIQUE : BORDER}`,
                          background: isSelected ? 'rgba(229,106,78,0.12)' : 'rgba(15,39,72,0.4)',
                          color: isSelected ? BRIQUE : CRAIE, fontSize: '0.875rem',
                          cursor: 'pointer', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                        <span style={{ width: '1rem', height: '1rem', borderRadius: '4px',
                          border: `1px solid ${isSelected ? BRIQUE : BRUME}`,
                          background: isSelected ? BRIQUE : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSelected && <span style={{ color: CRAIE, fontSize: '0.65rem' }}>✓</span>}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                        <span style={{ color: BRUME, fontSize: '0.75rem', flexShrink: 0 }}>{priceToString(item)}</span>
                      </button>
                    ) : (
                      <button key={item.id} onClick={() => selectElement(item)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem', borderRadius: '8px', border: `1px solid ${BORDER}`,
                          background: 'rgba(15,39,72,0.4)', color: CRAIE, fontSize: '0.875rem',
                          cursor: 'pointer', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                        <span style={{ color: BRUME, fontSize: '0.75rem', marginLeft: '0.5rem', flexShrink: 0 }}>{priceToString(item)}</span>
                      </button>
                    );
                  })}
                </div>
                {wizardAction === 'supprimer' && selectedElements.length > 0 && (
                  <button onClick={handleDeleteSubmit} disabled={loading}
                    style={{ ...btnBase, background: BRIQUE, color: CRAIE, opacity: loading ? 0.6 : 1 }}>
                    {loading ? '…' : `Supprimer ${selectedElements.length} élément${selectedElements.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </>)}
            </div>
          )}

          {/* Étape 5 — Réordonner */}
          {showReorderList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Réordonner</p>
              {menuData.loading ? (
                <p style={{ color: BRUME, fontSize: '0.8rem' }}>Chargement…</p>
              ) : reorderItems.length === 0 ? (
                <p style={{ color: BRUME, fontSize: '0.8rem' }}>Aucun élément.</p>
              ) : (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {reorderItems.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', borderRadius: '8px', border: `1px solid ${BORDER}`,
                      background: 'rgba(15,39,72,0.4)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0}
                          style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(148,165,188,0.3)' : BRUME, cursor: idx === 0 ? 'default' : 'pointer', lineHeight: 1, fontSize: '0.7rem' }}>▲</button>
                        <button onClick={() => moveItem(idx, 'down')} disabled={idx === reorderItems.length - 1}
                          style={{ background: 'none', border: 'none', color: idx === reorderItems.length - 1 ? 'rgba(148,165,188,0.3)' : BRUME, cursor: idx === reorderItems.length - 1 ? 'default' : 'pointer', lineHeight: 1, fontSize: '0.7rem' }}>▼</button>
                      </div>
                      <span style={{ flex: 1, color: CRAIE, fontSize: '0.875rem', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                      <span style={{ color: BRUME, fontSize: '0.75rem', flexShrink: 0 }}>{priceToString(item)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveOrder} disabled={loading}
                  style={{ ...btnBase, background: MOUTARDE, color: NUIT, opacity: loading ? 0.6 : 1 }}>
                  {loading ? '…' : "Enregistrer l'ordre"}
                </button>
              </>)}
            </div>
          )}

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
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
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
                        <button
                          onClick={e => { e.stopPropagation(); handlePhotoDeletePermanent(photo); }}
                          title="Supprimer définitivement"
                          style={{ position: 'absolute', top: '3px', left: '3px', background: BRIQUE, border: 'none',
                            borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '9px', color: 'white', cursor: 'pointer', opacity: 0.85 }}>
                          ×
                        </button>
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

          {/* Étape 6 — Formulaire */}
          {showFormStep && (
            <form onSubmit={handleWizardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: BRUME, fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {wizardAction === 'ajouter' ? 'Nouvel élément' : 'Modifier'}
              </p>
              <input ref={inputRef} value={wizardFields.titre}
                onChange={e => setWizardFields(f => ({ ...f, titre: e.target.value }))}
                placeholder={effectiveSection?.id === 'message_bas' ? "Phrase *" : "Titre *"}
                style={inputCls} disabled={loading} />
              {effectiveSection?.id !== 'message_bas' && (<>
                <input value={wizardFields.description}
                  onChange={e => setWizardFields(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optionnel)" style={inputCls} disabled={loading} />
                <input value={wizardFields.prix}
                  onChange={e => setWizardFields(f => ({ ...f, prix: e.target.value }))}
                  placeholder="Prix * (ex: 8€)" style={inputCls} disabled={loading} />
              </>)}
              <button type="submit"
                disabled={loading || !wizardFields.titre.trim() || (effectiveSection?.id !== 'message_bas' && !wizardFields.prix.trim())}
                style={{ ...btnBase, background: MOUTARDE, color: NUIT,
                  opacity: (loading || !wizardFields.titre.trim() || (effectiveSection?.id !== 'message_bas' && !wizardFields.prix.trim())) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading
                  ? <><span style={{ width: '6px', height: '6px', background: NUIT, borderRadius: '50%', animation: 'bounce 0.6s infinite' }} />…</>
                  : <><CheckCircle size={15} />Enregistrer</>}
              </button>
              <button type="button" onClick={resetWizard}
                style={{ background: 'none', border: 'none', color: BRUME, fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ChevronLeft size={13} /> Recommencer
              </button>
            </form>
          )}

          {/* Statut */}
          {status && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              background: status.ok ? 'rgba(244,197,66,0.12)' : 'rgba(229,106,78,0.12)',
              color: status.ok ? MOUTARDE : BRIQUE,
              border: `1px solid ${status.ok ? 'rgba(244,197,66,0.3)' : 'rgba(229,106,78,0.3)'}`,
            }}>
              {status.ok ? <CheckCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} /> : <AlertCircle size={15} style={{ marginTop: '1px', flexShrink: 0 }} />}
              {status.text}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
