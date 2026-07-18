(() => {
  'use strict';

  const STORAGE_KEY = 'animoa_v1_clean_data';
  const SETTINGS_KEY = 'animoa_v1_clean_settings';
  const UPDATED_AT_KEY = 'animoa_v1_clean_updated_at';
  const MEDIA_DB_NAME = 'animoa_media_v1';
  const MEDIA_STORE_NAME = 'images';
  const MEDIA_PREFIX = 'media:';
  const CLOUD_PREFIX = 'cloud:';

  const HEALTH_TYPES = ['Tous', 'Vaccin', 'Rendez-vous', 'Traitement', 'Médicament', 'Analyse', 'Document'];
  const KG_PER_LB = 0.45359237;
  const SUPPORTED_CURRENCIES = new Set(['EUR', 'CHF', 'CAD']);
  const SUPPORTED_WEIGHT_UNITS = new Set(['kg', 'lb']);
  const SUPPORTED_LANGUAGES = new Set(['fr', 'en']);
  const SUPPORTED_THEMES = new Set(['light', 'dark', 'system']);
  const WEIGHT_GUIDES_KG = {
    Chien: { min: 0.2, max: 120, step: 0.1, label: 'chien' },
    Chat: { min: 0.2, max: 20, step: 0.05, label: 'chat' },
    Lapin: { min: 0.1, max: 15, step: 0.05, label: 'lapin' },
    Oiseau: { min: 0.005, max: 25, step: 0.001, label: 'oiseau' },
    Autre: { min: 0.001, max: 500, step: 0.01, label: 'animal' }
  };
  const HEALTH_TYPE_ALIASES = {
    vaccin: 'Vaccin', vaccins: 'Vaccin',
    rendezvous: 'Rendez-vous', rendezvouss: 'Rendez-vous', rdv: 'Rendez-vous',
    traitement: 'Traitement', traitements: 'Traitement',
    medicament: 'Médicament', medicaments: 'Médicament',
    analyse: 'Analyse', analyses: 'Analyse',
    document: 'Document', documents: 'Document',
    autre: 'Autre', autres: 'Autre'
  };

  const placeholderImage = 'assets/pet-placeholder.svg';

  const defaultData = {
    version: 4,
    activePetId: null,
    pets: [],
    health: [],
    expenses: [],
    weights: [],
    memories: []
  };

  const navItems = [
    { page: 'home', label: 'Accueil', icon: '⌂' },
    { page: 'health', label: 'Santé', icon: '♡' },
    { page: 'expenses', label: 'Dépenses', icon: '€' },
    { page: 'memories', label: 'Souvenirs', icon: '▧' }
  ];

  let data = loadData();
  let settings = loadSettings();
  let currentPage = 'home';
  let currentHealthFilter = 'Tous';
  let healthTabsScrollLeft = 0;
  let healthRestoreFrame = null;
  let toastTimer = null;
  let drawerCloseTimer = null;
  let modalCloseTimer = null;
  let mediaDbPromise = null;
  let cloudSaveTimer = null;
  let cloudHydrating = false;
  let cloudLoadFailed = false;
  let cloudRetrying = false;
  let syncState = 'local';
  const mediaUrlCache = new Map();

  const mainContent = document.getElementById('mainContent');
  const mobileNav = document.getElementById('mobileNav');
  const desktopNav = document.getElementById('desktopNav');
  const drawerNav = document.getElementById('drawerNav');
  const drawer = document.getElementById('drawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const modal = document.getElementById('modal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const reminderBadge = document.getElementById('reminderBadge');
  const toast = document.getElementById('toast');
  const petContextBar = document.getElementById('petContextBar');
  const sidebarPetContext = document.getElementById('sidebarPetContext');
  const drawerPetContext = document.getElementById('drawerPetContext');
  const sidebarSyncStatus = document.getElementById('sidebarSyncStatus');

  function currentUserId() {
    return window.AnimoaAuth?.getUser?.()?.id || null;
  }

  function storageKey(base) {
    const userId = currentUserId();
    return userId ? `${base}:${userId}` : base;
  }

  function localUpdatedAt() {
    const value = Number(localStorage.getItem(storageKey(UPDATED_AT_KEY)) || 0);
    return Number.isFinite(value) ? value : 0;
  }

  function markLocalUpdated(date = Date.now()) {
    localStorage.setItem(storageKey(UPDATED_AT_KEY), String(date));
  }

  function appLocale() {
    return settings?.language === 'en' ? 'en-GB' : 'fr-FR';
  }

  function translateText(value) {
    return window.AnimoaI18n?.translateText?.(value) ?? value;
  }

  function translateTree(root) {
    window.AnimoaI18n?.translateTree?.(root);
  }

  function resolvedTheme() {
    if (settings?.theme === 'dark' || settings?.theme === 'light') return settings.theme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function renderStaticChrome() {
    const english = settings?.language === 'en';
    const tagline = english ? 'Their whole life, close to you.' : 'Toute sa vie, près de vous.';
    const taglineNode = document.querySelector('.topbar-brand span');
    if (taglineNode) taglineNode.textContent = tagline;
    const animalsButton = document.querySelector('.drawer-footer [data-page="animals"]');
    const settingsButton = document.querySelector('.drawer-footer [data-page="settings"]');
    if (animalsButton) animalsButton.innerHTML = english ? '🐾 My pets' : '🐾 Mes animaux';
    if (settingsButton) settingsButton.innerHTML = english ? '⚙️ Settings' : '⚙️ Paramètres';
    document.querySelectorAll('[aria-label="Navigation principale"], [aria-label="Main navigation"]').forEach((node) => node.setAttribute('aria-label', english ? 'Main navigation' : 'Navigation principale'));
    document.querySelectorAll('[aria-label="Navigation mobile"], [aria-label="Mobile navigation"]').forEach((node) => node.setAttribute('aria-label', english ? 'Mobile navigation' : 'Navigation mobile'));
  }

  function applyPreferences() {
    const language = SUPPORTED_LANGUAGES.has(settings?.language) ? settings.language : 'fr';
    if (window.AnimoaI18n?.getLanguage?.() !== language) window.AnimoaI18n?.setLanguage?.(language);
    document.documentElement.dataset.themePreference = settings?.theme || 'system';
    document.documentElement.dataset.theme = resolvedTheme();
    document.documentElement.lang = language;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme() === 'dark' ? '#13221f' : '#23b9ad');
    renderStaticChrome();
  }

  function setSyncStatus(state, detail = '') {
    syncState = state;
    if (!sidebarSyncStatus) return;
    const labels = { syncing: 'Synchronisation en cours…', synced: 'Synchronisé', offline: 'Hors ligne', local: 'Mode local de prévisualisation' };
    const icons = { syncing: '↻', synced: '✓', offline: '!', local: '•' };
    sidebarSyncStatus.innerHTML = `<span class="sync-dot ${state}">${icons[state] || '•'}</span><span>${translateText(labels[state] || detail || '')}</span>`;
    sidebarSyncStatus.title = detail || '';
  }

  async function flushCloudSave() {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    if (cloudLoadFailed) {
      setSyncStatus('offline');
      return false;
    }
    if (cloudHydrating || !window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return false;
    }
    setSyncStatus('syncing');
    try {
      await window.AnimoaCloud.saveBundle(data, settings);
      setSyncStatus('synced');
      return true;
    } catch (error) {
      console.warn('Synchronisation Animoa impossible', error);
      setSyncStatus('offline', error.message || 'Synchronisation impossible');
      showToast('Impossible de synchroniser les données. Elles restent enregistrées sur cet appareil.');
      throw error;
    }
  }

  function scheduleCloudSave() {
    if (cloudLoadFailed) {
      setSyncStatus('offline');
      return;
    }
    if (cloudHydrating || !window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return;
    }
    clearTimeout(cloudSaveTimer);
    setSyncStatus('syncing');
    cloudSaveTimer = setTimeout(() => {
      flushCloudSave().catch(() => {});
    }, 250);
  }

  async function hydrateUserState() {
    const userId = currentUserId();
    if (userId) {
      const userDataKey = `${STORAGE_KEY}:${userId}`;
      const userSettingsKey = `${SETTINGS_KEY}:${userId}`;
      const legacyClaimedBy = localStorage.getItem('animoa_legacy_migration_owner');

      if (localStorage.getItem(userDataKey)) {
        data = loadData();
      } else if (!legacyClaimedBy && localStorage.getItem(STORAGE_KEY)) {
        try {
          data = normalizeData(JSON.parse(localStorage.getItem(STORAGE_KEY)));
        } catch {
          data = normalizeData(clone(defaultData));
        }
        localStorage.setItem(userDataKey, JSON.stringify(data));
        localStorage.setItem('animoa_legacy_migration_owner', userId);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        data = normalizeData(clone(defaultData));
        localStorage.setItem(userDataKey, JSON.stringify(data));
      }

      if (localStorage.getItem(userSettingsKey)) {
        settings = loadSettings();
      } else {
        const canMigrateLegacySettings = !legacyClaimedBy && localStorage.getItem(SETTINGS_KEY);
        if (canMigrateLegacySettings) {
          try { settings = normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY))); }
          catch { settings = normalizeSettings(); }
          localStorage.setItem('animoa_legacy_migration_owner', userId);
          localStorage.removeItem(SETTINGS_KEY);
        } else {
          settings = normalizeSettings({ language: window.AnimoaI18n?.getLanguage?.() || 'fr', theme: 'system' });
        }
        localStorage.setItem(userSettingsKey, JSON.stringify(settings));
      }
    } else {
      data = loadData();
      settings = loadSettings();
    }

    if (!window.AnimoaCloud?.available?.()) {
      setSyncStatus(window.AnimoaAuth?.isLocalPreview?.() ? 'local' : 'offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const bundle = await window.AnimoaCloud.loadBundle();
      const localTimestamp = localUpdatedAt();
      const remoteTimestamp = bundle?.updated_at ? Date.parse(bundle.updated_at) : 0;
      if (bundle?.data && localTimestamp > remoteTimestamp) {
        await window.AnimoaCloud.saveBundle(data, settings);
      } else if (bundle?.data) {
        cloudHydrating = true;
        data = normalizeData(bundle.data);
        settings = normalizeSettings(bundle.settings || settings);
        localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
        localStorage.setItem(storageKey(SETTINGS_KEY), JSON.stringify(settings));
        markLocalUpdated(Number.isFinite(remoteTimestamp) ? remoteTimestamp : Date.now());
        cloudHydrating = false;
      } else {
        await window.AnimoaCloud.saveBundle(data, settings);
      }
      cloudLoadFailed = false;
      setSyncStatus('synced');
    } catch (error) {
      cloudHydrating = false;
      cloudLoadFailed = true;
      console.warn('Chargement des données du compte impossible', error);
      setSyncStatus('offline', error.message || 'Synchronisation impossible');
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeHealthType(value) {
    const raw = String(value || 'Autre').trim();
    const key = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    return HEALTH_TYPE_ALIASES[key] || raw;
  }


  function petTypeLabel(pet) {
    if (!pet) return 'Animal';
    const species = String(pet.species || 'Autre').trim();
    const breed = String(pet.breed || '').trim();
    if (species.toLowerCase() === 'autre') return breed || 'Animal';
    return breed ? `${species} · ${breed}` : species;
  }

  function weightValueKg(item) {
    if (!item) return null;
    const direct = Number(item.valueKg);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const legacy = Number(item.value);
    if (!Number.isFinite(legacy) || legacy <= 0) return null;
    return item.unit === 'lb' ? legacy * KG_PER_LB : legacy;
  }

  function displayWeightValue(valueKg) {
    const kg = Number(valueKg);
    if (!Number.isFinite(kg)) return null;
    return settings.weightUnit === 'lb' ? kg / KG_PER_LB : kg;
  }

  function inputWeightToKg(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return settings.weightUnit === 'lb' ? number * KG_PER_LB : number;
  }

  function weightGuide(species) {
    return WEIGHT_GUIDES_KG[species] || WEIGHT_GUIDES_KG.Autre;
  }

  function displayWeightLimits(species) {
    const guide = weightGuide(species);
    const factor = settings.weightUnit === 'lb' ? 1 / KG_PER_LB : 1;
    return {
      min: guide.min * factor,
      max: guide.max * factor,
      step: guide.step * factor,
      label: guide.label
    };
  }

  function formatWeightNumber(valueKg, maximumFractionDigits = 2) {
    const displayed = displayWeightValue(valueKg);
    if (!Number.isFinite(displayed)) return '—';
    return displayed.toLocaleString(appLocale(), { maximumFractionDigits });
  }

  function formatWeight(valueKg, maximumFractionDigits = 2) {
    return `${formatWeightNumber(valueKg, maximumFractionDigits)} ${settings.weightUnit}`;
  }

  function validateWeightForSpecies(valueKg, species) {
    const guide = weightGuide(species);
    if (!Number.isFinite(valueKg) || valueKg <= 0) throw new Error('Indique un poids valide.');
    if (valueKg < guide.min || valueKg > guide.max) {
      const limits = displayWeightLimits(species);
      throw new Error(`Ce poids semble incohérent pour un ${guide.label}. Indique une valeur entre ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} et ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}.`);
    }
  }

  function normalizeWeightItem(item) {
    const valueKg = weightValueKg(item);
    return { ...item, valueKg };
  }

  function validatePastOrToday(dateValue, label = 'La date') {
    if (dateValue && dateValue > todayIso()) throw new Error(`${label} ne peut pas être dans le futur.`);
  }

  function validateHealthDate(status, dateValue) {
    const today = todayIso();
    if (status === 'done' && dateValue > today) throw new Error('Une information effectuée ne peut pas avoir une date future.');
    if (status === 'planned' && dateValue < today) throw new Error('Une information à venir ne peut pas avoir une date passée. Modifie la date ou indique « Effectué ».');
  }

  function migrateLegacyData(value) {
    const source = value && typeof value === 'object' ? value : {};
    if (Number(source.version || 0) >= 4) return source;

    const pets = Array.isArray(source.pets) ? source.pets : [];
    const hasLegacyNala = pets.some((pet) => pet?.id === 'pet-nala');
    if (!hasLegacyNala) return { ...source, version: 4 };

    const remainingPets = pets.filter((pet) => pet?.id !== 'pet-nala');
    const keepOtherPetRecords = (items) => Array.isArray(items)
      ? items.filter((item) => item?.petId !== 'pet-nala')
      : [];

    return {
      ...source,
      version: 4,
      activePetId: source.activePetId === 'pet-nala' ? (remainingPets[0]?.id || null) : source.activePetId,
      pets: remainingPets,
      health: keepOtherPetRecords(source.health),
      expenses: keepOtherPetRecords(source.expenses),
      weights: keepOtherPetRecords(source.weights),
      memories: keepOtherPetRecords(source.memories)
    };
  }

  function normalizeData(value) {
    const migrated = migrateLegacyData(value);
    const normalized = {
      ...migrated,
      version: 4,
      pets: Array.isArray(migrated.pets) ? migrated.pets : [],
      health: Array.isArray(migrated.health) ? migrated.health.map((item) => ({ ...item, type: normalizeHealthType(item.type) })) : [],
      expenses: Array.isArray(migrated.expenses) ? migrated.expenses : [],
      weights: Array.isArray(migrated.weights) ? migrated.weights.map(normalizeWeightItem) : [],
      memories: Array.isArray(migrated.memories) ? migrated.memories : []
    };
    if (!normalized.pets.some((pet) => pet.id === normalized.activePetId)) normalized.activePetId = normalized.pets[0]?.id || null;
    return normalized;
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(storageKey(STORAGE_KEY));
      if (!saved) return normalizeData(clone(defaultData));
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.pets)) return normalizeData(clone(defaultData));
      const normalized = normalizeData(parsed);
      if (Number(parsed.version || 0) < 4) localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.warn('Impossible de lire les données Animoa', error);
      return clone(defaultData);
    }
  }

  function normalizeSettings(value = {}) {
    return {
      currency: SUPPORTED_CURRENCIES.has(value.currency) ? value.currency : 'EUR',
      weightUnit: SUPPORTED_WEIGHT_UNITS.has(value.weightUnit) ? value.weightUnit : 'kg',
      language: SUPPORTED_LANGUAGES.has(value.language) ? value.language : (window.AnimoaI18n?.getLanguage?.() || 'fr'),
      theme: SUPPORTED_THEMES.has(value.theme) ? value.theme : 'system'
    };
  }

  function loadSettings() {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(storageKey(SETTINGS_KEY)) || '{}'));
    } catch {
      return normalizeSettings();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
      markLocalUpdated();
      updateReminderBadge();
      scheduleCloudSave();
    } catch (error) {
      if (error?.name === 'QuotaExceededError' || error?.code === 22) {
        throw new Error('Le stockage local est plein. Les photos sont maintenant séparées des données ; recharge Animoa puis réessaie.');
      }
      throw new Error('Impossible d’enregistrer les données sur cet appareil.');
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(storageKey(SETTINGS_KEY), JSON.stringify(settings));
      markLocalUpdated();
      applyPreferences();
      scheduleCloudSave();
    } catch {
      throw new Error('Impossible d’enregistrer les paramètres.');
    }
  }

  function openMediaDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('Le stockage des photos n’est pas disponible dans ce navigateur.'));
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(MEDIA_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Impossible d’ouvrir le stockage des photos.'));
      request.onblocked = () => reject(new Error('Le stockage des photos est bloqué par un autre onglet Animoa.'));
    });
    return mediaDbPromise;
  }

  async function putMediaBlob(blob, id = uid(`image-${currentUserId() || 'local'}`)) {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      transaction.objectStore(MEDIA_STORE_NAME).put({ id, blob, savedAt: new Date().toISOString() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('Impossible d’enregistrer la photo.'));
      transaction.onabort = () => reject(transaction.error || new Error('Enregistrement de la photo annulé.'));
    });
    return `${MEDIA_PREFIX}${id}`;
  }

  async function getMediaBlob(ref) {
    if (!ref?.startsWith(MEDIA_PREFIX)) return null;
    const id = ref.slice(MEDIA_PREFIX.length);
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const request = transaction.objectStore(MEDIA_STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error || new Error('Impossible de lire la photo.'));
    });
  }

  function allImageRefsFrom(sourceData = data) {
    return new Set(
      [...(sourceData.pets || []), ...(sourceData.memories || []), ...(sourceData.health || [])]
        .flatMap((item) => [item.image, item.attachment])
        .filter((ref) => typeof ref === 'string' && (ref.startsWith(MEDIA_PREFIX) || ref.startsWith(CLOUD_PREFIX)))
    );
  }

  function mediaRefsFrom(sourceData = data) {
    return new Set([...allImageRefsFrom(sourceData)].filter((ref) => ref.startsWith(MEDIA_PREFIX)));
  }

  async function deleteMediaRef(ref) {
    if (ref?.startsWith(CLOUD_PREFIX)) {
      try { await window.AnimoaCloud?.deleteImage?.(ref); }
      catch (error) { console.warn('Suppression de la photo distante impossible', error); }
      mediaUrlCache.delete(ref);
      return;
    }
    if (!ref?.startsWith(MEDIA_PREFIX)) return;
    const id = ref.slice(MEDIA_PREFIX.length);
    try {
      const db = await openMediaDb();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
        transaction.objectStore(MEDIA_STORE_NAME).delete(id);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Suppression de la photo impossible.'));
      });
      const cachedUrl = mediaUrlCache.get(ref);
      if (cachedUrl) URL.revokeObjectURL(cachedUrl);
      mediaUrlCache.delete(ref);
    } catch (error) {
      console.warn('Nettoyage d’une photo impossible', error);
    }
  }

  async function deleteMediaIfUnused(ref) {
    if (!ref || (!ref.startsWith(MEDIA_PREFIX) && !ref.startsWith(CLOUD_PREFIX))) return;
    if (!allImageRefsFrom().has(ref)) await deleteMediaRef(ref);
  }

  async function clearMediaStore(refsToDelete = []) {
    const refs = [...new Set(refsToDelete.filter(Boolean))];
    for (const ref of refs) await deleteMediaRef(ref);
    try {
      if (window.AnimoaCloud?.available?.()) await window.AnimoaCloud.clearUserImages();
    } catch (error) {
      console.warn('Nettoyage des photos distantes impossible', error);
    }
    mediaUrlCache.forEach((url) => { if (String(url).startsWith('blob:')) URL.revokeObjectURL(url); });
    mediaUrlCache.clear();
  }


  async function cleanupUnusedMedia() {
    try {
      const usedIds = new Set([...mediaRefsFrom()].map((ref) => ref.slice(MEDIA_PREFIX.length)));
      const db = await openMediaDb();
      const storedIds = await new Promise((resolve, reject) => {
        const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
        const request = transaction.objectStore(MEDIA_STORE_NAME).getAllKeys();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error || new Error('Lecture des photos impossible.'));
      });
      const namespacePrefix = `image-${currentUserId() || 'local'}-`;
      for (const id of storedIds) {
        const storedId = String(id);
        if (storedId.startsWith(namespacePrefix) && !usedIds.has(storedId)) await deleteMediaRef(`${MEDIA_PREFIX}${storedId}`);
      }
    } catch (error) {
      console.warn('Nettoyage des anciennes photos impossible', error);
    }
  }

  async function dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Impossible de préparer la photo.'));
      reader.readAsDataURL(blob);
    });
  }

  function detectedFileType(file) {
    if (file?.type) return file.type;
    const extension = String(file?.name || '').toLowerCase().split('.').pop();
    const types = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      gif: 'image/gif', heic: 'image/heic', heif: 'image/heif',
      pdf: 'application/pdf', doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return types[extension] || 'application/octet-stream';
  }

  function fileWithDetectedType(file) {
    if (!file || file.type) return file;
    const type = detectedFileType(file);
    try { return new File([file], file.name || 'fichier', { type, lastModified: file.lastModified || Date.now() }); }
    catch { return file.slice(0, file.size, type); }
  }

  async function compressImage(file) {
    file = fileWithDetectedType(file);
    if (!file) return null;
    if (!file.type.startsWith('image/')) throw new Error('Le fichier choisi n’est pas une image.');
    if (file.size > 20 * 1024 * 1024) throw new Error('Cette image est trop volumineuse. Choisis une photo de moins de 20 Mo.');

    const bitmap = await createImageBitmap(file);
    const maxSide = 1000;
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .72));
    if (!blob) throw new Error('Impossible de réduire cette photo.');
    return blob;
  }

  async function storeBlob(blob, fileName = 'image.webp') {
    let cloudError = null;
    try {
      const cloudRef = await window.AnimoaCloud?.uploadFile?.(blob, fileName);
      if (cloudRef) return cloudRef;
    } catch (error) {
      cloudError = error;
      console.warn('Stockage distant indisponible, conservation locale', error);
    }
    try {
      return await putMediaBlob(blob);
    } catch (localError) {
      const fallback = await blobToDataUrl(blob);
      if (fallback.length > 650000) throw (cloudError || localError);
      return fallback;
    }
  }

  async function fileToMediaRef(file) {
    if (!file) return null;
    const blob = await compressImage(file);
    return storeBlob(blob, 'image.webp');
  }

  async function fileToAttachmentRef(file) {
    if (!file) return null;
    const preparedFile = fileWithDetectedType(file);
    if (preparedFile.size > 15 * 1024 * 1024) throw new Error('Ce fichier est trop volumineux. Choisis un fichier de moins de 15 Mo.');
    if (preparedFile.type.startsWith('image/')) return fileToMediaRef(preparedFile);
    return storeBlob(preparedFile, file.name || 'document.bin');
  }

  async function resolveImageRef(ref) {
    if (!ref) return placeholderImage;
    if (ref.startsWith(CLOUD_PREFIX)) {
      try {
        const url = await window.AnimoaCloud?.getImageUrl?.(ref);
        if (!url) return placeholderImage;
        return url;
      } catch (error) {
        console.warn('Photo Animoa distante indisponible', error);
        return placeholderImage;
      }
    }
    if (!ref.startsWith(MEDIA_PREFIX)) return ref;
    if (mediaUrlCache.has(ref)) return mediaUrlCache.get(ref);
    try {
      const blob = await getMediaBlob(ref);
      if (!blob) return placeholderImage;
      const url = URL.createObjectURL(blob);
      mediaUrlCache.set(ref, url);
      return url;
    } catch (error) {
      console.warn('Photo Animoa indisponible', error);
      return placeholderImage;
    }
  }

  function imageTag(ref, className, alt, extra = '') {
    const safeRef = escapeHtml(ref || placeholderImage);
    return `<img class="${className || ''} media-loading" src="${placeholderImage}" data-image-ref="${safeRef}" alt="${escapeHtml(alt || '')}" ${extra}>`;
  }

  async function hydrateImages(root = document) {
    const images = [...root.querySelectorAll('img[data-image-ref]')];
    await Promise.all(images.map(async (image) => {
      const expectedRef = image.dataset.imageRef;
      const source = await resolveImageRef(expectedRef);
      if (image.isConnected && image.dataset.imageRef === expectedRef) {
        image.src = source;
        image.classList.remove('media-loading');
      }
    }));
  }

  async function migrateLegacyImages() {
    const targets = [...data.pets, ...data.memories].filter((item) => typeof item.image === 'string' && item.image.startsWith('data:image/'));
    if (!targets.length) return;
    let changed = false;
    for (const item of targets) {
      try {
        const sourceBlob = await dataUrlToBlob(item.image);
        const compactBlob = await compressImage(sourceBlob);
        item.image = await storeBlob(compactBlob, 'image.webp');
        changed = true;
      } catch (error) {
        console.warn('Migration d’une ancienne photo impossible', error);
      }
    }
    if (changed) saveData();
  }

  async function migrateLocalMediaToCloud() {
    if (!window.AnimoaCloud?.available?.()) return;
    const targets = [
      ...data.pets.map((item) => ({ item, field: 'image', fileName: 'image.webp' })),
      ...data.memories.map((item) => ({ item, field: 'image', fileName: 'image.webp' })),
      ...data.health.map((item) => ({ item, field: 'attachment', fileName: item.attachmentName || 'document.bin' }))
    ].filter(({ item, field }) => typeof item[field] === 'string' && item[field].startsWith(MEDIA_PREFIX));
    if (!targets.length) return;

    const uploadedByLocalRef = new Map();
    const replacements = [];
    for (const target of targets) {
      const localRef = target.item[target.field];
      try {
        let cloudRef = uploadedByLocalRef.get(localRef);
        if (!cloudRef) {
          const blob = await getMediaBlob(localRef);
          if (!blob) continue;
          const fileName = blob.type === 'image/webp' ? 'image.webp' : target.fileName;
          cloudRef = await window.AnimoaCloud.uploadFile(blob, fileName);
          if (!cloudRef) continue;
          uploadedByLocalRef.set(localRef, cloudRef);
        }
        replacements.push({ target, localRef, cloudRef });
        target.item[target.field] = cloudRef;
      } catch (error) {
        console.warn('Synchronisation d’un ancien fichier impossible', error);
      }
    }
    if (!replacements.length) return;

    try {
      saveData();
      await window.AnimoaCloud.saveBundle(data, settings);
      setSyncStatus('synced');
      for (const localRef of new Set(replacements.map((entry) => entry.localRef))) await deleteMediaRef(localRef);
    } catch (error) {
      for (const { target, localRef } of replacements) target.item[target.field] = localRef;
      localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(data));
      for (const cloudRef of new Set(replacements.map((entry) => entry.cloudRef))) await deleteMediaRef(cloudRef);
      console.warn('Migration des fichiers locaux vers le compte incomplète', error);
    }
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function requiredText(value, label) {
    const text = String(value || '').trim();
    if (!text) throw new Error(`Indique ${label}.`);
    return text;
  }

  function activePet() {
    return data.pets.find((pet) => pet.id === data.activePetId) || data.pets[0] || null;
  }

  function petItems(collection) {
    const pet = activePet();
    if (!pet) return [];
    return data[collection].filter((item) => item.petId === pet.id);
  }

  function formatDate(value, options = {}) {
    if (!value) return 'Non renseigné';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(appLocale(), options.short
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' }
    ).format(date);
  }

  function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }


  function isoDateToFrench(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
  }

  function formatDirectDateEntry(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function parseFrenchDate(value, label = 'La date') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const match = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (!match) throw new Error(`${label} doit être écrite au format JJ/MM/AAAA.`);
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      throw new Error(`${label} n’est pas valide.`);
    }
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function daysUntil(dateValue) {
    const today = new Date(`${todayIso()}T12:00:00`);
    const target = new Date(`${dateValue}T12:00:00`);
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  }

  function ageText(dateValue) {
    if (!dateValue) return 'Âge non renseigné';
    const birth = new Date(`${dateValue}T12:00:00`);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const anniversary = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (now < anniversary) years -= 1;
    if (years <= 0) {
      const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());
      return `${months} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat(appLocale(), { style: 'currency', currency: settings.currency }).format(Number(value || 0));
  }

  function latestByDate(items) {
    return [...items].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function nextReminder() {
    return petItems('health')
      .filter((item) => item.status === 'planned' && item.date >= todayIso())
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  }

  function upcomingReminders() {
    return petItems('health')
      .filter((item) => item.status === 'planned' && item.reminder && item.date >= todayIso())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function currentMonthExpenses() {
    const month = todayIso().slice(0, 7);
    return petItems('expenses').filter((item) => item.date.startsWith(month));
  }

  function currentYearExpenses() {
    const year = todayIso().slice(0, 4);
    return petItems('expenses').filter((item) => item.date.startsWith(year));
  }

  function sum(items, selector) {
    return items.reduce((total, item) => total + Number(selector(item) || 0), 0);
  }

  function typeIcon(type) {
    const icons = {
      Vaccin: '💉',
      'Rendez-vous': '🩺',
      Traitement: '💊',
      Médicament: '💊',
      Analyse: '🧪',
      Document: '📄',
      Autre: '📌',
      Nourriture: '🥣',
      Vétérinaire: '🩺',
      Médicaments: '💊',
      Toilettage: '✂️',
      Jouets: '🎾',
      Accessoires: '🦮',
      Assurance: '🛡️',
      'Moment important': '✨',
      Anniversaire: '🎂',
      'Première fois': '🌟',
      Anecdote: '💬'
    };
    return icons[type] || '🐾';
  }

  function showToast(message) {
    toast.textContent = translateText(message);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function updateReminderBadge() {
    const count = upcomingReminders().length;
    reminderBadge.textContent = String(count);
    reminderBadge.hidden = count === 0;
  }

  function renderPetContexts() {
    const pet = activePet();
    const contextualPages = new Set(['health', 'expenses', 'weight', 'memories', 'pet']);

    if (!pet) {
      petContextBar.hidden = true;
      petContextBar.innerHTML = '';
      sidebarPetContext.hidden = true;
      sidebarPetContext.innerHTML = '';
      drawerPetContext.hidden = true;
      drawerPetContext.innerHTML = '';
      return;
    }

    const contextContent = `${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div class="pet-context-copy"><strong>${escapeHtml(pet.name)}</strong><span>Animal actuellement consulté</span></div><span class="pet-context-chevron">Changer</span>`;
    petContextBar.hidden = !contextualPages.has(currentPage);
    petContextBar.innerHTML = `<button class="pet-context-button" data-action="switch-pet" aria-label="Changer d’animal">${contextContent}</button>`;

    sidebarPetContext.hidden = false;
    sidebarPetContext.innerHTML = `<button data-action="switch-pet" aria-label="Changer d’animal">${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><strong>${escapeHtml(pet.name)}</strong><span>Animal consulté</span></div><span>↕</span></button>`;

    drawerPetContext.hidden = false;
    drawerPetContext.innerHTML = `<button data-action="switch-pet" aria-label="Changer d’animal">${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><strong>${escapeHtml(pet.name)}</strong><span>Animal actuellement consulté</span></div><span>Changer</span></button>`;

    hydrateImages(petContextBar);
    hydrateImages(sidebarPetContext);
    hydrateImages(drawerPetContext);
  }

  function renderNavigation() {
    desktopNav.innerHTML = navItems.map((item) => navButton(item, 'desktop')).join('');
    drawerNav.innerHTML = navItems.map((item) => navButton(item, 'drawer')).join('');

    mobileNav.innerHTML = `
      ${navButton(navItems[0], 'mobile')}
      ${navButton(navItems[1], 'mobile')}
      <button class="nav-button add" data-action="open-add" aria-label="Ajouter"><img src="assets/animoa-icon-official.png" alt="" /></button>
      ${navButton(navItems[2], 'mobile')}
      ${navButton(navItems[3], 'mobile')}
    `;
    translateTree(desktopNav);
    translateTree(drawerNav);
    translateTree(mobileNav);
  }

  function navButton(item, mode) {
    const active = currentPage === item.page ? 'active' : '';
    if (mode === 'mobile') {
      return `<button class="nav-button ${active}" data-page="${item.page}"><span class="nav-icon">${item.icon}</span><span>${item.label}</span></button>`;
    }
    return `<button class="${active}" data-page="${item.page}">${item.icon}&nbsp;&nbsp;${item.label}</button>`;
  }

  function setPage(page) {
    currentPage = page;
    closeDrawer();
    closeModal();
    renderNavigation();
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mainContent.focus({ preventScroll: true });
  }

  function renderPage() {
    const pet = activePet();
    if (!pet && !['animals', 'settings'].includes(currentPage)) currentPage = 'animals';

    const pages = {
      home: renderHome,
      health: renderHealth,
      expenses: renderExpenses,
      weight: renderWeight,
      memories: renderMemories,
      animals: renderAnimals,
      pet: renderPetProfile,
      settings: renderSettings
    };
    const render = pages[currentPage] || renderHome;
    mainContent.innerHTML = render();
    renderPetContexts();
    translateTree(mainContent);
    translateTree(petContextBar);
    translateTree(sidebarPetContext);
    translateTree(drawerPetContext);
    hydrateImages(mainContent);
    mainContent.classList.remove('page-refresh');
    requestAnimationFrame(() => mainContent.classList.add('page-refresh'));
    if (currentPage === 'weight') requestAnimationFrame(drawWeightChart);
    if (currentPage === 'health') {
      if (healthRestoreFrame) cancelAnimationFrame(healthRestoreFrame);
      healthRestoreFrame = requestAnimationFrame(() => {
        healthRestoreFrame = null;
        restoreHealthTabsPosition();
      });
    }
    updateReminderBadge();
  }

  function renderHome() {
    const pet = activePet();
    if (!pet) return renderNoPet();

    const reminder = nextReminder();
    const weights = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const lastWeight = weights.at(-1);
    const monthExpense = sum(currentMonthExpenses(), (item) => item.amount);
    const yearExpense = sum(currentYearExpenses(), (item) => item.amount);
    const memory = latestByDate(petItems('memories'));

    return `
      <div class="page-stack">
        <div class="page-header">
          <div><p class="eyebrow">Bonjour</p><h1>La vie de ${escapeHtml(pet.name)}</h1><p>L’essentiel, sans surcharge.</p></div>
        </div>

        <div class="home-layout">
          <div class="home-main">
            <article class="card pet-card" data-page="pet">
              ${imageTag(pet.image, 'pet-avatar', `Photo de ${pet.name}`)}
              <div><h2 class="pet-name">${escapeHtml(pet.name)}</h2><p class="pet-meta">${escapeHtml(petTypeLabel(pet))} · ${ageText(pet.birthDate)}</p></div>
              <button class="pet-switch" data-action="switch-pet" aria-label="Changer d’animal" title="Changer d’animal">↕</button>
            </article>

            ${renderPriority(reminder, pet)}

            <section>
              <div class="card-title-row"><h2>Ajouter rapidement</h2></div>
              <div class="quick-grid" style="margin-top:10px">
                ${quickAction('health', '🩺', 'Santé')}
                ${quickAction('expense', '€', 'Dépense')}
                ${quickAction('weight', '⚖️', 'Poids')}
                ${quickAction('memory', '📷', 'Souvenir')}
              </div>
            </section>

            <section class="summary-grid">
              ${summaryCard('Dernier poids', lastWeight ? formatWeight(weightValueKg(lastWeight), 2) : '—', lastWeight ? formatDate(lastWeight.date, { short: true }) : 'Aucune mesure', 'weight')}
              ${summaryCard('Dépenses du mois', formatCurrency(monthExpense), `${currentMonthExpenses().length} dépense${currentMonthExpenses().length > 1 ? 's' : ''}`, 'expenses')}
              ${summaryCard('Coût annuel', formatCurrency(yearExpense), 'Depuis janvier', 'expenses')}
              ${summaryCard('Souvenirs', String(petItems('memories').length), 'Dans son journal', 'memories')}
            </section>
          </div>

          <div class="home-side">
            ${memory ? renderMemoryPreview(memory) : renderEmptyMemory()}
            <article class="card card-pad">
              <div class="card-title-row"><h2>Dossier de ${escapeHtml(pet.name)}</h2><button class="link-button" data-page="pet">Ouvrir</button></div>
              <div class="profile-grid" style="margin-top:8px">
                <div class="profile-row"><span class="profile-label">Allergies</span><span class="profile-value">${escapeHtml(pet.allergies || 'Non renseignées')}</span></div>
                <div class="profile-row"><span class="profile-label">Prochain rappel</span><span class="profile-value">${reminder ? formatDate(reminder.date, { short: true }) : 'Aucun'}</span></div>
              </div>
            </article>
          </div>
        </div>
      </div>`;
  }

  function renderPriority(reminder, pet) {
    if (!reminder) {
      return `
        <article class="card priority-card">
          <div class="priority-accent" style="background:linear-gradient(90deg,#7dac92,#b6d3c5)"></div>
          <div class="priority-content">
            <div class="priority-row"><div class="priority-icon" style="background:#e5f1ea">✓</div><div><p class="eyebrow">À ne pas manquer</p><h2>Tout va bien pour ${escapeHtml(pet.name)}</h2><p>Aucun rappel planifié ne demande ton attention.</p></div></div>
          </div>
        </article>`;
    }
    const days = daysUntil(reminder.date);
    const timing = days === 0 ? "aujourd’hui" : days === 1 ? 'demain' : `dans ${days} jours`;
    return `
      <article class="card priority-card">
        <div class="priority-accent"></div>
        <div class="priority-content">
          <div class="priority-row">
            <div class="priority-icon">${typeIcon(reminder.type)}</div>
            <div><p class="eyebrow">À ne pas manquer</p><h2>${escapeHtml(reminder.title)}</h2><p>${escapeHtml(reminder.type)} prévu ${timing}, le ${formatDate(reminder.date)}.</p></div>
          </div>
          <div class="priority-footer"><button class="link-button" data-page="health">Voir le rappel →</button></div>
        </div>
      </article>`;
  }

  function quickAction(type, icon, label) {
    return `<button class="quick-action" data-add="${type}"><span class="quick-icon">${icon}</span><span class="quick-label">${label}</span></button>`;
  }

  function summaryCard(label, value, note, page) {
    return `<button class="card summary-card" data-page="${page}" style="text-align:left;cursor:pointer"><div class="summary-label">${label}</div><div class="summary-value">${value}</div><div class="summary-note">${note}</div></button>`;
  }

  function renderMemoryPreview(memory) {
    return `
      <article class="card memory-preview" data-page="memories" style="cursor:pointer">
        ${imageTag(memory.image, 'memory-image', memory.title)}
        <div class="memory-body"><p class="eyebrow">Dernier souvenir</p><h3>${escapeHtml(memory.title)}</h3><p>${formatDate(memory.date)}</p></div>
      </article>`;
  }

  function renderEmptyMemory() {
    return `<article class="card empty-state"><div style="font-size:2rem">📷</div><strong>Aucun souvenir</strong><p>Ajoute une photo ou une anecdote.</p><button class="primary-button" data-add="memory">Ajouter</button></article>`;
  }

  function healthViewData(filter = currentHealthFilter) {
    const allItems = petItems('health').map((item) => ({ ...item, type: normalizeHealthType(item.type) }));
    const selectedType = HEALTH_TYPES.includes(filter) ? filter : 'Tous';
    const items = allItems
      .filter((item) => selectedType === 'Tous' || item.type === selectedType)
      .sort((a, b) => b.date.localeCompare(a.date));
    const counts = allItems.reduce((result, item) => {
      result[item.type] = (result[item.type] || 0) + 1;
      return result;
    }, {});
    return {
      allItems,
      selectedType,
      items,
      counts,
      selectedLabel: selectedType === 'Tous' ? 'Tout le dossier' : selectedType
    };
  }

  function renderHealth() {
    const pet = activePet();
    const view = healthViewData();
    currentHealthFilter = view.selectedType;

    return `
      <div class="page-stack">
        ${pageHeader('Santé', `Le dossier médical de ${escapeHtml(pet.name)}.`, 'health')}
        <section class="health-filter-panel" aria-label="Filtrer le carnet de santé">
          <div class="health-filter-heading">
            <div><p class="eyebrow">Catégories</p><strong id="healthFilterLabel">${escapeHtml(view.selectedLabel)}</strong></div>
            <span id="healthFilterCount">${view.items.length} élément${view.items.length > 1 ? 's' : ''}</span>
          </div>
          <div class="health-tabs-shell">
            <button class="health-tab-arrow" data-action="health-scroll-left" aria-label="Voir les catégories précédentes">‹</button>
            <div class="section-tabs health-tabs" id="healthTabs" role="tablist">${HEALTH_TYPES.map((type) => {
              const count = type === 'Tous' ? view.allItems.length : (view.counts[type] || 0);
              return `<button class="tab-chip ${view.selectedType === type ? 'active' : ''}" data-health-filter="${type}" aria-pressed="${view.selectedType === type}" role="tab"><span>${type}</span><small>${count}</small></button>`;
            }).join('')}</div>
            <button class="health-tab-arrow" data-action="health-scroll-right" aria-label="Voir les catégories suivantes">›</button>
          </div>
          <p class="health-swipe-hint">Fais glisser le bandeau sur le côté, ou utilise les flèches.</p>
        </section>
        <article class="card card-pad">
          <div class="card-title-row"><h2 id="healthListTitle">${escapeHtml(view.selectedLabel)}</h2><span id="healthListCount" class="summary-note">${view.items.length} élément${view.items.length > 1 ? 's' : ''}</span></div>
          <div class="list" id="healthList" style="margin-top:14px">
            ${view.items.length ? view.items.map(renderHealthItem).join('') : emptyList(`Aucune information dans « ${view.selectedLabel} ».`)}
          </div>
        </article>
      </div>`;
  }

  function applyHealthFilter(filter) {
    const view = healthViewData(filter);
    currentHealthFilter = view.selectedType;

    const tabs = document.getElementById('healthTabs');
    if (!tabs || currentPage !== 'health') {
      renderPage();
      return;
    }

    if (healthRestoreFrame) {
      cancelAnimationFrame(healthRestoreFrame);
      healthRestoreFrame = null;
    }
    const preservedScrollLeft = tabs.scrollLeft;

    tabs.querySelectorAll('[data-health-filter]').forEach((button) => {
      const active = button.dataset.healthFilter === view.selectedType;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const countText = `${view.items.length} élément${view.items.length > 1 ? 's' : ''}`;
    const filterLabel = document.getElementById('healthFilterLabel');
    const filterCount = document.getElementById('healthFilterCount');
    const listTitle = document.getElementById('healthListTitle');
    const listCount = document.getElementById('healthListCount');
    const list = document.getElementById('healthList');

    if (filterLabel) filterLabel.textContent = view.selectedLabel;
    if (filterCount) filterCount.textContent = countText;
    if (listTitle) listTitle.textContent = view.selectedLabel;
    if (listCount) listCount.textContent = countText;
    if (list) list.innerHTML = view.items.length
      ? view.items.map(renderHealthItem).join('')
      : emptyList(`Aucune information dans « ${view.selectedLabel} ».`);

    [filterLabel, filterCount, listTitle, listCount, list].forEach((node) => translateTree(node));
    tabs.scrollLeft = preservedScrollLeft;
    healthTabsScrollLeft = preservedScrollLeft;
    updateHealthScrollButtons();
  }

  function renderHealthItem(item) {
    const isPlanned = item.status === 'planned';
    const days = isPlanned ? daysUntil(item.date) : null;
    const overdue = isPlanned && days < 0;
    const soon = isPlanned && days >= 0 && days <= 30;
    const statusLabel = overdue ? 'En retard' : isPlanned ? 'À venir' : 'Effectué';
    return `
      <div class="list-item record-list-item">
        <div class="list-icon">${typeIcon(item.type)}</div>
        <div><p class="list-title">${escapeHtml(item.title)}</p><p class="list-subtitle">${escapeHtml(normalizeHealthType(item.type))} · ${escapeHtml(item.professional || item.note || 'Aucun détail')}</p></div>
        <div class="record-trailing">
          <div class="list-value"><span class="status-dot ${overdue ? 'overdue' : soon ? 'soon' : ''}"></span>${formatDate(item.date, { short: true })}<small>${statusLabel}</small></div>
          <button class="record-menu-button" data-action="show-health-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer ${escapeHtml(item.title)}">•••</button>
        </div>
      </div>`;
  }

  function renderExpenses() {
    const pet = activePet();
    const items = petItems('expenses').sort((a, b) => b.date.localeCompare(a.date));
    const monthItems = currentMonthExpenses();
    const yearItems = currentYearExpenses();
    const categories = groupExpenses(yearItems);
    const maxValue = Math.max(1, ...Object.values(categories));

    return `
      <div class="page-stack">
        ${pageHeader('Dépenses', `Comprendre simplement le coût de ${escapeHtml(pet.name)}.`, 'expense')}
        <section class="summary-grid">
          ${summaryCard('Ce mois-ci', formatCurrency(sum(monthItems, (item) => item.amount)), `${monthItems.length} saisie${monthItems.length > 1 ? 's' : ''}`, 'expenses')}
          ${summaryCard('Cette année', formatCurrency(sum(yearItems, (item) => item.amount)), 'Total annuel', 'expenses')}
        </section>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Répartition annuelle</h2><span class="summary-note">Graphique simple</span></div>
          <div class="expense-bars" style="margin-top:18px">
            ${Object.keys(categories).length ? Object.entries(categories).sort((a,b) => b[1]-a[1]).map(([category, value]) => `
              <div class="expense-bar-row"><span>${escapeHtml(category)}</span><div class="expense-bar-track"><div class="expense-bar-fill" style="width:${Math.max(5, (value/maxValue)*100)}%"></div></div><span class="expense-bar-value">${formatCurrency(value)}</span></div>`).join('') : '<p class="chart-caption">Aucune dépense cette année.</p>'}
          </div>
        </article>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Historique</h2><span class="summary-note">${items.length} dépense${items.length > 1 ? 's' : ''}</span></div>
          <div class="list" style="margin-top:14px">
            ${items.length ? items.map((item) => `
              <div class="list-item record-list-item"><div class="list-icon">${typeIcon(item.category)}</div><div><p class="list-title">${escapeHtml(item.category)}</p><p class="list-subtitle">${escapeHtml(item.note || 'Sans description')} · ${formatDate(item.date)}</p></div><div class="record-trailing"><div class="list-value">${formatCurrency(item.amount)}</div><button class="record-menu-button" data-action="show-expense-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer cette dépense">•••</button></div></div>`).join('') : emptyList('Aucune dépense enregistrée.')}
          </div>
        </article>
      </div>`;
  }

  function groupExpenses(items) {
    return items.reduce((groups, item) => {
      groups[item.category] = (groups[item.category] || 0) + Number(item.amount || 0);
      return groups;
    }, {});
  }

  function renderWeight() {
    const pet = activePet();
    const items = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const latest = items.at(-1);
    const previous = items.at(-2);
    const latestKg = weightValueKg(latest);
    const previousKg = weightValueKg(previous);
    const deltaKg = Number.isFinite(latestKg) && Number.isFinite(previousKg) ? latestKg - previousKg : null;
    const deltaDisplayed = deltaKg === null ? null : displayWeightValue(deltaKg);
    const deltaText = deltaDisplayed === null ? 'Pas encore de comparaison' : `${deltaDisplayed > 0 ? '+' : ''}${deltaDisplayed.toFixed(2).replace('.', ',')} ${settings.weightUnit} depuis la mesure précédente`;
    const guide = weightGuide(pet.species);
    const latestLooksWrong = Number.isFinite(latestKg) && (latestKg < guide.min || latestKg > guide.max);

    return `
      <div class="page-stack">
        ${pageHeader('Poids', `Suivre l’évolution de ${escapeHtml(pet.name)} sans être anxiogène.`, 'weight')}
        ${latestLooksWrong ? `<div class="logic-warning"><strong>Poids à vérifier</strong><span>${escapeHtml(pet.name)} est enregistré comme ${escapeHtml(pet.species.toLowerCase())}, mais ${formatWeight(latestKg)} semble être une erreur de saisie. Tu peux modifier ou supprimer cette mesure.</span></div>` : ''}
        <section class="summary-grid">
          ${summaryCard('Poids actuel', latest ? formatWeight(latestKg, 2) : '—', latest ? formatDate(latest.date, { short: true }) : 'Aucune mesure', 'weight')}
          ${summaryCard('Évolution', deltaDisplayed === null ? '—' : `${deltaDisplayed > 0 ? '+' : ''}${deltaDisplayed.toFixed(2).replace('.', ',')} ${settings.weightUnit}`, 'Depuis la dernière mesure', 'weight')}
        </section>
        <article class="card chart-card">
          <div class="card-title-row"><h2>Courbe d’évolution</h2><span class="summary-note">${items.length} mesure${items.length > 1 ? 's' : ''}</span></div>
          <div class="chart-wrap"><canvas id="weightChart" aria-label="Courbe de poids"></canvas></div>
          <p class="chart-caption">${escapeHtml(deltaText)}. Les plages de saisie servent à éviter les erreurs évidentes ; elles ne remplacent pas l’avis d’un vétérinaire.</p>
        </article>
        <article class="card card-pad">
          <div class="card-title-row"><h2>Historique</h2></div>
          <div class="list" style="margin-top:14px">
            ${items.length ? [...items].reverse().map((item) => `<div class="list-item record-list-item"><div class="list-icon">⚖️</div><div><p class="list-title">${formatWeight(weightValueKg(item), 2)}</p><p class="list-subtitle">${escapeHtml(item.note || 'Mesure enregistrée')}</p></div><div class="record-trailing"><div class="list-value">${formatDate(item.date, { short: true })}</div><button class="record-menu-button" data-action="show-weight-record" data-record-id="${item.id}" aria-label="Modifier ou supprimer cette mesure">•••</button></div></div>`).join('') : emptyList('Aucune mesure de poids.')}
          </div>
        </article>
      </div>`;
  }

  function drawWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    const items = petItems('weights').sort((a, b) => a.date.localeCompare(b.date));
    const chartItems = items.filter((item) => Number.isFinite(displayWeightValue(weightValueKg(item))));
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(document.documentElement);
    const border = styles.getPropertyValue('--border').trim();
    const primary = styles.getPropertyValue('--primary').trim();
    const muted = styles.getPropertyValue('--muted').trim();
    const surface = styles.getPropertyValue('--surface').trim();

    const pad = { left: 40, right: 16, top: 18, bottom: 32 };
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui';
    ctx.fillStyle = muted;

    for (let i = 0; i <= 4; i += 1) {
      const y = pad.top + ((height - pad.top - pad.bottom) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    }

    if (!chartItems.length) {
      ctx.textAlign = 'center';
      ctx.fillText('Ajoute une première mesure', width / 2, height / 2);
      return;
    }

    const values = chartItems.map((item) => displayWeightValue(weightValueKg(item)));
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const margin = Math.max(.5, (max - min) * .25);
    min -= margin; max += margin;

    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const xFor = (index) => chartItems.length === 1 ? pad.left + plotW / 2 : pad.left + (index / (chartItems.length - 1)) * plotW;
    const yFor = (value) => pad.top + (1 - (value - min) / (max - min)) * plotH;

    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i += 1) {
      const value = max - ((max - min) / 4) * i;
      const y = pad.top + (plotH / 4) * i;
      ctx.fillText(value.toFixed(1).replace('.', ','), pad.left - 7, y + 4);
    }

    if (chartItems.length > 1) {
      const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
      gradient.addColorStop(0, 'rgba(79,127,115,.22)');
      gradient.addColorStop(1, 'rgba(79,127,115,0)');
      ctx.beginPath();
      chartItems.forEach((item, index) => {
        const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
        index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(xFor(chartItems.length - 1), height - pad.bottom);
      ctx.lineTo(xFor(0), height - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath();
    chartItems.forEach((item, index) => {
      const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    chartItems.forEach((item, index) => {
      const x = xFor(index); const y = yFor(displayWeightValue(weightValueKg(item)));
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = surface; ctx.fill();
      ctx.strokeStyle = primary; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = muted; ctx.textAlign = 'center';
      const date = new Date(`${item.date}T12:00:00`);
      ctx.fillText(new Intl.DateTimeFormat(appLocale(), { month: 'short' }).format(date), x, height - 10);
    });
  }

  function renderMemories() {
    const pet = activePet();
    const items = petItems('memories').sort((a, b) => b.date.localeCompare(a.date));
    return `
      <div class="page-stack">
        ${pageHeader('Souvenirs', `Les moments qui racontent la vie de ${escapeHtml(pet.name)}.`, 'memory')}
        <article class="card card-pad">
          <div class="card-title-row"><h2>Journal de vie</h2><span class="summary-note">${items.length} souvenir${items.length > 1 ? 's' : ''}</span></div>
          <div class="memory-grid" style="margin-top:14px">
            ${items.length ? items.map((item) => `
              <button class="memory-tile" data-memory-id="${item.id}">
                ${imageTag(item.image, '', item.title)}
                <div class="memory-tile-body"><h3>${item.favorite ? '♥ ' : ''}${escapeHtml(item.title)}</h3><p>${formatDate(item.date, { short: true })}</p></div>
              </button>`).join('') : `<div style="grid-column:1/-1">${emptyList('Aucun souvenir enregistré.')}</div>`}
          </div>
        </article>
      </div>`;
  }

  function renderAnimals() {
    return `
      <div class="page-stack">
        ${pageHeader('Mes animaux', 'Chaque compagnon possède son propre carnet.', 'pet')}
        ${data.pets.length ? `<div class="list">
          ${data.pets.map((pet) => `
            <article class="card pet-list-card ${pet.id === data.activePetId ? 'active' : ''}">
              ${imageTag(pet.image, '', `Photo de ${pet.name}`)}
              <div><p class="list-title">${escapeHtml(pet.name)}</p><p class="list-subtitle">${escapeHtml(petTypeLabel(pet))} · ${ageText(pet.birthDate)}</p></div>
              <button class="secondary-button" data-select-pet="${pet.id}">${pet.id === data.activePetId ? 'Actif' : 'Choisir'}</button>
            </article>`).join('')}
        </div>` : `<article class="card empty-state"><div style="font-size:2.6rem">🐾</div><strong>Aucun compagnon</strong><p>Ajoute ton premier compagnon pour créer son carnet de vie.</p><button class="primary-button" data-add="pet">Ajouter un nouveau compagnon</button></article>`}
      </div>`;
  }

  function renderPetProfile() {
    const pet = activePet();
    if (!pet) return renderNoPet();
    const lastWeight = latestByDate(petItems('weights'));
    return `
      <div class="page-stack">
        <div class="page-header"><div><p class="eyebrow">Profil</p><h1>${escapeHtml(pet.name)}</h1><p>Les informations essentielles de son dossier.</p></div><button class="floating-page-button" data-action="edit-pet">Modifier</button></div>
        <article class="card pet-card">${imageTag(pet.image, 'pet-avatar', `Photo de ${pet.name}`)}<div><h2 class="pet-name">${escapeHtml(pet.name)}</h2><p class="pet-meta">${escapeHtml(petTypeLabel(pet))}</p></div></article>
        <article class="card card-pad">
          <div class="profile-grid">
            ${profileRow('Date de naissance', formatDate(pet.birthDate))}
            ${profileRow('Âge', ageText(pet.birthDate))}
            ${profileRow('Sexe', pet.sex || 'Non renseigné')}
            ${profileRow('Poids actuel', lastWeight ? formatWeight(weightValueKg(lastWeight), 2) : 'Non renseigné')}
            ${profileRow('Couleur', pet.color || 'Non renseignée')}
            ${profileRow('Identification', pet.identification || 'Non renseignée')}
            ${profileRow('Allergies', pet.allergies || 'Non renseignées')}
            ${profileRow('Informations importantes', pet.importantInfo || 'Aucune')}
          </div>
        </article>
        <article class="card card-pad danger-zone">
          <div><p class="eyebrow danger-eyebrow">Gestion du profil</p><h2>Supprimer ${escapeHtml(pet.name)}</h2><p>Cette action retire aussi son carnet de santé, ses dépenses, ses poids et ses souvenirs.</p></div>
          <button class="danger-button" data-action="request-delete-pet">Supprimer cet animal</button>
        </article>
      </div>`;
  }

  function profileRow(label, value) {
    return `<div class="profile-row"><span class="profile-label">${label}</span><span class="profile-value">${escapeHtml(value)}</span></div>`;
  }


  function renderSettings() {
    const user = window.AnimoaAuth?.getUser?.();
    const cloudEnabled = window.AnimoaCloud?.available?.();
    return `
      <div class="page-stack">
        <div class="page-header"><div><p class="eyebrow">Application</p><h1>Paramètres</h1><p>Seulement les réglages réellement utiles.</p></div></div>
        <article class="card card-pad settings-section">
          <div class="card-title-row"><div><p class="eyebrow">Préférences</p><h2>Affichage et unités</h2></div></div>
          <div class="form-grid settings-grid">
            <div class="form-row"><label for="languageSetting">Langue</label><select id="languageSetting"><option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>Français</option><option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option></select></div>
            <div class="form-row"><label for="themeSetting">Apparence</label><select id="themeSetting"><option value="system" ${settings.theme === 'system' ? 'selected' : ''}>Système</option><option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Clair</option><option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Sombre</option></select></div>
            <div class="form-row"><label for="currencySetting">Devise</label><select id="currencySetting"><option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>Euro (€)</option><option value="CHF" ${settings.currency === 'CHF' ? 'selected' : ''}>Franc suisse (CHF)</option><option value="CAD" ${settings.currency === 'CAD' ? 'selected' : ''}>Dollar canadien (CAD)</option></select></div>
            <div class="form-row"><label for="weightSetting">Unité de poids</label><select id="weightSetting"><option value="kg" ${settings.weightUnit === 'kg' ? 'selected' : ''}>Kilogrammes (kg)</option><option value="lb" ${settings.weightUnit === 'lb' ? 'selected' : ''}>Livres (lb)</option></select></div>
            <div class="button-row"><button class="primary-button" data-action="save-settings">Enregistrer</button></div>
          </div>
        </article>
        <article class="card card-pad account-card">
          <img src="assets/animoa-icon-official.png" alt="" class="account-logo" />
          <div class="account-copy"><p class="eyebrow">Compte</p><h2>${escapeHtml(user?.email || (window.AnimoaAuth?.isLocalPreview?.() ? 'Mode local de prévisualisation' : 'Animoa'))}</h2><p>${cloudEnabled ? 'Les données de ce compte sont synchronisées avec Supabase.' : 'Les données restent uniquement dans ce navigateur.'}</p><span class="account-sync ${syncState}">${cloudEnabled ? 'Synchronisation sécurisée activée' : 'Mode local de prévisualisation'}</span></div>
          <button class="secondary-button" data-action="logout">Se déconnecter</button>
        </article>
        <article class="card card-pad danger-zone">
          <div><p class="eyebrow danger-eyebrow">Données enregistrées</p><h2>Effacer toutes les données</h2><p>Cette action supprime le carnet et les photos de ce compte.</p></div>
          <button class="danger-button" data-action="reset-data">Effacer toutes les données</button>
        </article>
        <div class="settings-note"><img src="assets/animoa-wordmark-official.png" alt="Animoa" /><p><strong>Animoa</strong><br />Toute sa vie, près de vous.</p></div>
      </div>`;
  }

  function pageHeader(title, subtitle, addType) {
    return `<div class="page-header"><div><p class="eyebrow">${title === 'Dépenses' ? 'Budget' : title === 'Souvenirs' ? 'Journal de vie' : 'Carnet de vie'}</p><h1>${title}</h1><p>${subtitle}</p></div><button class="floating-page-button" data-add="${addType}">Ajouter</button></div>`;
  }

  function renderNoPet() {
    return `<div class="page-stack"><div class="page-header"><div><p class="eyebrow">Bienvenue</p><h1>Ajoute ton premier compagnon</h1><p>Animoa commencera par créer son carnet de vie.</p></div></div><article class="card empty-state"><div style="font-size:2.6rem">🐾</div><strong>Aucun compagnon</strong><p>Quelques informations suffisent pour commencer.</p><button class="primary-button" data-add="pet">Ajouter un nouveau compagnon</button></article></div>`;
  }

  function emptyList(message) {
    return `<div class="empty-state"><div style="font-size:1.8rem">🐾</div><strong>Rien à afficher</strong><p>${escapeHtml(message)}</p></div>`;
  }

  function openDrawer() {
    clearTimeout(drawerCloseTimer);
    drawerCloseTimer = null;
    drawerBackdrop.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeDrawer() {
    clearTimeout(drawerCloseTimer);
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerCloseTimer = setTimeout(() => {
      drawerBackdrop.hidden = true;
      drawerCloseTimer = null;
    }, 220);
  }

  function openModal(title, body, eyebrow = 'Ajouter', options = {}) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
    // Règle globale Animoa : toutes les fenêtres s'ouvrent au centre de l'écran.
    modal.classList.remove('modal-centered', 'modal-sensitive');
    modal.classList.add('modal-centered');
    if (options.sensitive) modal.classList.add('modal-sensitive');
    modalTitle.textContent = title;
    modalEyebrow.textContent = eyebrow;
    modalBody.innerHTML = body;
    translateTree(modal);
    hydrateImages(modalBody);
    modalBackdrop.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      modal.classList.add('open');
      syncHealthDateRules(false);
      syncPetWeightGuide();
    });
  }

  function closeModal() {
    clearTimeout(modalCloseTimer);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalCloseTimer = setTimeout(() => {
      modalBackdrop.hidden = true;
      modalBody.innerHTML = '';
      modal.classList.remove('modal-centered', 'modal-sensitive');
      modalCloseTimer = null;
    }, 220);
  }

  function openAddMenu() {
    openModal('Que veux-tu ajouter ?', `
      <div class="add-choice-grid">
        <button class="add-choice" data-add="health"><span>🩺</span>Santé</button>
        <button class="add-choice" data-add="expense"><span>€</span>Dépense</button>
        <button class="add-choice" data-add="weight"><span>⚖️</span>Poids</button>
        <button class="add-choice" data-add="memory"><span>📷</span>Souvenir</button>
        <button class="add-choice" data-add="pet"><span>🐾</span>Compagnon</button>
      </div>
    `, 'Ajout rapide');
  }

  function openAddForm(type) {
    if (type !== 'pet' && !activePet()) {
      showToast('Ajoute d’abord un animal.');
      type = 'pet';
    }
    const forms = {
      health: healthForm,
      expense: expenseForm,
      weight: weightForm,
      memory: memoryForm,
      pet: petForm
    };
    const titles = { health: 'Information de santé', expense: 'Nouvelle dépense', weight: 'Nouveau poids', memory: 'Nouveau souvenir', pet: 'Nouvel animal' };
    openModal(titles[type], forms[type](), 'Ajouter');
  }

  function optionSelected(value, expected) {
    return value === expected ? 'selected' : '';
  }

  function healthForm(item = null) {
    const editing = Boolean(item);
    const status = item?.status || 'planned';
    const selectedType = item ? normalizeHealthType(item.type) : 'Vaccin';
    const date = item?.date || todayIso();
    const min = status === 'planned' ? todayIso() : '';
    const max = status === 'done' ? todayIso() : '';
    return `<form id="healthForm" class="form-grid" data-editing="${item?.id || ''}">
      <div class="form-row"><label for="healthType">Type</label><select id="healthType" name="type" required>${['Vaccin','Rendez-vous','Traitement','Médicament','Analyse','Document','Autre'].map((type) => `<option value="${type}" ${optionSelected(selectedType, type)}>${type}</option>`).join('')}</select></div>
      <div class="form-row"><label for="healthTitle">Titre</label><input id="healthTitle" name="title" required value="${escapeHtml(item?.title || '')}" placeholder="Ex. Rappel annuel" /></div>
      <div class="form-columns"><div class="form-row"><label for="healthDate">Date</label><input id="healthDate" name="date" type="date" value="${date}" ${min ? `min="${min}"` : ''} ${max ? `max="${max}"` : ''} required /><span id="healthDateHelp" class="form-help"></span></div><div class="form-row"><label for="healthStatus">État</label><select id="healthStatus" name="status"><option value="planned" ${optionSelected(status, 'planned')}>À venir</option><option value="done" ${optionSelected(status, 'done')}>Effectué</option></select></div></div>
      <div class="form-row"><label for="healthProfessional">Vétérinaire ou professionnel</label><input id="healthProfessional" name="professional" value="${escapeHtml(item?.professional || '')}" placeholder="Facultatif" /></div>
      <div class="form-row"><label for="healthNote">Note</label><textarea id="healthNote" name="note" placeholder="Informations utiles">${escapeHtml(item?.note || '')}</textarea></div>
      ${filePicker('healthAttachment', 'attachment', Boolean(item?.attachment), item?.attachment ? 'Laisse vide pour conserver le fichier actuel.' : 'Ajoute une image ou un document utile.', 'image/*,.pdf,.doc,.docx')}
      <label class="checkbox-row"><input name="reminder" type="checkbox" ${item ? (item.reminder ? 'checked' : '') : 'checked'} /> Créer un rappel dans Animoa</label>
      <button class="primary-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer'}</button>
    </form>`;
  }

  function expenseForm(item = null) {
    const editing = Boolean(item);
    const categories = ['Nourriture','Vétérinaire','Médicaments','Toilettage','Jouets','Accessoires','Assurance','Autre'];
    return `<form id="expenseForm" class="form-grid" data-editing="${item?.id || ''}">
      <div class="form-columns"><div class="form-row"><label for="expenseAmount">Montant</label><input id="expenseAmount" name="amount" type="number" min="0" step="0.01" inputmode="decimal" required value="${item?.amount ?? ''}" placeholder="0,00" /></div><div class="form-row"><label for="expenseDate">Date</label><input id="expenseDate" name="date" type="date" value="${item?.date || todayIso()}" max="${todayIso()}" required /></div></div>
      <div class="form-row"><label for="expenseCategory">Catégorie</label><select id="expenseCategory" name="category">${categories.map((category) => `<option value="${category}" ${optionSelected(item?.category, category)}>${category}</option>`).join('')}</select></div>
      <div class="form-row"><label for="expenseNote">Description</label><input id="expenseNote" name="note" value="${escapeHtml(item?.note || '')}" placeholder="Ex. Croquettes" /></div>
      <button class="primary-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer la dépense'}</button>
    </form>`;
  }

  function weightForm(item = null) {
    const pet = activePet();
    const limits = displayWeightLimits(pet?.species || 'Autre');
    const value = item ? displayWeightValue(weightValueKg(item)) : '';
    return `<form id="weightForm" class="form-grid" data-editing="${item?.id || ''}">
      <div class="form-columns"><div class="form-row"><label for="weightValue">Poids (${settings.weightUnit})</label><input id="weightValue" name="value" type="number" min="${limits.min}" max="${limits.max}" step="${limits.step}" inputmode="decimal" required value="${value ?? ''}" placeholder="0,0" /><span class="form-help">Pour un ${limits.label}, valeur admise : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}.</span></div><div class="form-row"><label for="weightDate">Date</label><input id="weightDate" name="date" type="date" value="${item?.date || todayIso()}" max="${todayIso()}" required /></div></div>
      <div class="form-row"><label for="weightNote">Note</label><input id="weightNote" name="note" value="${escapeHtml(item?.note || '')}" placeholder="Facultatif" /></div>
      <button class="primary-button" type="submit">${item ? 'Enregistrer les modifications' : 'Enregistrer le poids'}</button>
    </form>`;
  }

  function filePicker(fieldId, name, hasExisting, helpText, accept = "image/*") {
    const isAttachment = name === 'attachment';
    const actionLabel = isAttachment
      ? (hasExisting ? 'Remplacer le fichier ou l’image' : 'Ajouter un fichier ou une image')
      : (hasExisting ? 'Remplacer la photo' : 'Ajouter une photo');
    return `<div class="form-row file-picker-row"><label>${name === 'attachment' ? 'Fichier ou image' : 'Photo'}</label><div class="file-picker"><input class="file-picker-input" id="${fieldId}" name="${name}" type="file" accept="${accept}" /><label class="file-picker-button" for="${fieldId}"><img src="assets/animoa-icon-official.png" alt="" /><span>${actionLabel}</span></label><span class="file-picker-name">Aucun fichier sélectionné</span></div><span class="form-help">${helpText}</span></div>`;
  }

  function memoryForm(item = null) {
    const editing = Boolean(item);
    const types = ['Moment important','Première fois','Anniversaire','Anecdote'];
    return `<form id="memoryForm" class="form-grid" data-editing="${item?.id || ''}">
      <div class="form-row"><label for="memoryTitle">Titre</label><input id="memoryTitle" name="title" required value="${escapeHtml(item?.title || '')}" placeholder="Ex. Première baignade" /></div>
      <div class="form-columns"><div class="form-row"><label for="memoryDate">Date</label><input id="memoryDate" name="date" type="date" value="${item?.date || todayIso()}" max="${todayIso()}" required /></div><div class="form-row"><label for="memoryType">Type</label><select id="memoryType" name="type">${types.map((type) => `<option value="${type}" ${optionSelected(item?.type, type)}>${type}</option>`).join('')}</select></div></div>
      ${filePicker('memoryPhoto', 'photo', editing, editing ? 'Laisse vide pour conserver la photo actuelle.' : 'La photo est automatiquement allégée puis stockée séparément.')}
      <div class="form-row"><label for="memoryNote">Anecdote</label><textarea id="memoryNote" name="note" placeholder="Raconte ce moment...">${escapeHtml(item?.note || '')}</textarea></div>
      <label class="checkbox-row"><input name="favorite" type="checkbox" ${item?.favorite ? 'checked' : ''} /> Ajouter aux favoris</label>
      <button class="primary-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Enregistrer le souvenir'}</button>
    </form>`;
  }

  function petForm(pet = null) {
    const editing = Boolean(pet);
    const latestWeight = pet ? latestByDate(data.weights.filter((item) => item.petId === pet.id)) : null;
    const currentWeight = latestWeight ? displayWeightValue(weightValueKg(latestWeight)) : '';
    const species = pet?.species || 'Chien';
    const limits = displayWeightLimits(species);
    return `<form id="petForm" class="form-grid" data-editing="${editing ? pet.id : ''}" data-weight-id="${latestWeight?.id || ''}" data-original-weight="${currentWeight ?? ''}" data-original-weight-date="${latestWeight?.date || ''}">
      <div class="form-row"><label for="petName">Nom</label><input id="petName" name="name" required value="${escapeHtml(pet?.name || '')}" placeholder="Ex. Milo" /></div>
      <div class="form-columns desktop-three"><div class="form-row"><label for="petSpecies">Espèce</label><select id="petSpecies" name="species"><option value="Chien" ${optionSelected(species, 'Chien')}>Chien</option><option value="Chat" ${optionSelected(species, 'Chat')}>Chat</option><option value="Lapin" ${optionSelected(species, 'Lapin')}>Lapin</option><option value="Oiseau" ${optionSelected(species, 'Oiseau')}>Oiseau</option><option value="Autre" ${optionSelected(species, 'Autre')}>Autre</option></select></div><div class="form-row"><label for="petBreed">Race, variété ou type</label><input id="petBreed" name="breed" value="${escapeHtml(pet?.breed || '')}" /></div><div class="form-row"><label for="petSex">Sexe</label><select id="petSex" name="sex"><option value="Non renseigné" ${optionSelected(pet?.sex || 'Non renseigné', 'Non renseigné')}>Non renseigné</option><option value="Femelle" ${optionSelected(pet?.sex, 'Femelle')}>Femelle</option><option value="Mâle" ${optionSelected(pet?.sex, 'Mâle')}>Mâle</option></select></div></div>
      <div class="form-columns"><div class="form-row"><label for="petBirth">Date de naissance</label><input id="petBirth" name="birthDate" type="text" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="JJ/MM/AAAA" value="${escapeHtml(isoDateToFrench(pet?.birthDate || ''))}" aria-describedby="petBirthHelp" /><span id="petBirthHelp" class="form-help">Écris directement les 8 chiffres, par exemple 15062009.</span></div><div class="form-row"><label for="petColor">Couleur</label><input id="petColor" name="color" value="${escapeHtml(pet?.color || '')}" /></div></div>
      <div class="weight-profile-box"><div><strong>Poids actuel</strong><span>Cette valeur reste liée à l’historique de poids.</span></div><div class="form-columns"><div class="form-row"><label for="petCurrentWeight">Poids (${settings.weightUnit})</label><input id="petCurrentWeight" name="currentWeight" type="number" min="${limits.min}" max="${limits.max}" step="${limits.step}" value="${currentWeight ?? ''}" placeholder="Facultatif" /></div><div class="form-row"><label for="petCurrentWeightDate">Date de pesée</label><input id="petCurrentWeightDate" name="currentWeightDate" type="date" max="${todayIso()}" value="${latestWeight?.date || todayIso()}" /></div></div><span id="petWeightGuide" class="form-help">Pour un ${limits.label} : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}.</span></div>
      ${filePicker('petPhoto', 'photo', editing, 'Laisse vide pour conserver la photo actuelle. La nouvelle photo sera automatiquement allégée.')}
      <div class="form-row"><label for="petIdentification">Identification</label><input id="petIdentification" name="identification" value="${escapeHtml(pet?.identification || '')}" placeholder="Puce, tatouage..." /></div>
      <div class="form-row"><label for="petAllergies">Allergies</label><input id="petAllergies" name="allergies" value="${escapeHtml(pet?.allergies || '')}" /></div>
      <div class="form-row"><label for="petImportant">Informations importantes</label><textarea id="petImportant" name="importantInfo">${escapeHtml(pet?.importantInfo || '')}</textarea></div>
      <button class="primary-button" type="submit">${editing ? 'Enregistrer les modifications' : 'Créer le profil'}</button>
    </form>`;
  }

  async function handleFormSubmit(form) {
    const formData = new FormData(form);
    const snapshot = clone(data);
    const createdMediaRefs = [];
    const submitButton = form.querySelector('[type="submit"]');
    const originalLabel = submitButton?.textContent;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Enregistrement…'; }
    try {
      if (form.id === 'healthForm') {
        const status = String(formData.get('status'));
        const date = String(formData.get('date'));
        validateHealthDate(status, date);
        const existing = data.health.find((item) => item.id === form.dataset.editing);
        const attachmentFile = form.querySelector('[name="attachment"]')?.files?.[0];
        const oldAttachment = existing?.attachment;
        let attachment = oldAttachment || '';
        if (attachmentFile) {
          attachment = await fileToAttachmentRef(attachmentFile);
          if (attachment && attachment !== oldAttachment) createdMediaRefs.push(attachment);
        }
        const record = {
          petId: activePet().id,
          type: normalizeHealthType(formData.get('type')),
          title: requiredText(formData.get('title'), 'un titre'),
          date,
          status,
          professional: String(formData.get('professional') || '').trim(),
          note: String(formData.get('note') || '').trim(),
          attachment,
          attachmentName: attachmentFile?.name || existing?.attachmentName || '',
          attachmentType: attachmentFile ? detectedFileType(attachmentFile) : (existing?.attachmentType || ''),
          reminder: formData.get('reminder') === 'on'
        };
        if (existing) Object.assign(existing, record); else data.health.push({ id: uid('health'), ...record });
        currentHealthFilter = record.type;
        saveData();
        if (existing && attachmentFile && oldAttachment !== attachment) await deleteMediaIfUnused(oldAttachment);
        closeModal(); setPage('health'); showToast(existing ? 'Information de santé modifiée.' : 'Information de santé enregistrée.');
      }

      if (form.id === 'expenseForm') {
        const date = String(formData.get('date'));
        validatePastOrToday(date, 'La date de la dépense');
        const amount = Number(formData.get('amount'));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error('Indique un montant supérieur à zéro.');
        const record = { petId: activePet().id, amount, date, category: formData.get('category'), note: String(formData.get('note') || '').trim() };
        const existing = data.expenses.find((item) => item.id === form.dataset.editing);
        if (existing) Object.assign(existing, record); else data.expenses.push({ id: uid('expense'), ...record });
        saveData(); closeModal(); setPage('expenses'); showToast(existing ? 'Dépense modifiée.' : 'Dépense enregistrée.');
      }

      if (form.id === 'weightForm') {
        const date = String(formData.get('date'));
        validatePastOrToday(date, 'La date de pesée');
        const valueKg = inputWeightToKg(formData.get('value'));
        validateWeightForSpecies(valueKg, activePet().species);
        const record = { petId: activePet().id, valueKg, date, note: String(formData.get('note') || '').trim() };
        const existing = data.weights.find((item) => item.id === form.dataset.editing);
        if (existing) Object.assign(existing, record); else data.weights.push({ id: uid('weight'), ...record });
        saveData(); closeModal(); setPage('weight'); showToast(existing ? 'Mesure de poids modifiée.' : 'Poids enregistré.');
      }

      if (form.id === 'memoryForm') {
        const date = String(formData.get('date'));
        validatePastOrToday(date, 'La date du souvenir');
        const existing = data.memories.find((item) => item.id === form.dataset.editing);
        const file = form.querySelector('[name="photo"]').files[0];
        const oldImage = existing?.image;
        const image = await fileToMediaRef(file) || oldImage || placeholderImage;
        if (file && image !== oldImage) createdMediaRefs.push(image);
        const record = { petId: activePet().id, title: requiredText(formData.get('title'), 'un titre'), date, type: formData.get('type'), note: String(formData.get('note') || '').trim(), image, favorite: formData.get('favorite') === 'on' };
        if (existing) Object.assign(existing, record); else data.memories.push({ id: uid('memory'), ...record });
        saveData();
        if (existing && file && oldImage !== image) await deleteMediaIfUnused(oldImage);
        closeModal(); setPage('memories'); showToast(existing ? 'Souvenir modifié.' : 'Souvenir enregistré.');
      }

      if (form.id === 'petForm') {
        const editingId = form.dataset.editing;
        const existing = editingId ? data.pets.find((pet) => pet.id === editingId) : null;
        const file = form.querySelector('[name="photo"]').files[0];
        const oldImage = existing?.image;
        const image = await fileToMediaRef(file) || oldImage || placeholderImage;
        if (file && image !== oldImage) createdMediaRefs.push(image);
        const species = String(formData.get('species'));
        const birthDate = parseFrenchDate(formData.get('birthDate'), 'La date de naissance');
        validatePastOrToday(birthDate, 'La date de naissance');
        const petData = {
          id: existing?.id || uid('pet'),
          name: requiredText(formData.get('name'), 'le nom de l’animal'), species, breed: String(formData.get('breed') || '').trim(),
          birthDate, sex: formData.get('sex'), color: String(formData.get('color') || '').trim(),
          identification: String(formData.get('identification') || '').trim(), allergies: String(formData.get('allergies') || '').trim(),
          importantInfo: String(formData.get('importantInfo') || '').trim(), image, createdAt: existing?.createdAt || todayIso()
        };
        if (existing) Object.assign(existing, petData); else data.pets.push(petData);

        const weightRaw = String(formData.get('currentWeight') || '').trim();
        if (weightRaw) {
          const valueKg = inputWeightToKg(weightRaw);
          validateWeightForSpecies(valueKg, species);
          const weightDate = String(formData.get('currentWeightDate') || todayIso());
          validatePastOrToday(weightDate, 'La date de pesée');
          const weightId = form.dataset.weightId;
          const existingWeight = weightId ? data.weights.find((item) => item.id === weightId && item.petId === petData.id) : null;
          const record = { petId: petData.id, valueKg, date: weightDate, note: existingWeight?.note || 'Poids actuel indiqué dans le profil' };
          if (existingWeight) Object.assign(existingWeight, record); else data.weights.push({ id: uid('weight'), ...record });
        }

        data.activePetId = petData.id;
        saveData();
        if (existing && file && oldImage !== image) await deleteMediaIfUnused(oldImage);
        closeModal(); setPage('pet'); showToast(existing ? 'Profil modifié.' : 'Animal ajouté.');
      }
    } catch (error) {
      data = snapshot;
      const snapshotRefs = allImageRefsFrom(snapshot);
      for (const ref of createdMediaRefs) {
        if (!snapshotRefs.has(ref)) await deleteMediaRef(ref);
      }
      renderPage();
      showToast(error.message || 'Une erreur est survenue.');
    } finally {
      if (submitButton?.isConnected) { submitButton.disabled = false; submitButton.textContent = originalLabel; }
    }
  }

  function requestDeletePet() {
    const pet = activePet();
    if (!pet) return;
    const counts = {
      santé: petItems('health').length,
      dépenses: petItems('expenses').length,
      poids: petItems('weights').length,
      souvenirs: petItems('memories').length
    };
    openModal(`Supprimer ${pet.name} ?`, `
      <div class="delete-confirmation">
        <div class="delete-warning-icon">!</div>
        <p><strong>Cette suppression est définitive sur cet appareil.</strong></p>
        <p>Seront supprimés : ${counts.santé} élément${counts.santé > 1 ? 's' : ''} de santé, ${counts.dépenses} dépense${counts.dépenses > 1 ? 's' : ''}, ${counts.poids} mesure${counts.poids > 1 ? 's' : ''} de poids et ${counts.souvenirs} souvenir${counts.souvenirs > 1 ? 's' : ''}.</p>
        <div class="delete-actions">
          <button class="secondary-button" data-action="close-modal">Annuler</button>
          <button class="danger-button" data-action="confirm-delete-pet" data-pet-id="${pet.id}">Oui, supprimer ${escapeHtml(pet.name)}</button>
        </div>
      </div>
    `, 'Action sensible', { sensitive: true });
  }

  async function deletePet(petId) {
    const pet = data.pets.find((item) => item.id === petId);
    if (!pet) return showToast('Cet animal n’existe plus.');
    const snapshot = clone(data);
    const memoriesToDelete = data.memories.filter((item) => item.petId === petId);
    const healthToDelete = data.health.filter((item) => item.petId === petId);
    const mediaRefs = [pet.image, ...memoriesToDelete.map((item) => item.image), ...healthToDelete.map((item) => item.attachment)]
      .filter((ref) => typeof ref === 'string' && (ref.startsWith(MEDIA_PREFIX) || ref.startsWith(CLOUD_PREFIX)));

    try {
      data.pets = data.pets.filter((item) => item.id !== petId);
      data.health = data.health.filter((item) => item.petId !== petId);
      data.expenses = data.expenses.filter((item) => item.petId !== petId);
      data.weights = data.weights.filter((item) => item.petId !== petId);
      data.memories = data.memories.filter((item) => item.petId !== petId);
      data.activePetId = data.pets[0]?.id || null;
      currentHealthFilter = 'Tous';
      saveData();
      closeModal();
      currentPage = 'animals';
      renderNavigation();
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const stillUsed = allImageRefsFrom(data);
      await Promise.all(mediaRefs.filter((ref) => !stillUsed.has(ref)).map(deleteMediaRef));
      showToast(`${pet.name} a été supprimé.`);
    } catch (error) {
      data = snapshot;
      renderNavigation();
      renderPage();
      showToast(error.message || 'Suppression impossible.');
    }
  }

  function showHealthRecord(recordId) {
    const item = data.health.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette information n’existe plus.');
    const status = item.status === 'planned' ? (item.date < todayIso() ? 'En retard' : 'À venir') : 'Effectué';
    openModal(item.title, `
      <div class="record-detail">
        <p class="eyebrow">${escapeHtml(normalizeHealthType(item.type))}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong><span>État</span><strong>${status}</strong><span>Professionnel</span><strong>${escapeHtml(item.professional || 'Non renseigné')}</strong></div>
        <p>${escapeHtml(item.note || 'Aucune note.')}</p>
        ${item.attachment ? `<button class="attachment-preview" data-action="open-attachment" data-image-ref="${escapeHtml(item.attachment)}" data-file-type="${escapeHtml(item.attachmentType || '')}" data-file-name="${escapeHtml(item.attachmentName || 'Fichier joint')}"><span>${item.attachmentType?.startsWith('image/') ? '🖼️' : '📎'}</span><span>${escapeHtml(item.attachmentName || 'Voir le fichier ou l’image')}</span></button>` : ''}
        <div class="record-detail-actions"><button class="secondary-button" data-action="edit-health-record" data-record-id="${item.id}">Modifier</button><button class="danger-button" data-action="request-delete-record" data-collection="health" data-record-id="${item.id}" data-label="cette information de santé" data-return-page="health">Supprimer</button></div>
      </div>`, 'Santé');
  }

  function showWeightRecord(recordId) {
    const item = data.weights.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette mesure n’existe plus.');
    openModal('Mesure de poids', `
      <div class="record-detail">
        <p class="record-big-value">${formatWeight(weightValueKg(item), 2)}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong><span>Note</span><strong>${escapeHtml(item.note || 'Aucune')}</strong></div>
        <div class="record-detail-actions"><button class="secondary-button" data-action="edit-weight-record" data-record-id="${item.id}">Modifier</button><button class="danger-button" data-action="request-delete-record" data-collection="weights" data-record-id="${item.id}" data-label="cette mesure de poids" data-return-page="weight">Supprimer</button></div>
      </div>`, 'Poids');
  }

  function showExpenseRecord(recordId) {
    const item = data.expenses.find((record) => record.id === recordId && record.petId === activePet()?.id);
    if (!item) return showToast('Cette dépense n’existe plus.');
    openModal(item.category, `
      <div class="record-detail">
        <p class="record-big-value">${formatCurrency(item.amount)}</p>
        <div class="detail-grid"><span>Date</span><strong>${formatDate(item.date)}</strong><span>Description</span><strong>${escapeHtml(item.note || 'Aucune')}</strong></div>
        <div class="record-detail-actions"><button class="secondary-button" data-action="edit-expense-record" data-record-id="${item.id}">Modifier</button><button class="danger-button" data-action="request-delete-record" data-collection="expenses" data-record-id="${item.id}" data-label="cette dépense" data-return-page="expenses">Supprimer</button></div>
      </div>`, 'Dépense');
  }

  function requestDeleteRecord(collection, recordId, label, returnPage) {
    openModal('Confirmer la suppression', `
      <div class="delete-confirmation"><div class="delete-warning-icon">!</div><p>Supprimer définitivement ${escapeHtml(label || 'cet élément')} ?</p><div class="delete-actions"><button class="secondary-button" data-action="close-modal">Annuler</button><button class="danger-button" data-action="confirm-delete-record" data-collection="${collection}" data-record-id="${recordId}" data-return-page="${returnPage}">Oui, supprimer</button></div></div>`, 'Action sensible', { sensitive: true });
  }

  async function deleteRecord(collection, recordId, returnPage) {
    if (!['health', 'expenses', 'weights', 'memories'].includes(collection)) return;
    const item = data[collection].find((record) => record.id === recordId);
    if (!item) return showToast('Cet élément n’existe plus.');
    const snapshot = clone(data);
    try {
      data[collection] = data[collection].filter((record) => record.id !== recordId);
      saveData();
      const mediaToDelete = [item.image, item.attachment].filter(Boolean);
      for (const ref of mediaToDelete) if (!allImageRefsFrom(data).has(ref)) await deleteMediaRef(ref);
      closeModal();
      setPage(returnPage || currentPage);
      showToast('Élément supprimé.');
    } catch (error) {
      data = snapshot;
      showToast(error.message || 'Suppression impossible.');
    }
  }

  function syncHealthDateRules(adjustValue = false) {
    const status = document.getElementById('healthStatus');
    const date = document.getElementById('healthDate');
    const help = document.getElementById('healthDateHelp');
    if (!status || !date) return;
    const today = todayIso();
    if (status.value === 'planned') {
      date.min = today;
      date.removeAttribute('max');
      if (adjustValue && date.value < today) date.value = today;
      if (help) help.textContent = translateText('Une information à venir doit être datée d’aujourd’hui ou plus tard.');
    } else {
      date.max = today;
      date.removeAttribute('min');
      if (adjustValue && date.value > today) date.value = today;
      if (help) help.textContent = translateText('Une information effectuée doit être datée d’aujourd’hui ou d’une date passée.');
    }
  }

  function syncPetWeightGuide() {
    const speciesField = document.getElementById('petSpecies');
    const weightField = document.getElementById('petCurrentWeight');
    const guideField = document.getElementById('petWeightGuide');
    if (!speciesField || !weightField) return;
    const limits = displayWeightLimits(speciesField.value);
    weightField.min = String(limits.min);
    weightField.max = String(limits.max);
    weightField.step = String(limits.step);
    if (guideField) guideField.textContent = translateText(`Pour un ${limits.label} : ${limits.min.toLocaleString(appLocale(), { maximumFractionDigits: 3 })} à ${limits.max.toLocaleString(appLocale(), { maximumFractionDigits: 1 })} ${settings.weightUnit}.`);
  }

  function restoreHealthTabsPosition() {
    const tabs = document.getElementById('healthTabs');
    if (!tabs) return;
    tabs.scrollLeft = healthTabsScrollLeft;
    const active = tabs.querySelector('.tab-chip.active');
    if (active) {
      const activeLeft = active.offsetLeft;
      const activeRight = activeLeft + active.offsetWidth;
      const visibleLeft = tabs.scrollLeft;
      const visibleRight = visibleLeft + tabs.clientWidth;
      if (activeLeft < visibleLeft || activeRight > visibleRight) tabs.scrollLeft = Math.max(0, activeLeft - (tabs.clientWidth - active.offsetWidth) / 2);
    }
    healthTabsScrollLeft = tabs.scrollLeft;
    updateHealthScrollButtons();
  }

  function updateHealthScrollButtons() {
    const tabs = document.getElementById('healthTabs');
    const left = document.querySelector('[data-action="health-scroll-left"]');
    const right = document.querySelector('[data-action="health-scroll-right"]');
    if (!tabs || !left || !right) return;
    left.disabled = tabs.scrollLeft <= 2;
    right.disabled = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 2;
  }

  function scrollHealthTabs(direction) {
    const tabs = document.getElementById('healthTabs');
    if (!tabs) return;
    tabs.scrollBy({ left: direction * Math.max(150, tabs.clientWidth * 0.72), behavior: 'smooth' });
    setTimeout(() => { healthTabsScrollLeft = tabs.scrollLeft; updateHealthScrollButtons(); }, 350);
  }

  function showPetSwitcher() {
    openModal('Choisir un animal', `
      <div class="list">
        ${data.pets.map((pet) => `<button class="card pet-list-card ${pet.id === data.activePetId ? 'active' : ''}" data-select-pet="${pet.id}" style="text-align:left;cursor:pointer" ${pet.id === data.activePetId ? 'aria-current="true"' : ''}>${imageTag(pet.image, '', `Photo de ${pet.name}`)}<div><p class="list-title">${escapeHtml(pet.name)}</p><p class="list-subtitle">${escapeHtml(petTypeLabel(pet))}</p></div><span>${pet.id === data.activePetId ? '✓' : '›'}</span></button>`).join('')}
        <button class="secondary-button paw-action" data-add="pet">Ajouter un animal</button>
      </div>
    `, 'Mes animaux');
  }

  function showReminders() {
    const reminders = upcomingReminders();
    openModal('Rappels à venir', reminders.length ? `<div class="list">${reminders.map(renderHealthItem).join('')}</div>` : emptyList('Aucun rappel à venir.'), 'Notifications');
  }

  function showMemory(memoryId) {
    const memory = data.memories.find((item) => item.id === memoryId);
    if (!memory) return;
    openModal(memory.title, `
      ${imageTag(memory.image, '', memory.title, 'style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:18px;background:var(--primary-light)"')}
      <div style="margin-top:15px"><p class="eyebrow">${escapeHtml(memory.type)}</p><p style="color:var(--muted);font-size:.82rem">${formatDate(memory.date)}</p><p style="line-height:1.55">${escapeHtml(memory.note || 'Aucune anecdote.')}</p><div class="record-detail-actions"><button class="secondary-button" data-action="edit-memory-record" data-record-id="${memory.id}">Modifier</button><button class="danger-button" data-action="request-delete-record" data-collection="memories" data-record-id="${memory.id}" data-label="ce souvenir" data-return-page="memories">Supprimer</button></div></div>
    `, memory.favorite ? 'Souvenir favori' : 'Souvenir');
  }


  function requestResetAnimoa() {
    openModal('Effacer toutes les données ?', `
      <div class="delete-confirmation">
        <div class="delete-warning-icon">!</div>
        <p><strong>Toutes les données locales seront effacées.</strong></p>
        <p>Compagnons, santé, dépenses, poids, souvenirs et photos seront définitivement supprimés de ce navigateur.</p>
        <div class="delete-actions">
          <button class="secondary-button" data-action="close-modal">Annuler</button>
          <button class="danger-button" data-action="confirm-reset-data">Oui, tout effacer</button>
        </div>
      </div>
    `, 'Action sensible', { sensitive: true });
  }

  async function resetAnimoa() {
    const snapshot = clone(data);
    const settingsSnapshot = { ...settings };
    const mediaRefsToDelete = [...allImageRefsFrom(data)];
    try {
      data = normalizeData(clone(defaultData));
      settings = normalizeSettings({ language: settings.language, theme: settings.theme });
      saveData();
      saveSettings();
      await clearMediaStore(mediaRefsToDelete);
      closeModal();
      setPage('home');
      showToast('Toutes les données ont été effacées.');
    } catch (error) {
      data = snapshot;
      settings = settingsSnapshot;
      try { saveData(); saveSettings(); } catch {}
      showToast(error.message || 'Suppression des données impossible.');
    }
  }

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button, [data-page], [data-add]');
    if (!target) return;

    const page = target.dataset.page;
    const action = target.dataset.action;
    const add = target.dataset.add;
    const filter = target.dataset.healthFilter;

    if (filter) {
      const tabs = document.getElementById('healthTabs');
      healthTabsScrollLeft = tabs?.scrollLeft || healthTabsScrollLeft;
      applyHealthFilter(HEALTH_TYPES.includes(filter) ? filter : normalizeHealthType(filter));
      return;
    }

    if (page) setPage(page);
    if (add) openAddForm(add);

    if (action === 'open-menu') openDrawer();
    if (action === 'close-menu') closeDrawer();
    if (action === 'open-add') openAddMenu();
    if (action === 'close-modal') closeModal();
    if (action === 'switch-pet') showPetSwitcher();
    if (action === 'show-reminders') showReminders();
    if (action === 'health-scroll-left') scrollHealthTabs(-1);
    if (action === 'health-scroll-right') scrollHealthTabs(1);
    if (action === 'show-health-record') showHealthRecord(target.dataset.recordId);
    if (action === 'show-weight-record') showWeightRecord(target.dataset.recordId);
    if (action === 'show-expense-record') showExpenseRecord(target.dataset.recordId);
    if (action === 'edit-health-record') { const item = data.health.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier une information', healthForm(item), 'Santé'); }
    if (action === 'edit-weight-record') { const item = data.weights.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier le poids', weightForm(item), 'Poids'); }
    if (action === 'edit-expense-record') { const item = data.expenses.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier la dépense', expenseForm(item), 'Dépense'); }
    if (action === 'edit-memory-record') { const item = data.memories.find((record) => record.id === target.dataset.recordId); if (item) openModal('Modifier le souvenir', memoryForm(item), 'Souvenir'); }
    if (action === 'request-delete-record') requestDeleteRecord(target.dataset.collection, target.dataset.recordId, target.dataset.label, target.dataset.returnPage);
    if (action === 'confirm-delete-record') deleteRecord(target.dataset.collection, target.dataset.recordId, target.dataset.returnPage);
    if (action === 'edit-pet') openModal('Modifier le profil', petForm(activePet()), 'Profil');
    if (action === 'request-delete-pet') requestDeletePet();
    if (action === 'confirm-delete-pet') deletePet(target.dataset.petId);
    if (action === 'save-settings') {
      settings.currency = document.getElementById('currencySetting').value;
      settings.weightUnit = document.getElementById('weightSetting').value;
      settings.language = document.getElementById('languageSetting').value;
      settings.theme = document.getElementById('themeSetting').value;
      saveSettings(); renderNavigation(); renderPage(); showToast('Paramètres enregistrés.');
    }
    if (action === 'logout') {
      try { await flushCloudSave(); } catch {}
      try { await window.AnimoaAuth?.signOut?.(); }
      catch (error) { showToast(error.message || 'Déconnexion impossible.'); }
    }
    if (action === 'open-attachment') {
      const ref = target.dataset.imageRef;
      const fileType = target.dataset.fileType || '';
      const fileName = target.dataset.fileName || 'Fichier joint';
      resolveImageRef(ref).then((src) => {
        if (fileType.startsWith('image/') || !fileType) {
          openModal(fileName, `<img src="${escapeHtml(src)}" alt="${escapeHtml(fileName)}" class="attachment-full" />`, 'Santé');
        } else {
          const opened = window.open(src, '_blank', 'noopener,noreferrer');
          if (!opened) showToast('Autorise l’ouverture du fichier dans ton navigateur.');
        }
      });
    }
    if (action === 'reset-data') requestResetAnimoa();
    if (action === 'confirm-reset-data') resetAnimoa();

    const petId = target.dataset.selectPet;
    if (petId) {
      if (petId === data.activePetId) {
        closeModal();
        showToast(`${activePet()?.name || 'Cet animal'} est déjà sélectionné.`);
      } else {
        const snapshot = clone(data);
        try {
          data.activePetId = petId;
          saveData();
          closeModal();
          renderNavigation();
          renderPage();
          showToast(`${activePet()?.name || 'Animal'} est maintenant sélectionné.`);
        } catch (error) {
          data = snapshot;
          showToast(error.message || 'Impossible de changer d’animal.');
        }
      }
    }

    const memoryId = target.dataset.memoryId;
    if (memoryId) showMemory(memoryId);
  });


  document.addEventListener('change', (event) => {
    if (event.target.id === 'healthStatus') syncHealthDateRules(true);
    if (event.target.id === 'petSpecies') syncPetWeightGuide();
    if (event.target.matches('.file-picker-input')) {
      const name = event.target.files?.[0]?.name || 'Aucun fichier sélectionné';
      const label = event.target.closest('.file-picker')?.querySelector('.file-picker-name');
      if (label) label.textContent = translateText(name);
    }
  });


  document.addEventListener('input', (event) => {
    if (event.target.id === 'petBirth') {
      const formatted = formatDirectDateEntry(event.target.value);
      if (event.target.value !== formatted) event.target.value = formatted;
    }
  });

  document.addEventListener('scroll', (event) => {
    if (event.target?.id === 'healthTabs') {
      healthTabsScrollLeft = event.target.scrollLeft;
      updateHealthScrollButtons();
    }
  }, true);

  document.addEventListener('submit', (event) => {
    if (!event.target.matches('#healthForm, #expenseForm, #weightForm, #memoryForm, #petForm')) return;
    event.preventDefault();
    handleFormSubmit(event.target);
  });

  drawerBackdrop.addEventListener('click', closeDrawer);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeDrawer(); closeModal(); }
  });
  window.addEventListener('resize', () => { if (currentPage === 'weight') drawWeightChart(); if (currentPage === 'health') restoreHealthTabsPosition(); });
  async function retryCloudConnection() {
    if (cloudRetrying || !window.AnimoaCloud?.available?.()) return;
    cloudRetrying = true;
    cloudLoadFailed = false;
    try {
      await hydrateUserState();
      if (!cloudLoadFailed) {
        await migrateLocalMediaToCloud();
        applyPreferences();
        renderNavigation();
        renderPage();
      }
    } finally {
      cloudRetrying = false;
    }
  }

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (settings.theme === 'system') applyPreferences(); });
  window.addEventListener('online', () => { retryCloudConnection().catch(() => {}); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushCloudSave().catch(() => {});
  });
  window.addEventListener('pagehide', () => { flushCloudSave().catch(() => {}); });

  async function init() {
    await window.AnimoaAuth?.ready?.();
    await hydrateUserState();
    settings = normalizeSettings(settings);
    applyPreferences();
    try {
      await migrateLegacyImages();
      await migrateLocalMediaToCloud();
    } catch (error) {
      console.warn('Migration des anciennes photos incomplète', error);
    }
    data = normalizeData(data);
    try { saveData(); } catch (error) { console.warn('Migration des données incomplète', error); }
    await cleanupUnusedMedia();
    renderNavigation();
    renderPage();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Mode installable Animoa indisponible', error));
    }
  }

  init();
})();
