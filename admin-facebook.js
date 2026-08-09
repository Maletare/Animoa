(() => {
  'use strict';

  const VERSION = '3.14.0';
  const TABLE = 'animoa_facebook_publications';
  const BUCKET = 'animoa-facebook-publications';
  const LOCAL_KEY = 'animoa_admin_facebook_publications_v1';
  const RECENT_KEY = 'animoa_admin_facebook_recent_v1';
  const FOCUS_KEY = 'animoa_admin_facebook_media_focus_v1';
  const STOCK_ENDPOINT = 'animoa-media-library';
  const GRAPH_ENDPOINT = 'animoa-facebook-publications';
  const PARIS_TZ = 'Europe/Paris';
  const MIN_SCHEDULE_LEAD_MS = 2 * 60 * 1000;
  const BRAND = Object.freeze({ primary: '#20B8AE', dark: '#087D78', coral: '#FF6F73', pale: '#EAF8F7', ink: '#153B3A', white: '#FFFFFF' });
  const FORMATS = Object.freeze({
    square: { label: 'Carré Facebook · 1080 × 1080', width: 1080, height: 1080 },
    portrait: { label: 'Vertical Facebook · 1080 × 1350', width: 1080, height: 1350 },
  });
  const VISUALS = Object.freeze([
    { key: 'photo-card', label: 'Éclat Animoa' },
    { key: 'full-photo', label: 'Photo vedette' },
    { key: 'split', label: 'Pop éditorial' },
    { key: 'minimal', label: 'Bulles & douceur' },
    { key: 'poster', label: 'Affiche impact' },
    { key: 'soft', label: 'Polaroid lumineux' },
    { key: 'sticker', label: 'Collage pétillant' },
    { key: 'magazine', label: 'Magazine Animoa' },
  ]);

  const ANGLES = Object.freeze([
    {
      key: 'paperasse', label: 'Moins de paperasse', kind: 'Problème / solution', mediaThemes: ['Complicité', 'Repos', 'Jeu'],
      hooks: ['Moins de paperasse. Plus de moments.', 'Ses infos, enfin au même endroit.', 'Et si son suivi devenait plus simple ?'],
      supports: ['Rendez-vous, soins, poids et documents réunis dans un seul carnet.', 'Animoa rassemble ce qui compte pour éviter les recherches inutiles.', 'Un carnet numérique simple pour retrouver rapidement ses informations.'],
      descriptions: [
        'Entre les rendez-vous, les documents et les petits rappels du quotidien, les informations de nos animaux finissent vite par être dispersées. Avec Animoa, tout reste réuni dans un même carnet numérique, accessible simplement depuis votre téléphone.',
        'On garde une ordonnance ici, une date de vaccin ailleurs, une note dans le téléphone… puis on cherche tout au mauvais moment. Animoa aide à centraliser le suivi de votre animal dans un seul espace clair et pratique.',
        'Le temps passé à chercher une information, c’est du temps en moins pour profiter de lui. Animoa réunit le suivi essentiel de votre animal pour rendre le quotidien plus simple.'
      ],
      hashtags: ['#Animoa', '#Animaux', '#Organisation', '#CarnetDeSante', '#ApplicationAnimaux']
    },
    {
      key: 'rappels', label: 'Rendez-vous & rappels', kind: 'Fonction', mediaThemes: ['Vétérinaire', 'Santé'],
      hooks: ['Le prochain rendez-vous ? Déjà noté.', 'Ne laissez plus une échéance se perdre.', 'Son suivi mérite mieux qu’un post-it.'],
      supports: ['Gardez vos rendez-vous et échéances importantes à portée de main.', 'Centralisez les dates utiles et retrouvez-les sans fouiller partout.', 'Une vue plus claire pour les rendez-vous qui comptent.'],
      descriptions: [
        'Rendez-vous vétérinaires, vaccins, traitements : certaines dates comptent vraiment. Animoa vous aide à les réunir dans le carnet de votre animal pour garder une vision claire de ce qui arrive.',
        'Un rendez-vous noté sur un papier se perd vite. Dans Animoa, les échéances de votre animal restent regroupées avec le reste de son suivi.',
        'Pour son suivi, mieux vaut une information retrouvée en quelques secondes qu’une date recherchée au dernier moment. Animoa garde vos rendez-vous importants au même endroit.'
      ],
      hashtags: ['#Animoa', '#Veterinaire', '#Rappel', '#SanteAnimale', '#Animaux']
    },
    {
      key: 'documents', label: 'Documents', kind: 'Fonction', mediaThemes: ['Vétérinaire', 'Santé'],
      hooks: ['Son document important ? Vous savez où il est.', 'Fini le dossier introuvable.', 'Ses documents, sans fouiller partout.'],
      supports: ['Conservez les documents utiles avec le reste de son suivi.', 'Ordonnances, comptes rendus et pièces utiles restent associés à son carnet.', 'Tout ce qui concerne votre animal reste plus facile à retrouver.'],
      descriptions: [
        'Un document vétérinaire utile ne devrait pas disparaître au fond d’un dossier ou d’une galerie photo. Avec Animoa, vous pouvez le garder avec les autres informations de votre animal.',
        'Quand on a besoin d’un document, c’est rarement le bon moment pour le chercher pendant dix minutes. Animoa vous aide à conserver ses pièces utiles avec son suivi.',
        'Centraliser les documents de son animal, c’est aussi gagner du temps lors d’un rendez-vous ou d’une nouvelle consultation. C’est exactement l’un des usages d’Animoa.'
      ],
      hashtags: ['#Animoa', '#Documents', '#Veterinaire', '#CarnetNumerique', '#Animaux']
    },
    {
      key: 'multi', label: 'Plusieurs animaux', kind: 'Organisation', mediaThemes: ['Animaux variés', 'Complicité', 'Jeu'],
      hooks: ['Plusieurs animaux. Un seul endroit.', 'Un carnet pour chacun, une appli pour vous.', 'Chien, chat, lapin… chacun son suivi.'],
      supports: ['Créez un profil séparé pour chacun de vos compagnons.', 'Passez d’un animal à l’autre sans mélanger leurs informations.', 'Chaque compagnon garde son propre carnet dans Animoa.'],
      descriptions: [
        'Quand plusieurs animaux partagent la maison, les informations s’accumulent vite. Animoa permet de créer un carnet distinct pour chacun, tout en gardant une seule application à gérer.',
        'Un vaccin pour l’un, un rendez-vous pour l’autre, un document pour le troisième… Animoa sépare le suivi de chaque animal pour éviter les mélanges.',
        'Votre famille compte plusieurs compagnons ? Chacun peut avoir son propre profil Animoa, avec ses rendez-vous, son suivi et ses documents.'
      ],
      hashtags: ['#Animoa', '#MultiAnimaux', '#Chien', '#Chat', '#AnimauxDeCompagnie']
    },
    {
      key: 'privacy', label: 'Confidentialité', kind: 'Confiance', mediaThemes: ['Complicité', 'Repos'],
      hooks: ['Ses informations méritent d’être protégées.', 'Son carnet reste son carnet.', 'Privé, clair, accessible.'],
      supports: ['Les informations enregistrées restent liées à votre compte Animoa.', 'Un espace personnel pour le suivi de vos compagnons.', 'Gardez leurs informations dans votre espace personnel.'],
      descriptions: [
        'Les informations de santé et de vie de votre animal sont personnelles. Animoa les organise dans votre espace de compte, sans les afficher aux autres utilisateurs.',
        'Centraliser ne veut pas dire exposer. Dans Animoa, le carnet de votre animal reste associé à votre compte et à votre usage personnel.',
        'Un carnet pratique doit aussi rester personnel. Animoa est pensé pour vous permettre de retrouver les informations de votre animal dans votre propre espace.'
      ],
      hashtags: ['#Animoa', '#Confidentialite', '#Donnees', '#Animaux', '#CarnetNumerique']
    },
    {
      key: 'poids', label: 'Suivi du poids', kind: 'Fonction', mediaThemes: ['Santé', 'Alimentation'],
      hooks: ['Son poids raconte aussi son évolution.', 'Quelques grammes peuvent compter.', 'Suivre son poids, simplement.'],
      supports: ['Enregistrez ses mesures et visualisez leur évolution dans le temps.', 'Gardez un historique clair de ses pesées.', 'Une courbe simple pour suivre son évolution.'],
      descriptions: [
        'Le poids fait partie des informations utiles à suivre dans le temps. Avec Animoa, vous pouvez enregistrer les pesées de votre animal et garder un historique facile à consulter.',
        'Une pesée isolée donne une valeur. Plusieurs pesées racontent une évolution. Animoa vous aide à conserver cet historique avec le reste de son carnet.',
        'Chiot qui grandit, chat dont on surveille la ligne, lapin suivi régulièrement : Animoa permet de garder les mesures de poids dans un seul historique.'
      ],
      hashtags: ['#Animoa', '#Poids', '#SanteAnimale', '#Suivi', '#Animaux']
    },
    {
      key: 'depenses', label: 'Dépenses', kind: 'Pratique', mediaThemes: ['Vétérinaire', 'Alimentation'],
      hooks: ['Et son budget, vous le suivez comment ?', 'Les dépenses aussi font partie de son quotidien.', 'Un œil sur ses dépenses, sans tableau compliqué.'],
      supports: ['Notez les dépenses liées à votre animal et gardez une vue claire.', 'Vétérinaire, alimentation, accessoires : gardez un historique simple.', 'Centralisez aussi les dépenses de vos compagnons.'],
      descriptions: [
        'Les dépenses liées à un animal sont nombreuses et parfois difficiles à suivre. Animoa permet aussi de les enregistrer pour garder une vision plus claire au fil des mois.',
        'Consultations, alimentation, accessoires… garder l’historique peut être utile sans transformer ça en comptabilité. Animoa le fait simplement dans le carnet de votre animal.',
        'Le suivi de votre animal ne s’arrête pas aux rendez-vous. Animoa permet également de conserver ses principales dépenses dans le même espace.'
      ],
      hashtags: ['#Animoa', '#BudgetAnimaux', '#Depenses', '#Animaux', '#Organisation']
    },
    {
      key: 'souvenirs', label: 'Souvenirs', kind: 'Émotion', mediaThemes: ['Complicité', 'Jeu', 'Promenade', 'Vacances'],
      hooks: ['Son carnet de santé… et de vie.', 'Parce que sa vie ne se résume pas aux vaccins.', 'Gardez aussi les beaux moments.'],
      supports: ['Ajoutez des souvenirs et des photos à son carnet Animoa.', 'Le suivi utile d’un côté, les moments précieux de l’autre — dans le même carnet.', 'Conservez les petites histoires qui font sa vie.'],
      descriptions: [
        'Un animal, ce n’est pas seulement une liste de vaccins et de rendez-vous. Ce sont aussi des balades, des premières fois et des souvenirs. Animoa permet de garder ces moments dans son carnet de vie.',
        'Les informations pratiques comptent, mais les souvenirs aussi. Dans Animoa, vous pouvez conserver les moments qui racontent vraiment la vie de votre compagnon.',
        'Son premier jour à la maison, une balade mémorable, une photo qu’on adore… Animoa est aussi pensé comme un carnet de vie pour garder ces souvenirs près de vous.'
      ],
      hashtags: ['#Animoa', '#Souvenirs', '#Complicite', '#Animaux', '#CarnetDeVie']
    },
    {
      key: 'question', label: 'Question à la communauté', kind: 'Engagement', mediaThemes: ['Complicité', 'Jeu', 'Promenade'],
      hooks: ['Vous savez où est son dernier vaccin ?', 'Combien d’endroits pour toutes ses infos ?', 'Team carnet papier ou tout dans le téléphone ?'],
      supports: ['Et si toutes ses informations importantes tenaient enfin dans un seul carnet ?', 'Dites-nous comment vous organisez aujourd’hui le suivi de votre animal.', 'Une question toute simple… qui en dit long sur notre organisation.'],
      descriptions: [
        'Petite question 👇 Aujourd’hui, où gardez-vous les informations importantes de votre animal : carnet papier, notes du téléphone, photos, mails… ou un peu partout ? Avec Animoa, notre objectif est justement de tout réunir plus simplement.',
        'On est curieux : quand le vétérinaire vous demande la date du dernier vaccin, vous la retrouvez en combien de temps ? 😄 Animoa a été créé pour rendre ce genre de recherche beaucoup plus simple.',
        'Votre organisation pour vos animaux, c’est plutôt ultra carrée ou “je sais que j’ai la photo quelque part” ? 😅 Animoa rassemble le suivi dans un même carnet numérique.'
      ],
      hashtags: ['#Animoa', '#QuestionDuJour', '#Animaux', '#ProprietaireDanimal', '#Organisation']
    },
    {
      key: 'checklist', label: 'Mini checklist', kind: 'Conseil', mediaThemes: ['Vétérinaire', 'Santé', 'Vacances'],
      hooks: ['3 infos à avoir sous la main.', 'Avant un rendez-vous, pensez à ça.', 'La mini-checklist du carnet bien rangé.'],
      supports: ['Derniers soins · traitements en cours · documents utiles.', 'Rendez-vous · médicaments · documents : trois choses faciles à centraliser.', 'Un petit réflexe d’organisation qui peut faire gagner du temps.'],
      descriptions: [
        'Mini-checklist avant un rendez-vous vétérinaire : la date des derniers soins, les traitements en cours et les documents utiles. Les avoir regroupés évite de chercher au dernier moment — c’est justement ce qu’Animoa facilite.',
        'Trois choses qu’on aime retrouver rapidement : un rendez-vous, un traitement en cours et un document utile. Les centraliser dans le carnet de votre animal peut vraiment simplifier le quotidien.',
        'Un carnet bien organisé, ce n’est pas forcément plus d’informations : c’est surtout les bonnes informations au bon endroit. Animoa est conçu dans cet esprit.'
      ],
      hashtags: ['#Animoa', '#ConseilAnimaux', '#Veterinaire', '#Organisation', '#Animaux']
    },
    {
      key: 'gratuit', label: 'Découvrir Animoa', kind: 'Découverte', mediaThemes: ['Complicité', 'Jeu', 'Repos'],
      hooks: ['Découvrez Animoa gratuitement.', 'Votre carnet animal, dans votre téléphone.', 'Un seul endroit pour suivre sa vie.'],
      supports: ['Créez son profil et découvrez les fonctions essentielles d’Animoa.', 'Un carnet numérique pensé pour le quotidien des propriétaires d’animaux.', 'Commencez simplement avec le suivi de votre compagnon.'],
      descriptions: [
        'Vous ne connaissez pas encore Animoa ? Créez gratuitement le profil de votre animal et découvrez un carnet numérique pensé pour réunir ses rendez-vous, soins, poids, documents, dépenses et souvenirs.',
        'Animoa est né d’une idée simple : arrêter de disperser les informations de nos animaux. Vous pouvez créer votre compte gratuitement et commencer le carnet de votre compagnon dès maintenant.',
        'Un carnet numérique simple, plusieurs animaux, les informations importantes réunies au même endroit. Découvrez Animoa et créez gratuitement votre compte.'
      ],
      hashtags: ['#Animoa', '#ApplicationAnimaux', '#CarnetDeSante', '#Chien', '#Chat', '#Animaux']
    },
    {
      key: 'quotidien', label: 'Vie quotidienne', kind: 'Bénéfice', mediaThemes: ['Promenade', 'Complicité', 'Repos'],
      hooks: ['Moins organiser. Plus profiter.', 'Le suivi doit rester simple.', 'Votre quotidien a déjà assez de choses à gérer.'],
      supports: ['Animoa rassemble les informations utiles sans compliquer votre quotidien.', 'Retrouvez l’essentiel plus vite et gardez du temps pour votre compagnon.', 'Un outil discret pour une organisation plus légère.'],
      descriptions: [
        'On adopte un animal pour partager une vie avec lui, pas pour multiplier les dossiers et les notes. Animoa aide à garder son suivi organisé sans alourdir votre quotidien.',
        'L’idée d’Animoa n’est pas de vous donner une tâche de plus. C’est au contraire de réunir ce que vous notez déjà un peu partout pour le retrouver plus facilement.',
        'Moins de temps à organiser, plus de temps avec eux. C’est la philosophie derrière Animoa : un suivi clair qui reste simple à utiliser au quotidien.'
      ],
      hashtags: ['#Animoa', '#VieAvecUnAnimal', '#Organisation', '#Animaux', '#ApplicationAnimaux']
    },
    {
      key: 'traitements', label: 'Traitements & médicaments', kind: 'Fonction', mediaThemes: ['Santé', 'Vétérinaire'],
      hooks: ['Son traitement, sans perdre le fil.', 'Gardez ses soins dans le bon ordre.', 'Traitement en cours ? Notez l’essentiel.'],
      supports: ['Conservez les informations utiles sur ses traitements et médicaments.', 'Retrouvez le suivi des soins avec le reste de son carnet.', 'Un historique clair pour ne pas mélanger les informations.'],
      descriptions: [
        'Lorsqu’un animal suit un traitement, les informations utiles s’accumulent vite. Animoa permet de les conserver avec le reste de son suivi pour garder un historique plus clair.',
        'Nom du traitement, période, informations utiles : mieux vaut garder tout ça avec le carnet de l’animal plutôt que dans plusieurs notes séparées. Animoa est fait pour ça.',
        'Les soins font partie de son histoire de santé. Animoa vous aide à les conserver dans le même carnet que ses rendez-vous et ses documents.'
      ],
      hashtags: ['#Animoa', '#Traitement', '#SanteAnimale', '#Veterinaire', '#Animaux']
    }
  ]);


  const PHOTO_QUERIES = Object.freeze({
    paperasse: ['pet owner dog at home lifestyle', 'woman with cat at home lifestyle', 'happy rabbit owner home'],
    rappels: ['dog veterinarian checkup', 'cat veterinarian consultation', 'rabbit veterinarian care'],
    documents: ['pet owner veterinarian consultation', 'veterinarian with dog owner', 'cat owner veterinary clinic'],
    multi: ['dog and cat together home', 'multiple pets family home', 'dog cat rabbit pets'],
    privacy: ['pet owner cuddling dog home', 'woman hugging cat home', 'close bond rabbit owner'],
    poids: ['dog veterinary checkup scale', 'cat health check veterinarian', 'healthy pet veterinary clinic'],
    depenses: ['pet owner shopping pet supplies', 'dog owner pet store', 'cat owner pet accessories'],
    souvenirs: ['happy dog owner outdoors', 'woman with cat cozy home', 'rabbit owner happy lifestyle'],
    question: ['pet owner with dog portrait', 'cat owner lifestyle portrait', 'rabbit owner portrait'],
    checklist: ['veterinarian examining dog', 'cat veterinary consultation', 'pet health check vet'],
    gratuit: ['happy pet owner smartphone dog', 'woman cat smartphone home', 'pet owner lifestyle phone'],
    quotidien: ['woman dog sofa home', 'cat owner relaxing home', 'rabbit owner cozy home'],
    traitements: ['veterinarian treating dog medicine', 'cat veterinarian medicine', 'rabbit veterinary care'],
  });

  let state = {
    loaded: false,
    setupMissing: false,
    remoteReady: false,
    publications: [],
    draft: null,
    mediaLibrary: [],
    stockPhotos: [],
    stockBusy: false,
    stockError: '',
    stockQuery: '',
    busy: '',
    message: '',
    error: '',
    facebook: { checked: false, configured: false, pageName: '', pageId: '', apiVersion: '', connectionError: '', connectionIssue: false, dataAccessExpiresAt: '', dataAccessDaysRemaining: null, dataAccessAlertLevel: 'unknown' },
  };
  const imageCache = new Map();
  let canvasTicket = 0;

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }
  function nowIso() { return new Date().toISOString(); }
  function uid() { return crypto?.randomUUID?.() || `fb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }
  function client() { return window.AnimoaAuth?.getClient?.() || null; }
  function user() { return window.AnimoaAuth?.getUser?.() || null; }
  function tableMissing(error) {
    const code = String(error?.code || '');
    const message = String(error?.message || '').toLowerCase();
    return ['42P01', 'PGRST205', 'PGRST204'].includes(code) || message.includes(TABLE.toLowerCase()) || message.includes('schema cache');
  }
  function toast(message) {
    if (!message) return;
    window.dispatchEvent(new CustomEvent('animoa-admin-toast', { detail: String(message) }));
  }
  function readJson(key, fallback) {
    try { const parsed = JSON.parse(localStorage.getItem(key) || 'null'); return parsed ?? fallback; } catch { return fallback; }
  }
  function writeJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function focusMap() { const value = readJson(FOCUS_KEY, {}); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function focusKey(pubOrSnapshot) { return String(pubOrSnapshot?.mediaId || pubOrSnapshot?.mediaThumbnailUrl || ''); }
  function savedFocus(snapshot) {
    const key = focusKey(snapshot);
    const saved = key ? focusMap()[key] : null;
    return saved && typeof saved === 'object'
      ? { focusX: clamp(saved.x, .05, .95), focusY: clamp(saved.y, .05, .95), mediaZoom: clamp(saved.zoom || 1, 1, 1.8) }
      : { focusX: .5, focusY: .42, mediaZoom: 1 };
  }
  function rememberFocus(pub) {
    const key = focusKey(pub);
    if (!key) return;
    const map = focusMap();
    map[key] = { x: clamp(pub.focusX, .05, .95), y: clamp(pub.focusY, .05, .95), zoom: clamp(pub.mediaZoom || 1, 1, 1.8) };
    const entries = Object.entries(map).slice(-160);
    writeJson(FOCUS_KEY, Object.fromEntries(entries));
  }
  function recent() { return Array.isArray(readJson(RECENT_KEY, [])) ? readJson(RECENT_KEY, []).slice(0, 12) : []; }
  function remember(pub) {
    const next = [{ angle: pub.angleKey, visual: pub.visualStyle, mediaId: pub.mediaId || '', hook: pub.hook }, ...recent()].slice(0, 12);
    writeJson(RECENT_KEY, next);
  }
  function randomItem(items, avoid = []) {
    const safe = (items || []).filter(Boolean);
    if (!safe.length) return '';
    const allowed = safe.filter((item) => !avoid.includes(typeof item === 'string' ? item : item.key));
    const pool = allowed.length ? allowed : safe;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function angleByKey(key) { return ANGLES.find((item) => item.key === key) || ANGLES[0]; }
  function visualByKey(key) { return VISUALS.find((item) => item.key === key) || VISUALS[0]; }
  function formatByKey(key) { return FORMATS[key] || FORMATS.portrait; }
  function publicationStatusLabel(status) { return ({ draft: 'Brouillon', ready: 'Prête', scheduled: 'Programmée', publishing: 'Envoi en cours', published: 'Publiée', error: 'Erreur' })[status] || 'Brouillon'; }
  function publicationStatusClass(status) { return `is-${['draft', 'ready', 'scheduled', 'publishing', 'published', 'error'].includes(status) ? status : 'draft'}`; }
  function dateLabel(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: PARIS_TZ }).format(date);
  }

  function zoneParts(date, timeZone = PARIS_TZ) {
    const values = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date).forEach((part) => { if (part.type !== 'literal') values[part.type] = part.value; });
    return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
  }
  function parisLocalToIso(dateValue, timeValue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || '')) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(timeValue || ''))) return '';
    const [y, m, d] = String(dateValue).split('-').map(Number);
    const [h, minute] = String(timeValue).split(':').map(Number);
    const target = Date.UTC(y, m - 1, d, h, minute);
    let guess = target;
    for (let i = 0; i < 4; i += 1) {
      const parts = zoneParts(new Date(guess));
      const [py, pm, pd] = parts.date.split('-').map(Number);
      const [ph, pmin] = parts.time.split(':').map(Number);
      const correction = target - Date.UTC(py, pm - 1, pd, ph, pmin);
      guess += correction;
      if (!correction) break;
    }
    const resolved = new Date(guess);
    const check = zoneParts(resolved);
    return check.date === dateValue && check.time === timeValue ? resolved.toISOString() : '';
  }
  function defaultScheduleParts() {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setUTCMinutes(Math.ceil(date.getUTCMinutes() / 15) * 15, 0, 0);
    return zoneParts(date);
  }
  function scheduleInputsFromIso(value) {
    if (!value) return defaultScheduleParts();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? defaultScheduleParts() : zoneParts(date);
  }
  function ensureScheduleInputs(pub) {
    if (!pub) return;
    if (pub.scheduleDate && pub.scheduleTime) return;
    const parts = scheduleInputsFromIso(pub.scheduledAt);
    pub.scheduleDate = parts.date;
    pub.scheduleTime = parts.time;
  }
  function scheduledLabel(pub) {
    return pub?.scheduledAt ? `Prévue le ${dateLabel(pub.scheduledAt)}` : '';
  }

  function mediaCandidates(angle) {
    const all = state.mediaLibrary.filter((item) => item && item.status !== 'archived' && item.thumbnail_url);
    const available = all.filter((item) => String(item.status || 'available') === 'available');
    const list = available.length ? available : all;
    const themes = angle?.mediaThemes || [];
    const matched = list.filter((item) => themes.some((theme) => String(item.theme || '').toLowerCase().includes(theme.toLowerCase()) || String(item.species || '').toLowerCase().includes(theme.toLowerCase())));
    return matched.length ? matched : list;
  }
  function chooseMedia(angle, avoidId = '') {
    const recentMedia = recent().map((item) => String(item.mediaId || '')).filter(Boolean);
    const candidates = mediaCandidates(angle).filter((item) => String(item.id) !== String(avoidId));
    if (!candidates.length) return null;
    const fresh = candidates.filter((item) => !recentMedia.includes(String(item.id)));
    return randomItem(fresh.length ? fresh : candidates);
  }
  function mediaSnapshot(item) {
    if (!item) return { mediaId: '', mediaThumbnailUrl: '', mediaSourceUrl: '', mediaLabel: '', focusX: .5, focusY: .42, mediaZoom: 1 };
    const stock = Boolean(item._stock || item.imageUrl);
    const snapshot = {
      mediaId: stock ? `stock:${String(item.source || 'photo')}:${String(item.sourceId || item.id || '')}` : String(item.id || ''),
      mediaThumbnailUrl: String(item.imageUrl || item.thumbnailUrl || item.thumbnail_url || ''),
      mediaSourceUrl: String(item.sourcePageUrl || item.source_page_url || ''),
      mediaLabel: stock
        ? `${item.source === 'pixabay' ? 'Pixabay' : 'Pexels'} · ${item.creatorName || 'Photo HD'}`
        : `${item.species || 'Animal'} · ${item.theme || 'Média Animoa'}`,
    };
    return { ...snapshot, ...savedFocus(snapshot) };
  }
  function buildDescription(angle) {
    const base = randomItem(angle.descriptions);
    const websiteCtas = [
      'Découvrez Animoa gratuitement sur animoa.fr',
      'Créez gratuitement le carnet de votre compagnon sur animoa.fr',
      'Retrouvez Animoa sur animoa.fr',
      'Commencez son carnet gratuitement sur animoa.fr'
    ];
    const socialOutros = {
      question: ['Et vous, vous retrouvez ses informations en combien de temps ? 👇', 'Racontez-nous votre méthode d’organisation en commentaire 👇'],
      checklist: ['À garder sous la main pour le prochain rendez-vous 🐾', 'Vous ajouteriez quoi à cette mini-checklist ? 👇'],
      souvenirs: ['Quel est le souvenir avec votre compagnon que vous ne voulez jamais oublier ? 🐾', 'Et vous, quel moment garderiez-vous dans son carnet de vie ?'],
      multi: ['Combien de compagnons partagent votre quotidien ? 🐾', 'Team un animal ou grande famille à quatre pattes ?'],
      quotidien: ['Le but : moins chercher, plus profiter de lui. 🐾'],
      privacy: ['Parce que pratique et personnel peuvent aller ensemble.']
    };
    const special = socialOutros[angle.key] || [];
    const outro = special.length && Math.random() < 0.62 ? randomItem(special) : randomItem(websiteCtas);
    return `${base}\n\n${outro}`;
  }
  function normalizeHashtags(tags) {
    return [...new Set((tags || []).map((tag) => String(tag).trim()).filter(Boolean).map((tag) => tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`))].join(' ');
  }
  function createPublication(forcedAngleKey = '') {
    const recentAngles = recent().slice(0, 10).map((item) => item.angle);
    const angle = forcedAngleKey ? angleByKey(forcedAngleKey) : randomItem(ANGLES, recentAngles);
    const recentVisuals = recent().slice(0, 3).map((item) => item.visual);
    const visual = randomItem(VISUALS, recentVisuals);
    const media = chooseMedia(angle);
    const snap = mediaSnapshot(media);
    const created = nowIso();
    return {
      id: uid(), status: 'draft', angleKey: angle.key, contentKind: angle.kind,
      format: Math.random() < 0.62 ? 'portrait' : 'square', visualStyle: visual.key,
      hook: randomItem(angle.hooks), imageText: randomItem(angle.supports),
      description: buildDescription(angle), hashtags: normalizeHashtags(angle.hashtags),
      ...snap, imagePath: '', facebookPostId: '', facebookPermalinkUrl: '', errorMessage: '',
      scheduledAt: '', scheduledTimezone: PARIS_TZ, publishAttempts: 0, publishingStartedAt: '',
      scheduleDate: '', scheduleTime: '', createdAt: created, updatedAt: created, publishedAt: '', _remote: false,
    };
  }
  function markEdited() {
    if (!state.draft) return;
    if (!['published', 'scheduled', 'publishing'].includes(state.draft.status)) state.draft.status = 'draft';
    if (state.draft.status === 'scheduled') state.draft.scheduleDirty = true;
    state.draft.errorMessage = '';
    state.draft.updatedAt = nowIso();
  }
  function regenerateText() {
    if (!state.draft) state.draft = createPublication();
    const angle = angleByKey(state.draft.angleKey);
    const currentHook = state.draft.hook;
    const currentText = state.draft.imageText;
    state.draft.hook = randomItem(angle.hooks.filter((item) => item !== currentHook));
    state.draft.imageText = randomItem(angle.supports.filter((item) => item !== currentText));
    state.draft.description = buildDescription(angle);
    state.draft.hashtags = normalizeHashtags(angle.hashtags);
    state.draft.contentKind = angle.kind;
    markEdited();
  }
  function regenerateVisual() {
    if (!state.draft) return;
    const other = VISUALS.filter((item) => item.key !== state.draft.visualStyle);
    state.draft.visualStyle = randomItem(other).key;
    markEdited();
  }
  function nextMedia() {
    if (!state.draft) return;
    const media = chooseMedia(angleByKey(state.draft.angleKey), state.draft.mediaId);
    Object.assign(state.draft, mediaSnapshot(media));
    markEdited();
  }

  function stockSearchQuery(angle) {
    const queries = PHOTO_QUERIES[angle?.key] || PHOTO_QUERIES.quotidien;
    const previous = String(state.stockQuery || '');
    const choices = queries.filter((item) => item !== previous);
    return randomItem(choices.length ? choices : queries);
  }
  async function invokeMediaEdge(action, payload = {}) {
    const c = client();
    const config = window.ANIMOA_CONFIG || {};
    if (!c || !config.supabaseUrl) throw new Error('Connexion Supabase indisponible.');
    const { data: sessionData } = await c.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Reconnectez-vous au compte administrateur Animoa.');
    const response = await fetch(`${String(config.supabaseUrl).replace(/\/$/, '')}/functions/v1/${STOCK_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.ok !== true) throw new Error(result?.error || `La Banque de médias a répondu avec l’erreur ${response.status}.`);
    return result;
  }
  async function searchStockPhotos({ autoSelect = false, quiet = false } = {}) {
    if (!state.draft || state.stockBusy) return;
    state.stockBusy = true;
    state.stockError = '';
    const angle = angleByKey(state.draft.angleKey);
    const query = stockSearchQuery(angle);
    state.stockQuery = query;
    if (!quiet) rerender();
    try {
      const result = await invokeMediaEdge('search-facebook-images', {
        query,
        orientation: state.draft.format === 'square' ? 'square' : 'portrait',
      });
      state.stockPhotos = Array.isArray(result.items) ? result.items.slice(0, 18).map((item) => ({ ...item, _stock: true })) : [];
      if (autoSelect && state.stockPhotos.length) {
        Object.assign(state.draft, mediaSnapshot(state.stockPhotos[0]));
        await autoFocusCurrent({ quiet: true });
      }
    } catch (error) {
      state.stockPhotos = [];
      state.stockError = 'Les photos HD seront disponibles après le déploiement de la fonction Banque de médias mise à jour. Les médias actuels restent utilisables.';
      if (!quiet && error?.message && !/action inconnue/i.test(error.message)) state.stockError = error.message;
    } finally {
      state.stockBusy = false;
      rerender();
    }
  }

  function localPublications() {
    const items = readJson(LOCAL_KEY, []);
    return Array.isArray(items) ? items.map((item) => ({
      ...item,
      focusX: clamp(item.focusX ?? .5, .05, .95),
      focusY: clamp(item.focusY ?? .42, .05, .95),
      mediaZoom: clamp(item.mediaZoom ?? 1, 1, 1.8),
      _remote: false
    })) : [];
  }
  function storeLocal(pub) {
    const current = localPublications();
    const clean = { ...pub, _remote: false };
    const index = current.findIndex((item) => String(item.id) === String(pub.id));
    if (index >= 0) current[index] = clean; else current.unshift(clean);
    writeJson(LOCAL_KEY, current.slice(0, 60));
    state.publications = current.slice(0, 60);
  }
  function removeLocal(id) {
    const next = localPublications().filter((item) => String(item.id) !== String(id));
    writeJson(LOCAL_KEY, next);
    state.publications = next;
  }
  function fromRow(row) {
    const scheduleParts = scheduleInputsFromIso(row.scheduled_at || '');
    return {
      id: row.id, status: row.status || 'draft', angleKey: row.angle_key || 'quotidien', contentKind: row.content_kind || '',
      format: row.format || 'portrait', visualStyle: row.visual_style || 'photo-card', hook: row.hook || '', imageText: row.image_text || '',
      description: row.description || '', hashtags: row.hashtags || '', mediaId: row.media_id || '', mediaThumbnailUrl: row.media_thumbnail_url || '',
      mediaSourceUrl: row.media_source_url || '', mediaLabel: row.media_label || '', focusX: clamp(row.focus_x ?? .5, .05, .95), focusY: clamp(row.focus_y ?? .42, .05, .95),
      mediaZoom: clamp(row.media_zoom ?? 1, 1, 1.8), imagePath: row.image_path || '', facebookPostId: row.facebook_post_id || '',
      facebookPermalinkUrl: row.facebook_permalink_url || '', errorMessage: row.error_message || '', createdAt: row.created_at, updatedAt: row.updated_at,
      scheduledAt: row.scheduled_at || '', scheduledTimezone: row.scheduled_timezone || PARIS_TZ, publishAttempts: Number(row.publish_attempts || 0),
      publishingStartedAt: row.publishing_started_at || '', scheduleDate: scheduleParts.date, scheduleTime: scheduleParts.time,
      publishedAt: row.published_at || '', scheduleDirty: false, _remote: true,
    };
  }
  function toRow(pub) {
    const scheduled = pub.status === 'scheduled';
    return {
      id: pub.id, status: pub.status || 'draft', angle_key: pub.angleKey, content_kind: pub.contentKind || angleByKey(pub.angleKey).kind,
      format: pub.format, visual_style: pub.visualStyle, hook: pub.hook, image_text: pub.imageText, description: pub.description, hashtags: pub.hashtags,
      media_id: pub.mediaId || null, media_thumbnail_url: pub.mediaThumbnailUrl || null, media_source_url: pub.mediaSourceUrl || null,
      media_label: pub.mediaLabel || null, focus_x: clamp(pub.focusX ?? .5, .05, .95), focus_y: clamp(pub.focusY ?? .42, .05, .95),
      media_zoom: clamp(pub.mediaZoom ?? 1, 1, 1.8), image_path: pub.imagePath || null, facebook_post_id: pub.facebookPostId || null,
      facebook_permalink_url: pub.facebookPermalinkUrl || null, error_message: pub.errorMessage || null,
      scheduled_at: scheduled ? (pub.scheduledAt || null) : null, scheduled_timezone: PARIS_TZ,
      created_by: user()?.id || null, updated_at: nowIso(), published_at: pub.publishedAt || null,
    };
  }

  async function load(options = {}) {
    if (Array.isArray(options.mediaLibrary)) state.mediaLibrary = options.mediaLibrary;
    const c = client();
    const u = user();
    state.error = '';
    if (!c || !u || window.AnimoaAuth?.isLocalPreview?.()) {
      state.setupMissing = true;
      state.remoteReady = false;
      state.publications = localPublications();
      state.loaded = true;
      return;
    }
    const { data, error } = await c.from(TABLE).select('*').order('created_at', { ascending: false }).limit(80);
    if (error) {
      if (tableMissing(error)) {
        state.setupMissing = true;
        state.remoteReady = false;
        state.publications = localPublications();
      } else {
        state.error = error.message || 'Impossible de charger les publications Facebook.';
        state.publications = localPublications();
      }
    } else {
      state.setupMissing = false;
      state.remoteReady = true;
      state.publications = (data || []).map(fromRow);
      const seededRecent = state.publications.slice(0, 12).map((pub) => ({ angle: pub.angleKey, visual: pub.visualStyle, mediaId: pub.mediaId || '', hook: pub.hook }));
      if (seededRecent.length) writeJson(RECENT_KEY, seededRecent);
    }
    state.loaded = true;
  }

  async function refresh(options = {}) {
    state.loaded = false;
    state.facebook.checked = false;
    await load(options);
    if (document.getElementById('adminFacebookPanel')) rerender();
  }

  async function persistRemote(status, extras = {}) {
    const c = client();
    if (!c || !user() || !state.draft) throw new Error('Connexion administrateur requise.');
    state.draft.status = status || state.draft.status || 'draft';
    if (Object.prototype.hasOwnProperty.call(extras, 'scheduledAt')) state.draft.scheduledAt = extras.scheduledAt || '';
    if (Object.prototype.hasOwnProperty.call(extras, 'errorMessage')) state.draft.errorMessage = extras.errorMessage || '';
    state.draft.updatedAt = nowIso();
    const row = { ...toRow(state.draft) };
    if (Object.prototype.hasOwnProperty.call(extras, 'scheduledAt')) row.scheduled_at = extras.scheduledAt || null;
    if (Object.prototype.hasOwnProperty.call(extras, 'scheduledTimezone')) row.scheduled_timezone = extras.scheduledTimezone || PARIS_TZ;
    if (Object.prototype.hasOwnProperty.call(extras, 'errorMessage')) row.error_message = extras.errorMessage || null;
    const { data, error } = await c.from(TABLE).upsert(row, { onConflict: 'id' }).select('*').single();
    if (error) throw error;
    state.draft = fromRow(data);
    state.publications = [state.draft, ...state.publications.filter((item) => String(item.id) !== String(state.draft.id))];
    return state.draft;
  }

  async function saveDraft(status = '') {
    if (!state.draft) return;
    const requestedStatus = status || state.draft.status || 'draft';
    state.draft.updatedAt = nowIso();
    state.draft.errorMessage = '';
    state.busy = 'save';
    state.message = '';
    state.error = '';
    rerender();
    const c = client();
    if (!state.remoteReady || !c || !user()) {
      if (requestedStatus === 'scheduled') {
        state.error = 'La programmation nécessite Supabase. Installez d’abord le SQL 12.';
        state.busy = '';
        rerender();
        return;
      }
      state.draft.status = requestedStatus;
      storeLocal(state.draft);
      state.message = state.setupMissing ? 'Brouillon enregistré localement. Le SQL 11 activera ensuite l’historique Supabase.' : 'Brouillon enregistré dans ce navigateur.';
      state.busy = '';
      remember(state.draft);
      rerender();
      toast('Publication enregistrée.');
      return;
    }
    try {
      await persistRemote(requestedStatus, {
        scheduledAt: requestedStatus === 'scheduled' ? state.draft.scheduledAt : '',
        scheduledTimezone: PARIS_TZ,
        errorMessage: '',
      });
      state.message = requestedStatus === 'ready' ? 'Publication marquée comme prête.' : requestedStatus === 'scheduled' ? 'Publication programmée.' : 'Brouillon enregistré.';
      state.busy = '';
      remember(state.draft);
      rerender();
      toast(state.message);
    } catch (error) {
      state.error = error.message || 'Enregistrement impossible.';
      state.busy = '';
      rerender();
    }
  }

  async function deletePublication(id) {
    if (!id) return;
    const existing = state.publications.find((item) => String(item.id) === String(id)) || (String(state.draft?.id) === String(id) ? state.draft : null);
    if (!existing) return;
    if (existing.status === 'publishing') { state.error = 'Cette publication est en cours d’envoi et ne peut plus être supprimée.'; rerender(); return; }
    if (!confirm(existing.status === 'scheduled' ? 'Supprimer cette publication programmée ? Elle ne sera pas envoyée sur Facebook.' : existing.status === 'published' ? 'Supprimer cette publication de l’historique Animoa ? Le post déjà publié restera sur Facebook.' : 'Supprimer cette publication Facebook ?')) return;
    const c = client();
    if (state.remoteReady && c && existing?._remote) {
      const { data, error } = await c.from(TABLE).delete().eq('id', id).neq('status', 'publishing').select('id').maybeSingle();
      if (error) { state.error = error.message || 'Suppression impossible.'; rerender(); return; }
      if (!data) { state.error = 'Cette publication a commencé à être envoyée et ne peut plus être supprimée.'; await refresh(); rerender(); return; }
      if (existing.imagePath) c.storage.from(BUCKET).remove([existing.imagePath]).catch(() => {});
    } else removeLocal(id);
    state.publications = state.publications.filter((item) => String(item.id) !== String(id));
    if (String(state.draft?.id) === String(id)) state.draft = null;
    rerender();
    toast('Publication supprimée.');
  }

  async function invokeEdge(action, payload = {}) {
    const c = client();
    const config = window.ANIMOA_CONFIG || {};
    if (!c || !config.supabaseUrl) throw new Error('Connexion Supabase indisponible.');
    const { data: sessionData } = await c.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Reconnectez-vous au compte administrateur Animoa.');
    const response = await fetch(`${String(config.supabaseUrl).replace(/\/$/, '')}/functions/v1/${GRAPH_ENDPOINT}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.ok !== true) {
      const error = new Error(result?.error || `La connexion Facebook a répondu avec l’erreur ${response.status}.`);
      error.connectionIssue = Boolean(result?.connectionIssue);
      error.graphCode = result?.graphCode || null;
      throw error;
    }
    return result;
  }

  async function checkFacebookStatus(force = false) {
    if (state.facebook.checked && !force) return state.facebook;
    if (!state.remoteReady) {
      state.facebook = { checked: true, configured: false, pageName: '', pageId: '', apiVersion: '', connectionError: '', connectionIssue: false, dataAccessExpiresAt: '', dataAccessDaysRemaining: null, dataAccessAlertLevel: 'unknown' };
      return state.facebook;
    }
    try {
      const result = await invokeEdge('status');
      state.facebook = {
        checked: true,
        configured: Boolean(result.configured),
        pageName: String(result.pageName || ''),
        pageId: String(result.pageId || ''),
        apiVersion: String(result.apiVersion || ''),
        connectionError: String(result.connectionError || ''),
        connectionIssue: Boolean(result.connectionIssue),
        dataAccessExpiresAt: String(result.dataAccessExpiresAt || ''),
        dataAccessDaysRemaining: result.dataAccessDaysRemaining === null || result.dataAccessDaysRemaining === undefined || result.dataAccessDaysRemaining === '' ? null : (Number.isFinite(Number(result.dataAccessDaysRemaining)) ? Number(result.dataAccessDaysRemaining) : null),
        dataAccessAlertLevel: String(result.dataAccessAlertLevel || 'unknown'),
      };
    } catch (error) {
      state.facebook = { checked: true, configured: false, pageName: '', pageId: '', apiVersion: '', connectionError: error.message || 'Connexion Facebook non configurée.', connectionIssue: Boolean(error.connectionIssue), dataAccessExpiresAt: '', dataAccessDaysRemaining: null, dataAccessAlertLevel: 'unknown' };
      state.error = error.message || 'Connexion Facebook non configurée.';
    }
    rerender();
    return state.facebook;
  }

  function canvasElement() { return document.getElementById('adminFacebookArtwork'); }
  async function canvasBlob() {
    await drawCanvas(true);
    const canvas = canvasElement();
    if (!canvas) throw new Error('Aperçu de l’affiche introuvable.');
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Impossible de créer le fichier image.')), 'image/png', 0.96));
  }
  async function uploadArtwork() {
    const c = client();
    const u = user();
    if (!c || !u || !state.draft) throw new Error('Connexion administrateur requise.');
    const blob = await canvasBlob();
    const path = `${u.id}/${state.draft.id}.png`;
    const { error } = await c.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: 'image/png', cacheControl: '3600' });
    if (error) throw error;
    state.draft.imagePath = path;
    const { data, error: saveError } = await c.from(TABLE).update({ image_path: path, updated_at: nowIso() }).eq('id', state.draft.id).select('*').single();
    if (saveError) throw saveError;
    state.draft = fromRow(data);
    state.publications = [state.draft, ...state.publications.filter((item) => String(item.id) !== String(state.draft.id))];
    return path;
  }
  async function refreshCurrentFromDatabase() {
    const c = client();
    if (!c || !state.draft) return;
    const { data, error } = await c.from(TABLE).select('*').eq('id', state.draft.id).single();
    if (error) throw error;
    if (data) {
      state.draft = fromRow(data);
      state.publications = [state.draft, ...state.publications.filter((item) => String(item.id) !== String(state.draft.id))];
    }
  }

  async function releaseScheduledForEditing() {
    if (!state.draft) throw new Error('Publication introuvable.');
    if (state.draft.status !== 'scheduled') {
      return persistRemote('ready', { scheduledAt: '', scheduledTimezone: PARIS_TZ, errorMessage: '' });
    }
    const c = client();
    if (!c || !user()) throw new Error('Connexion administrateur requise.');
    const row = { ...toRow(state.draft), status: 'ready', scheduled_at: null, scheduled_timezone: PARIS_TZ, error_message: null, updated_at: nowIso() };
    const { data, error } = await c.from(TABLE).update(row).eq('id', state.draft.id).eq('status', 'scheduled').select('*').maybeSingle();
    if (error) throw error;
    if (!data) {
      await refreshCurrentFromDatabase().catch(() => {});
      throw new Error('Cette publication a déjà commencé à être envoyée. Elle ne peut plus être modifiée ni reprogrammée.');
    }
    state.draft = fromRow(data);
    state.publications = [state.draft, ...state.publications.filter((item) => String(item.id) !== String(state.draft.id))];
    return state.draft;
  }

  function scheduleIsoFromDraft() {
    if (!state.draft) return '';
    ensureScheduleInputs(state.draft);
    return parisLocalToIso(state.draft.scheduleDate, state.draft.scheduleTime);
  }

  async function scheduleCurrent() {
    if (!state.draft || state.busy || state.draft.status === 'publishing' || state.draft.status === 'published') return;
    if (!state.remoteReady) { state.error = 'Exécutez d’abord les SQL 11 puis 12 pour activer la programmation.'; rerender(); return; }
    const fb = await checkFacebookStatus();
    if (!fb.configured) { state.error = fb.connectionError || 'La Page Facebook Animoa n’est pas connectée.'; rerender(); return; }
    if (fb.dataAccessAlertLevel === 'expired') { state.error = 'L’accès aux données Facebook est arrivé à échéance. Renouvelez la connexion avant de programmer une publication.'; rerender(); return; }
    const scheduleAt = scheduleIsoFromDraft();
    if (!scheduleAt) { state.error = 'La date ou l’heure de programmation est invalide pour le fuseau Europe/Paris.'; rerender(); return; }
    if (new Date(scheduleAt).getTime() < Date.now() + MIN_SCHEDULE_LEAD_MS) { state.error = 'Choisissez une heure au moins 2 minutes dans le futur.'; rerender(); return; }
    const verb = state.draft.status === 'scheduled' ? 'Reprogrammer' : 'Programmer';
    if (!confirm(`${verb} cette publication pour le ${dateLabel(scheduleAt)} (heure de Paris) ?`)) return;

    state.busy = 'schedule'; state.error = ''; state.message = 'Préparation de l’affiche programmée…'; rerender();
    try {
      // On retire temporairement la ligne de la file de programmation pendant la mise à jour de l’image.
      await releaseScheduledForEditing();
      state.busy = 'schedule'; state.message = 'Enregistrement de l’affiche…'; rerender();
      await uploadArtwork();
      state.draft.scheduleDate = zoneParts(new Date(scheduleAt)).date;
      state.draft.scheduleTime = zoneParts(new Date(scheduleAt)).time;
      state.draft.scheduledAt = scheduleAt;
      state.busy = 'schedule'; state.message = 'Activation de la programmation…'; rerender();
      await persistRemote('scheduled', { scheduledAt: scheduleAt, scheduledTimezone: PARIS_TZ, errorMessage: '' });
      state.draft.scheduleDirty = false;
      state.busy = '';
      state.message = `Publication programmée pour le ${dateLabel(scheduleAt)}.`;
      remember(state.draft);
      rerender();
      toast('Publication Facebook programmée.');
    } catch (error) {
      state.busy = '';
      state.error = error.message || 'Programmation Facebook impossible.';
      rerender();
    }
  }

  async function saveScheduledChanges() {
    if (!state.draft || state.draft.status !== 'scheduled' || state.busy) return;
    const scheduleAt = scheduleIsoFromDraft() || state.draft.scheduledAt;
    if (!scheduleAt || new Date(scheduleAt).getTime() < Date.now() + MIN_SCHEDULE_LEAD_MS) {
      state.error = 'La programmation est trop proche ou déjà passée. Choisissez une nouvelle date et cliquez sur Reprogrammer.';
      rerender();
      return;
    }
    state.busy = 'schedule'; state.error = ''; state.message = 'Enregistrement des modifications…'; rerender();
    try {
      await releaseScheduledForEditing();
      await uploadArtwork();
      state.draft.scheduledAt = scheduleAt;
      state.draft.scheduleDate = zoneParts(new Date(scheduleAt)).date;
      state.draft.scheduleTime = zoneParts(new Date(scheduleAt)).time;
      await persistRemote('scheduled', { scheduledAt: scheduleAt, scheduledTimezone: PARIS_TZ, errorMessage: '' });
      state.draft.scheduleDirty = false;
      state.busy = '';
      state.message = `Modifications enregistrées. Publication toujours prévue le ${dateLabel(scheduleAt)}.`;
      rerender();
      toast('Publication programmée mise à jour.');
    } catch (error) {
      state.busy = '';
      state.error = error.message || 'Impossible d’enregistrer les modifications.';
      rerender();
    }
  }

  async function cancelSchedule(id = '') {
    const targetId = id || state.draft?.id;
    if (!targetId || state.busy) return;
    const item = state.publications.find((entry) => String(entry.id) === String(targetId)) || (String(state.draft?.id) === String(targetId) ? state.draft : null);
    if (!item || item.status !== 'scheduled') return;
    if (!confirm('Annuler cette programmation ? La publication restera enregistrée comme prête et ne sera pas envoyée automatiquement.')) return;
    const c = client();
    if (!c || !state.remoteReady) return;
    state.busy = 'cancel-schedule'; state.error = ''; state.message = ''; rerender();
    const { data, error } = await c.from(TABLE).update({ status: 'ready', scheduled_at: null, error_message: null, updated_at: nowIso() }).eq('id', targetId).eq('status', 'scheduled').select('*').maybeSingle();
    if (error) { state.busy = ''; state.error = error.message || 'Annulation impossible.'; rerender(); return; }
    if (!data) { state.busy = ''; state.error = 'La publication a déjà commencé à être envoyée et ne peut plus être annulée.'; await refresh(); rerender(); return; }
    const converted = fromRow(data);
    state.publications = [converted, ...state.publications.filter((entry) => String(entry.id) !== String(targetId))];
    if (String(state.draft?.id) === String(targetId)) state.draft = converted;
    state.busy = '';
    state.message = 'Programmation annulée. La publication reste prête.';
    rerender();
    toast('Programmation Facebook annulée.');
  }

  async function publishCurrent() {
    if (!state.draft || state.busy || state.draft.status === 'publishing' || state.draft.status === 'published') return;
    if (!state.remoteReady) { state.error = 'Exécutez d’abord les SQL 11 puis 12 pour activer la publication directe.'; rerender(); return; }
    const fb = await checkFacebookStatus();
    if (!fb.configured) { state.error = fb.connectionError || 'La Page Facebook Animoa n’est pas connectée.'; rerender(); return; }
    if (fb.dataAccessAlertLevel === 'expired') { state.error = 'L’accès aux données Facebook est arrivé à échéance. Renouvelez la connexion avant de publier.'; rerender(); return; }
    const prompt = state.draft.status === 'scheduled'
      ? 'Publier maintenant cette publication ? Sa programmation actuelle sera annulée.'
      : 'Publier maintenant cette publication sur la Page Facebook Animoa ?';
    if (!confirm(prompt)) return;
    state.busy = 'publish'; state.error = ''; state.message = 'Préparation de l’image…'; rerender();
    try {
      await releaseScheduledForEditing();
      state.busy = 'publish'; state.message = 'Enregistrement de l’affiche…'; rerender();
      await uploadArtwork();
      state.message = 'Publication sur Facebook…'; rerender();
      const result = await invokeEdge('publish', { publicationId: state.draft.id });
      await refreshCurrentFromDatabase();
      if (state.draft.status !== 'published') {
        state.draft.status = 'published';
        state.draft.facebookPostId = String(result.postId || result.photoId || '');
        state.draft.facebookPermalinkUrl = String(result.permalinkUrl || '');
        state.draft.publishedAt = result.publishedAt || nowIso();
      }
      state.publications = [state.draft, ...state.publications.filter((item) => String(item.id) !== String(state.draft.id))];
      state.message = result.alreadyPublished ? 'Cette publication était déjà publiée sur Facebook.' : 'Publication envoyée sur Facebook.';
      state.busy = '';
      remember(state.draft);
      rerender();
      toast('Publication Facebook envoyée.');
    } catch (error) {
      state.busy = '';
      state.error = error.connectionIssue ? `Connexion Facebook à renouveler : ${error.message || 'autorisation expirée.'}` : (error.message || 'Publication Facebook impossible.');
      try { await refreshCurrentFromDatabase(); } catch {}
      if (error.connectionIssue) state.facebook.checked = false;
      rerender();
    }
  }

  function downloadArtwork() {
    if (!state.draft) return;
    drawCanvas(true).then(() => {
      const canvas = canvasElement();
      if (!canvas) return;
      try {
        const link = document.createElement('a');
        link.download = `ANIMOA_FACEBOOK_${state.draft.format}_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch { state.error = 'Le média choisi empêche le téléchargement dans ce navigateur. Changez de média ou utilisez l’affiche sans photo.'; rerender(); }
    });
  }

  function updateDraftField(field, value) {
    if (!state.draft || ['publishing', 'published'].includes(state.draft.status)) return;
    if (field === 'scheduleDate') { state.draft.scheduleDate = String(value || ''); return; }
    if (field === 'scheduleTime') { state.draft.scheduleTime = String(value || ''); return; }
    if (field === 'angleKey') {
      state.draft.angleKey = value;
      regenerateText();
      const media = chooseMedia(angleByKey(value), state.draft.mediaId);
      Object.assign(state.draft, mediaSnapshot(media));
      markEdited();
      state.stockPhotos = [];
      state.stockError = '';
      rerender();
      queueMicrotask(() => searchStockPhotos({ autoSelect: true, quiet: true }));
      return;
    }
    if (field === 'format' && FORMATS[value]) state.draft.format = value;
    else if (field === 'visualStyle' && VISUALS.some((item) => item.key === value)) state.draft.visualStyle = value;
    else if (field === 'focusX') { state.draft.focusX = clamp(Number(value) / 100, .05, .95); rememberFocus(state.draft); }
    else if (field === 'focusY') { state.draft.focusY = clamp(Number(value) / 100, .05, .95); rememberFocus(state.draft); }
    else if (field === 'mediaZoom') { state.draft.mediaZoom = clamp(Number(value) / 100, 1, 1.8); rememberFocus(state.draft); }
    else if (['hook', 'imageText', 'description', 'hashtags'].includes(field)) state.draft[field] = value;
    markEdited();
    updateLivePreview();
    scheduleCanvas();
  }

  function updateLivePreview() {
    if (!state.draft) return;
    const desc = document.getElementById('adminFacebookPreviewDescription');
    if (desc) desc.textContent = state.draft.description || '';
    const tags = document.getElementById('adminFacebookPreviewHashtags');
    if (tags) tags.textContent = state.draft.hashtags || '';
  }

  function mediaPickerHtml() {
    if (!state.draft) return '';
    const angle = angleByKey(state.draft.angleKey);
    const locked = ['publishing', 'published'].includes(state.draft.status);
    const candidates = mediaCandidates(angle).slice(0, 12);
    if (!candidates.length) return '<div class="admin-facebook-media-empty">Aucun média avec miniature n’est encore disponible dans la Banque de médias. L’affiche Animoa fonctionne aussi sans photo.</div>';
    return `<div class="admin-facebook-media-grid">${candidates.map((item) => {
      const selected = String(item.id) === String(state.draft.mediaId);
      return `<button type="button" class="admin-facebook-media-choice ${selected ? 'is-selected' : ''}" data-fb-action="choose-media" data-media-id="${esc(item.id)}" ${locked ? 'disabled' : ''} title="${esc(`${item.species || 'Animal'} · ${item.theme || 'Média'}`)}"><img src="${esc(item.thumbnail_url)}" alt="" loading="lazy"><span>${esc(item.species || 'Animal')}</span></button>`;
    }).join('')}</div>`;
  }


  function stockPhotoPickerHtml() {
    if (!state.draft) return '';
    const locked = ['publishing', 'published'].includes(state.draft.status);
    const loading = state.stockBusy ? '<div class="admin-facebook-photo-loading">Recherche de photos HD adaptées…</div>' : '';
    const error = state.stockError ? `<div class="admin-facebook-photo-note">${esc(state.stockError)}</div>` : '';
    const grid = state.stockPhotos.length ? `<div class="admin-facebook-photo-grid">${state.stockPhotos.slice(0, 12).map((item) => {
      const id = `stock:${String(item.source || 'photo')}:${String(item.sourceId || item.id || '')}`;
      const selected = String(id) === String(state.draft.mediaId);
      const thumb = item.thumbnailUrl || item.imageUrl || '';
      return `<button type="button" class="admin-facebook-photo-choice ${selected ? 'is-selected' : ''}" data-fb-action="choose-stock-photo" data-stock-source="${esc(item.source || '')}" data-stock-id="${esc(item.sourceId || item.id || '')}" ${locked ? 'disabled' : ''} title="${esc(`${item.source === 'pixabay' ? 'Pixabay' : 'Pexels'} · ${item.creatorName || 'Photo'}`)}"><img src="${esc(thumb)}" alt="" loading="lazy"><span>${item.source === 'pixabay' ? 'Pixabay' : 'Pexels'}</span></button>`;
    }).join('')}</div>` : '';
    return `${loading}${error}${grid}`;
  }

  function cropControlsHtml(pub) {
    if (!pub?.mediaThumbnailUrl) return '';
    const locked = ['publishing', 'published'].includes(pub.status);
    const x = Math.round(clamp(pub.focusX ?? .5, .05, .95) * 100);
    const y = Math.round(clamp(pub.focusY ?? .42, .05, .95) * 100);
    const zoom = Math.round(clamp(pub.mediaZoom ?? 1, 1, 1.8) * 100);
    return `<div class="admin-facebook-crop-box">
      <div class="admin-facebook-section-title"><div><strong>Cadrage intelligent</strong><small>Le point important de la photo reste visible et les textes évitent cette zone.</small></div><button type="button" class="text-button" data-fb-action="auto-focus" ${locked ? 'disabled' : ''}>Recentrer auto</button></div>
      <div class="admin-facebook-crop-grid">
        <label><span>Horizontal <b>${x}%</b></span><input type="range" min="5" max="95" step="1" value="${x}" data-fb-field="focusX" ${locked ? 'disabled' : ''}></label>
        <label><span>Vertical <b>${y}%</b></span><input type="range" min="5" max="95" step="1" value="${y}" data-fb-field="focusY" ${locked ? 'disabled' : ''}></label>
        <label><span>Zoom <b>${zoom}%</b></span><input type="range" min="100" max="180" step="2" value="${zoom}" data-fb-field="mediaZoom" ${locked ? 'disabled' : ''}></label>
      </div>
      <div class="admin-facebook-crop-actions"><span>Astuce : si la tête de l’animal est trop à droite, déplacez simplement « Horizontal » vers la droite.</span><button type="button" class="secondary-button" data-fb-action="reset-crop" ${locked ? 'disabled' : ''}>Réinitialiser</button></div>
    </div>`;
  }

  function facebookUsable() {
    return Boolean(state.facebook.configured) && state.facebook.dataAccessAlertLevel !== 'expired';
  }

  function facebookConnectionHtml() {
    const fb = state.facebook;
    if (!state.remoteReady) return '';
    if (!fb.checked) return '<div class="admin-facebook-connection is-checking"><strong>Facebook</strong><span>Vérification de la connexion…</span></div>';
    if (!fb.configured) {
      return `<div class="admin-facebook-connection is-error"><strong>Facebook non connecté</strong><span>${esc(fb.connectionError || 'Vérifiez la fonction Edge et les secrets Supabase.')}</span><button type="button" class="secondary-button" data-fb-action="facebook-status">Réessayer</button></div>`;
    }
    const days = fb.dataAccessDaysRemaining;
    const expires = fb.dataAccessExpiresAt ? dateLabel(fb.dataAccessExpiresAt) : '';
    const level = fb.dataAccessAlertLevel || 'unknown';
    let title = `Facebook connecté ✓ · ${fb.pageName || 'Animoa'}`;
    let copy = fb.apiVersion ? `Page prête à publier · API ${fb.apiVersion}` : 'Page prête à publier.';
    let cls = 'is-ok';
    if (level === 'warning') { cls = 'is-warning'; copy = `Accès aux données à renouveler dans ${days} jours${expires ? ` · échéance ${expires}` : ''}.`; }
    if (level === 'urgent') { cls = 'is-urgent'; copy = `Renouvellement Facebook à faire dans ${days} jours${expires ? ` · échéance ${expires}` : ''}. Un e-mail de rappel sera envoyé à J-7.`; }
    if (level === 'critical') { cls = 'is-critical'; copy = `Connexion Facebook à renouveler rapidement : ${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}${expires ? ` · échéance ${expires}` : ''}.`; }
    if (level === 'expired') { cls = 'is-error'; title = 'Accès Facebook arrivé à échéance'; copy = 'Renouvelez la connexion avant toute nouvelle publication programmée.'; }
    return `<div class="admin-facebook-connection ${cls}"><strong>${esc(title)}</strong><span>${esc(copy)}</span><button type="button" class="secondary-button" data-fb-action="facebook-status">Actualiser</button></div>`;
  }

  function schedulePanelHtml(pub, busy) {
    ensureScheduleInputs(pub);
    if (pub.status === 'published') return '<div class="admin-facebook-schedule-done">Cette publication a déjà été envoyée sur Facebook.</div>';
    if (pub.status === 'publishing') return '<div class="admin-facebook-schedule-done is-sending">Envoi Facebook en cours. La publication ne peut plus être modifiée ni annulée.</div>';
    const disabled = busy || !state.remoteReady || !facebookUsable();
    const scheduled = pub.status === 'scheduled';
    return `<div class="admin-facebook-schedule-box">
      <div class="admin-facebook-section-title"><div><strong>${scheduled ? 'Reprogrammer la publication' : 'Programmer la publication'}</strong><small>${scheduled ? esc(scheduledLabel(pub)) : 'Heure de Paris · l’envoi fonctionne même si votre ordinateur est éteint.'}</small></div></div>
      <div class="admin-facebook-schedule-fields">
        <label><span>Date</span><input type="date" data-fb-field="scheduleDate" value="${esc(pub.scheduleDate || '')}" ${disabled ? 'disabled' : ''}></label>
        <label><span>Heure</span><input type="time" data-fb-field="scheduleTime" step="60" value="${esc(pub.scheduleTime || '')}" ${disabled ? 'disabled' : ''}></label>
      </div>
      <div class="admin-facebook-schedule-actions">
        <button type="button" class="secondary-button" data-fb-action="schedule" ${disabled ? 'disabled' : ''}>${state.busy === 'schedule' ? 'Programmation…' : (scheduled ? 'Reprogrammer' : 'Programmer')}</button>
        ${scheduled ? `<button type="button" class="text-button danger-text-button" data-fb-action="cancel-schedule" ${busy ? 'disabled' : ''}>Annuler la programmation</button>` : ''}
      </div>
    </div>`;
  }

  function editorHtml() {
    const pub = state.draft;
    if (!pub) return '';
    const busy = Boolean(state.busy);
    const scheduled = pub.status === 'scheduled';
    const publishing = pub.status === 'publishing';
    const published = pub.status === 'published';
    const immutable = publishing || published;
    return `<div class="admin-facebook-workspace">
      <section class="card card-pad admin-facebook-editor">
        <div class="admin-facebook-editor-head"><div><p class="eyebrow">Contenu</p><h2>Préparer la publication</h2><p>${scheduled ? `Programmée pour le ${esc(dateLabel(pub.scheduledAt))}. Vous pouvez encore la modifier, la reprogrammer ou l’annuler.` : publishing ? 'La publication est en cours d’envoi vers Facebook.' : 'Tout est modifiable avant validation.'}</p></div><span class="admin-facebook-status ${publicationStatusClass(pub.status)}">${publicationStatusLabel(pub.status)}</span></div>
        <div class="admin-facebook-form-grid">
          <label><span>Sujet</span><select data-fb-field="angleKey" ${immutable ? 'disabled' : ''}>${ANGLES.map((item) => `<option value="${esc(item.key)}" ${item.key === pub.angleKey ? 'selected' : ''}>${esc(item.label)} · ${esc(item.kind)}</option>`).join('')}</select></label>
          <label><span>Format</span><select data-fb-field="format" ${immutable ? 'disabled' : ''}>${Object.entries(FORMATS).map(([key, item]) => `<option value="${key}" ${key === pub.format ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></label>
          <label><span>Style d’affiche</span><select data-fb-field="visualStyle" ${immutable ? 'disabled' : ''}>${VISUALS.map((item) => `<option value="${item.key}" ${item.key === pub.visualStyle ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></label>
          <label class="is-wide"><span>Accroche sur l’image</span><input data-fb-field="hook" maxlength="72" value="${esc(pub.hook)}" ${immutable ? 'disabled' : ''}></label>
          <label class="is-wide"><span>Texte court sur l’image</span><textarea data-fb-field="imageText" maxlength="180" rows="3" ${immutable ? 'disabled' : ''}>${esc(pub.imageText)}</textarea></label>
          <label class="is-wide"><span>Description Facebook</span><textarea data-fb-field="description" maxlength="1800" rows="7" ${immutable ? 'disabled' : ''}>${esc(pub.description)}</textarea></label>
          <label class="is-wide"><span>Hashtags</span><input data-fb-field="hashtags" maxlength="500" value="${esc(pub.hashtags)}" ${immutable ? 'disabled' : ''}></label>
        </div>
        <div class="admin-facebook-generation-actions">
          <button type="button" class="secondary-button" data-fb-action="regenerate-text" ${busy || immutable ? 'disabled' : ''}>Régénérer le texte</button>
          <button type="button" class="secondary-button" data-fb-action="regenerate-image" ${busy || immutable ? 'disabled' : ''}>Changer le style</button>
          <button type="button" class="secondary-button" data-fb-action="search-stock" ${busy || immutable || state.stockBusy ? 'disabled' : ''}>${state.stockBusy ? 'Recherche photos…' : 'Trouver de belles photos'}</button>
        </div>
        <div class="admin-facebook-hd-section"><div class="admin-facebook-section-title"><div><strong>Photos HD adaptées au sujet</strong><small>${state.stockPhotos.length ? `${state.stockPhotos.length} propositions · ${esc(state.stockQuery || 'recherche automatique')}` : 'Pexels + Pixabay · sans API payante supplémentaire'}</small></div>${state.stockPhotos.length && !immutable ? '<button type="button" class="text-button" data-fb-action="search-stock">Autres photos</button>' : ''}</div>${stockPhotoPickerHtml()}</div>
        ${cropControlsHtml(pub)}
        <div class="admin-facebook-media-section"><div class="admin-facebook-section-title"><div><strong>Banque de médias / Drive</strong><small>${pub.mediaLabel ? esc(pub.mediaLabel) : 'Aucun média sélectionné — composition graphique uniquement'} · Les miniatures vidéo restent disponibles en complément.</small></div>${pub.mediaId && !immutable ? '<button type="button" class="text-button" data-fb-action="clear-media">Retirer la photo</button>' : ''}</div>${mediaPickerHtml()}<div class="admin-facebook-media-footer"><button type="button" class="secondary-button" data-fb-action="next-media" ${busy || immutable ? 'disabled' : ''}>Média suivant du Drive</button></div></div>
        <div class="admin-facebook-save-actions">
          <button type="button" class="secondary-button" data-fb-action="save" ${busy || immutable ? 'disabled' : ''}>${state.busy === 'save' || state.busy === 'schedule' ? 'Enregistrement…' : (scheduled ? 'Enregistrer les modifications' : 'Enregistrer brouillon')}</button>
          ${scheduled || immutable ? '' : `<button type="button" class="primary-button" data-fb-action="ready" ${busy ? 'disabled' : ''}>Marquer comme prête</button>`}
          <button type="button" class="text-button danger-text-button" data-fb-action="delete-current" ${busy || immutable ? 'disabled' : ''}>Supprimer</button>
        </div>
      </section>
      <section class="admin-facebook-preview-column">
        <article class="card card-pad admin-facebook-artwork-card"><div class="admin-facebook-artwork-head"><div><p class="eyebrow">Affiche</p><h2>${esc(formatByKey(pub.format).label)}</h2></div><button type="button" class="secondary-button" data-fb-action="download">Télécharger PNG</button></div><div class="admin-facebook-canvas-wrap"><canvas id="adminFacebookArtwork" width="${formatByKey(pub.format).width}" height="${formatByKey(pub.format).height}" aria-label="Aperçu de l’affiche Animoa"></canvas></div></article>
        <article class="card admin-facebook-post-preview"><div class="admin-facebook-fb-head"><img src="assets/animoa-icon-official.png" alt=""><div><strong>Animoa</strong><span>Publication Facebook · aperçu</span></div><span class="admin-facebook-fb-more">•••</span></div><div class="admin-facebook-fb-copy"><p id="adminFacebookPreviewDescription">${esc(pub.description)}</p><p id="adminFacebookPreviewHashtags" class="admin-facebook-fb-tags">${esc(pub.hashtags)}</p></div><div class="admin-facebook-post-image-copy">L’image ci-dessus sera jointe à cette publication.</div></article>
        <article class="card card-pad admin-facebook-publish-card"><div><p class="eyebrow">Validation finale</p><h2>Publier sur Facebook</h2><p>${facebookUsable() ? `Page connectée : <strong>${esc(state.facebook.pageName || 'Animoa')}</strong>${state.facebook.apiVersion ? ` · API ${esc(state.facebook.apiVersion)}` : ''}` : 'La publication directe et la programmation utilisent la connexion sécurisée enregistrée dans Supabase.'}</p></div>
          <button type="button" class="primary-button admin-facebook-publish-button" data-fb-action="publish" ${busy || publishing || pub.status === 'published' || !state.remoteReady || !facebookUsable() ? 'disabled' : ''}>${state.busy === 'publish' ? 'Publication en cours…' : 'Publier maintenant'}</button>
          ${schedulePanelHtml(pub, busy)}
          ${!facebookUsable() ? '<button type="button" class="secondary-button" data-fb-action="facebook-status">Vérifier la connexion Facebook</button>' : ''}
        </article>
      </section>
    </div>`;
  }

  function historyHtml() {
    const items = state.publications.filter((item) => !state.draft || String(item.id) !== String(state.draft.id));
    if (!items.length) return '<div class="card card-pad admin-facebook-empty"><strong>Aucune publication enregistrée pour le moment.</strong><span>Générez une première proposition pour commencer l’historique.</span></div>';
    return `<div class="admin-facebook-history-list">${items.map((item) => {
      const schedule = item.status === 'scheduled' && item.scheduledAt ? ` · prévue ${dateLabel(item.scheduledAt)}` : '';
      return `<article class="card admin-facebook-history-card"><div class="admin-facebook-history-main"><div><span class="admin-facebook-status ${publicationStatusClass(item.status)}">${publicationStatusLabel(item.status)}</span><strong>${esc(item.hook || angleByKey(item.angleKey).label)}</strong><small>${esc(angleByKey(item.angleKey).label)} · ${esc(formatByKey(item.format).label)} · ${esc(dateLabel(item.updatedAt || item.createdAt))}${esc(schedule)}</small></div><p>${esc((item.description || '').slice(0, 170))}${(item.description || '').length > 170 ? '…' : ''}</p>${item.errorMessage ? `<span class="admin-facebook-history-error">${esc(item.errorMessage)}</span>` : ''}</div><div class="admin-facebook-history-actions"><button type="button" class="secondary-button" data-fb-action="edit-history" data-publication-id="${esc(item.id)}">Ouvrir</button>${item.status === 'scheduled' ? `<button type="button" class="secondary-button" data-fb-action="cancel-schedule" data-publication-id="${esc(item.id)}">Annuler programmation</button>` : ''}${item.facebookPermalinkUrl ? `<button type="button" class="secondary-button" data-fb-action="open-facebook" data-facebook-url="${esc(item.facebookPermalinkUrl)}">Voir sur Facebook</button>` : ''}<button type="button" class="text-button danger-text-button" data-fb-action="delete-history" data-publication-id="${esc(item.id)}" ${item.status === 'publishing' ? 'disabled' : ''}>Supprimer</button></div></article>`;
    }).join('')}</div>`;
  }

  function panelHtml(options = {}) {
    if (Array.isArray(options.mediaLibrary)) state.mediaLibrary = options.mediaLibrary;
    if (!state.loaded) queueMicrotask(() => load({ mediaLibrary: state.mediaLibrary }).then(() => rerender()));
    if (state.loaded && state.remoteReady && !state.facebook.checked) queueMicrotask(() => checkFacebookStatus());
    const counts = state.publications.reduce((acc, item) => { const status = item.status || 'draft'; acc[status] = (acc[status] || 0) + 1; return acc; }, { draft: 0, ready: 0, scheduled: 0, publishing: 0, published: 0, error: 0 });
    const notice = state.setupMissing ? `<div class="admin-facebook-notice"><strong>Mode test local disponible</strong><span>Le générateur fonctionne déjà dans le navigateur. Pour activer l’historique, la publication et la programmation, installez ensuite les SQL 11 et 12 et les fonctions Edge Facebook.</span></div>` : '';
    const feedback = state.error ? `<div class="admin-facebook-feedback is-error">${esc(state.error)}</div>` : state.message ? `<div class="admin-facebook-feedback">${esc(state.message)}</div>` : '';
    const html = `<div id="adminFacebookPanel" class="admin-facebook-page" data-version="${VERSION}">
      <article class="card card-pad admin-facebook-intro"><div><p class="eyebrow">Création interne · sans API IA payante</p><h2>Publications Facebook</h2><p>Générez des publications variées, composez l’affiche Animoa, puis publiez immédiatement ou programmez l’envoi depuis l’Administration.</p></div><div class="admin-facebook-intro-actions"><button type="button" class="primary-button" data-fb-action="generate">${state.draft ? 'Nouvelle idée' : 'Générer une publication'}</button><button type="button" class="secondary-button" data-fb-action="facebook-status">État Facebook</button></div></article>
      ${facebookConnectionHtml()}
      <div class="admin-facebook-stats"><div><span>Brouillons</span><strong>${counts.draft}</strong></div><div><span>Prêtes</span><strong>${counts.ready}</strong></div><div><span>Programmées</span><strong>${counts.scheduled + counts.publishing}</strong></div><div><span>Publiées</span><strong>${counts.published}</strong></div><div><span>Erreurs</span><strong>${counts.error}</strong></div><div><span>Médias disponibles</span><strong>${state.mediaLibrary.filter((item) => item.status !== 'archived').length}</strong></div></div>
      ${notice}${feedback}${state.draft ? editorHtml() : '<div class="card card-pad admin-facebook-start"><div><span class="admin-facebook-start-icon">f</span><div><h2>Créer une publication complète</h2><p>Animoa choisit un angle différent, une accroche, un texte d’affiche, une description, des hashtags, un format et un style graphique. Tout reste modifiable.</p></div></div><button type="button" class="primary-button" data-fb-action="generate">Générer ma première proposition</button></div>'}
      <section class="admin-facebook-history"><div class="admin-facebook-history-head"><div><p class="eyebrow">Historique</p><h2>Brouillons, programmations et publications</h2></div></div>${historyHtml()}</section>
    </div>`;
    scheduleCanvas();
    return html;
  }

  function rerender() {
    const root = document.getElementById('adminFacebookPanel');
    if (!root) return;
    root.outerHTML = panelHtml({ mediaLibrary: state.mediaLibrary });
  }

  function loadImage(url) {
    const safe = String(url || '');
    if (!safe) return Promise.resolve(null);
    if (imageCache.has(safe)) return imageCache.get(safe);
    const promise = new Promise((resolve) => {
      const img = new Image();
      if (/^https:\/\//i.test(safe)) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = safe;
    });
    imageCache.set(safe, promise);
    return promise;
  }
  function coverFocal(ctx, img, x, y, w, h, focusX = .5, focusY = .42, zoom = 1) {
    if (!img?.naturalWidth || !img?.naturalHeight) return;
    const baseScale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const scale = baseScale * clamp(zoom || 1, 1, 1.8);
    const sw = Math.min(img.naturalWidth, w / scale);
    const sh = Math.min(img.naturalHeight, h / scale);
    const desiredX = clamp(focusX, .05, .95) * img.naturalWidth - sw / 2;
    const desiredY = clamp(focusY, .05, .95) * img.naturalHeight - sh / 2;
    const sx = clamp(desiredX, 0, Math.max(0, img.naturalWidth - sw));
    const sy = clamp(desiredY, 0, Math.max(0, img.naturalHeight - sh));
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  function cover(ctx, img, x, y, w, h) { coverFocal(ctx, img, x, y, w, h, .5, .42, 1); }
  function estimateFocus(img) {
    if (!img?.naturalWidth || !img?.naturalHeight) return { x: .5, y: .42 };
    try {
      const size = 72;
      const probe = document.createElement('canvas');
      probe.width = size; probe.height = size;
      const pctx = probe.getContext('2d', { willReadFrequently: true });
      pctx.drawImage(img, 0, 0, size, size);
      const data = pctx.getImageData(0, 0, size, size).data;
      const lum = new Float32Array(size * size);
      const sat = new Float32Array(size * size);
      for (let i = 0; i < size * size; i += 1) {
        const r = data[i * 4] / 255, g = data[i * 4 + 1] / 255, b = data[i * 4 + 2] / 255;
        lum[i] = .2126 * r + .7152 * g + .0722 * b;
        sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
      }
      let total = 0, sx = 0, sy = 0;
      for (let y = 1; y < size - 1; y += 1) {
        for (let x = 1; x < size - 1; x += 1) {
          const i = y * size + x;
          const edge = Math.abs(lum[i - 1] - lum[i + 1]) + Math.abs(lum[i - size] - lum[i + size]);
          const nx = (x + .5) / size, ny = (y + .5) / size;
          const centerBias = 1.15 - Math.min(.45, Math.hypot(nx - .5, ny - .44) * .42);
          const upperBias = 1.08 - Math.max(0, ny - .68) * .18;
          const score = Math.pow(edge * 1.9 + sat[i] * .32 + .015, 1.35) * centerBias * upperBias;
          total += score; sx += nx * score; sy += ny * score;
        }
      }
      if (!total) return { x: .5, y: .42 };
      return { x: clamp(sx / total, .15, .85), y: clamp(sy / total - .025, .12, .78) };
    } catch {
      return { x: .5, y: .42 };
    }
  }
  async function autoFocusCurrent({ quiet = false, force = false } = {}) {
    if (!state.draft?.mediaThumbnailUrl) return;
    const key = focusKey(state.draft);
    if (!force && key && focusMap()[key]) return;
    const img = await loadImage(state.draft.mediaThumbnailUrl);
    const focus = estimateFocus(img);
    state.draft.focusX = focus.x;
    state.draft.focusY = focus.y;
    state.draft.mediaZoom = clamp(state.draft.mediaZoom || 1, 1, 1.8);
    rememberFocus(state.draft);
    markEdited();
    if (!quiet) rerender(); else scheduleCanvas();
  }
  function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr); ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
  }
  function wrapLines(ctx, text, maxWidth, maxLines = 4) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const lines = []; let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else { lines.push(line); line = word; if (lines.length >= maxLines - 1) break; }
    }
    if (line && lines.length < maxLines) lines.push(line);
    if (lines.join(' ').split(/\s+/).length < words.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.…]+$/, '')}…`;
    return lines;
  }
  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
    const lines = wrapLines(ctx, text, maxWidth, maxLines);
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return y + lines.length * lineHeight;
  }
  function drawBrandMark(ctx, logo, x, y, width, dark = false) {
    if (logo?.naturalWidth) {
      const ratio = logo.naturalHeight / logo.naturalWidth;
      ctx.drawImage(logo, x, y, width, width * ratio);
      return width * ratio;
    }
    ctx.fillStyle = dark ? BRAND.white : BRAND.dark;
    ctx.font = '900 52px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillText('animoa', x, y + 48);
    return 58;
  }
  function drawPaw(ctx, x, y, scale, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = BRAND.coral;
    [[0, 0, 16, 20], [28, -8, 14, 18], [-28, -8, 14, 18], [0, 27, 31, 25]].forEach(([dx, dy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(x + dx * scale, y + dy * scale, rx * scale, ry * scale, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }
  function drawBrandPill(ctx, logo, x, y, width = 270) {
    const h = 78;
    ctx.save();
    ctx.shadowColor = 'rgba(5,45,43,.16)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(255,255,255,.96)'; roundedRect(ctx, x, y, width, h, 39); ctx.fill();
    ctx.restore();
    drawBrandMark(ctx, logo, x + 24, y + 18, width - 48, false);
  }
  function drawCtaPill(ctx, x, y, text = 'animoa.fr', dark = false) {
    ctx.save();
    ctx.fillStyle = dark ? BRAND.dark : BRAND.coral;
    roundedRect(ctx, x, y, 205, 62, 31); ctx.fill();
    ctx.fillStyle = BRAND.white; ctx.font = '850 27px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(text, x + 102.5, y + 40); ctx.restore();
  }
  function drawSparkles(ctx, W, H, variant = 0) {
    const points = variant % 2
      ? [[.08,.16,14],[.91,.13,9],[.84,.82,12],[.12,.88,8]]
      : [[.1,.12,10],[.9,.2,15],[.92,.88,9],[.16,.79,12]];
    ctx.save();
    points.forEach(([px,py,r], i) => {
      ctx.globalAlpha = .72;
      ctx.fillStyle = i % 2 ? BRAND.coral : BRAND.primary;
      ctx.beginPath(); ctx.arc(W * px, H * py, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .28;
      ctx.beginPath(); ctx.arc(W * px, H * py, r * 2.4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  function drawPhotoRounded(ctx, photo, x, y, w, h, radius, pub, rotation = 0, border = 0) {
    if (!photo) return;
    ctx.save();
    const cx = x + w / 2, cy = y + h / 2;
    ctx.translate(cx, cy); ctx.rotate(rotation); ctx.translate(-cx, -cy);
    if (border > 0) {
      ctx.fillStyle = BRAND.white; ctx.save(); ctx.shadowColor = 'rgba(4,51,48,.20)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
      roundedRect(ctx, x - border, y - border, w + border * 2, h + border * 2, radius + border); ctx.fill(); ctx.restore();
    }
    roundedRect(ctx, x, y, w, h, radius); ctx.clip();
    coverFocal(ctx, photo, x, y, w, h, pub.focusX, pub.focusY, pub.mediaZoom);
    ctx.restore();
  }
  function drawPhotoCircle(ctx, photo, cx, cy, radius, pub, ring = BRAND.white) {
    if (!photo) return;
    ctx.save();
    ctx.shadowColor = 'rgba(4,51,48,.18)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
    ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();
    coverFocal(ctx, photo, cx - radius, cy - radius, radius * 2, radius * 2, pub.focusX, pub.focusY, pub.mediaZoom);
    ctx.restore();
  }
  function drawHeadline(ctx, text, x, y, maxWidth, size = 70, color = BRAND.ink, maxLines = 3) {
    ctx.fillStyle = color; ctx.font = `900 ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
    return drawWrapped(ctx, text, x, y, maxWidth, Math.round(size * 1.08), maxLines);
  }
  function drawSupport(ctx, text, x, y, maxWidth, size = 30, color = BRAND.dark, maxLines = 3) {
    ctx.fillStyle = color; ctx.font = `650 ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
    return drawWrapped(ctx, text, x, y, maxWidth, Math.round(size * 1.36), maxLines);
  }
  function safestPanel(pub, W, H, panelW, panelH) {
    const candidates = [
      { x: 54, y: 150 }, { x: W - panelW - 54, y: 150 },
      { x: 54, y: H - panelH - 62 }, { x: W - panelW - 54, y: H - panelH - 62 },
    ];
    const fx = clamp(pub.focusX, .05, .95) * W, fy = clamp(pub.focusY, .05, .95) * H;
    return candidates.sort((a,b) => {
      const da = Math.hypot(a.x + panelW/2 - fx, a.y + panelH/2 - fy);
      const db = Math.hypot(b.x + panelW/2 - fx, b.y + panelH/2 - fy);
      return db - da;
    })[0];
  }

  async function drawCanvas(force = false) {
    const ticket = ++canvasTicket;
    const pub = state.draft;
    const canvas = canvasElement();
    if (!pub || !canvas) return;
    const format = formatByKey(pub.format);
    if (canvas.width !== format.width) canvas.width = format.width;
    if (canvas.height !== format.height) canvas.height = format.height;
    const ctx = canvas.getContext('2d');
    const [photo, logo] = await Promise.all([loadImage(pub.mediaThumbnailUrl), loadImage('assets/animoa-wordmark-official.png')]);
    if (!force && ticket !== canvasTicket) return;
    const W = canvas.width, H = canvas.height;
    const style = visualByKey(pub.visualStyle).key;
    const portrait = H > W;
    ctx.clearRect(0, 0, W, H);

    if (style === 'full-photo' && photo) {
      coverFocal(ctx, photo, 0, 0, W, H, pub.focusX, pub.focusY, pub.mediaZoom);
      const wash = ctx.createLinearGradient(0, 0, W, H);
      wash.addColorStop(0, 'rgba(5,55,52,.06)'); wash.addColorStop(1, 'rgba(5,55,52,.28)');
      ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);
      drawBrandPill(ctx, logo, 58, 54, 270);
      const panelW = portrait ? 560 : 575, panelH = portrait ? 405 : 370;
      const panel = safestPanel(pub, W, H, panelW, panelH);
      ctx.save(); ctx.shadowColor = 'rgba(5,45,43,.25)'; ctx.shadowBlur = 42; ctx.shadowOffsetY = 18;
      ctx.fillStyle = 'rgba(255,255,255,.93)'; roundedRect(ctx, panel.x, panel.y, panelW, panelH, 46); ctx.fill(); ctx.restore();
      ctx.fillStyle = BRAND.coral; roundedRect(ctx, panel.x + 30, panel.y + 30, 126, 38, 19); ctx.fill();
      ctx.fillStyle = BRAND.white; ctx.font = '850 19px system-ui'; ctx.fillText('ANIMOA', panel.x + 53, panel.y + 56);
      const end = drawHeadline(ctx, pub.hook, panel.x + 32, panel.y + 135, panelW - 64, 61, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, panel.x + 32, end + 8, panelW - 64, 27, BRAND.dark, 3);
      drawCtaPill(ctx, panel.x + panelW - 236, panel.y + panelH - 82);
      drawSparkles(ctx, W, H, 1);
      return;
    }

    if (style === 'split') {
      const grad = ctx.createLinearGradient(0, 0, W, H); grad.addColorStop(0, '#E9FBF8'); grad.addColorStop(.58, '#FFFFFF'); grad.addColorStop(1, '#FFF0EF');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = BRAND.primary; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * .59, 0); ctx.lineTo(W * .43, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,111,115,.92)'; ctx.beginPath(); ctx.arc(W * .87, H * .15, 125, 0, Math.PI * 2); ctx.fill();
      const photoX = 58, photoY = portrait ? 215 : 170, photoW = W * .52, photoH = portrait ? H * .47 : H * .58;
      drawPhotoRounded(ctx, photo, photoX, photoY, photoW, photoH, 54, pub, -.035, 10);
      drawBrandPill(ctx, logo, W - 332, 58, 274);
      const textX = W * .53, textW = W * .40;
      const end = drawHeadline(ctx, pub.hook, textX, portrait ? H * .47 : H * .40, textW, portrait ? 66 : 62, BRAND.ink, 4);
      drawSupport(ctx, pub.imageText, textX, end + 18, textW, 29, BRAND.dark, 4);
      drawCtaPill(ctx, W - 265, H - 100);
      drawSparkles(ctx, W, H, 0);
      return;
    }

    if (style === 'minimal') {
      const grad = ctx.createRadialGradient(W * .68, H * .24, 30, W * .5, H * .5, H * .8);
      grad.addColorStop(0, '#FFF7F5'); grad.addColorStop(.48, '#F4FFFD'); grad.addColorStop(1, '#D8F5F1');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(32,184,174,.17)'; ctx.beginPath(); ctx.arc(W * .15, H * .28, 175, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,111,115,.18)'; ctx.beginPath(); ctx.arc(W * .83, H * .74, 225, 0, Math.PI * 2); ctx.fill();
      drawBrandPill(ctx, logo, 64, 58, 270);
      const radius = portrait ? 245 : 220;
      drawPhotoCircle(ctx, photo, W * .69, portrait ? H * .34 : H * .37, radius, pub, BRAND.white);
      ctx.fillStyle = BRAND.coral; ctx.beginPath(); ctx.arc(W * .88, portrait ? H * .21 : H * .20, 47, 0, Math.PI * 2); ctx.fill(); drawPaw(ctx, W * .88, portrait ? H * .21 : H * .20, .75, .95);
      const startY = portrait ? H * .60 : H * .64;
      const end = drawHeadline(ctx, pub.hook, 70, startY, W - 140, portrait ? 70 : 64, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, 70, end + 18, W - 140, 30, BRAND.dark, 3);
      drawCtaPill(ctx, 70, H - 96);
      drawSparkles(ctx, W, H, 1);
      return;
    }

    if (style === 'poster') {
      const grad = ctx.createLinearGradient(0, 0, W, H); grad.addColorStop(0, '#063E3B'); grad.addColorStop(.58, '#087D78'); grad.addColorStop(1, '#20B8AE');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = BRAND.coral; ctx.beginPath(); ctx.arc(W * .88, H * .05, 230, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.beginPath(); ctx.arc(W * .15, H * .90, 270, 0, Math.PI * 2); ctx.fill();
      drawBrandPill(ctx, logo, 62, 54, 272);
      const pw = portrait ? 460 : 430, ph = portrait ? 520 : 430;
      drawPhotoRounded(ctx, photo, W - pw - 62, portrait ? 170 : 150, pw, ph, 56, pub, .035, 12);
      ctx.fillStyle = BRAND.white; roundedRect(ctx, 52, portrait ? H * .49 : H * .47, W * .70, portrait ? 450 : 400, 50); ctx.fill();
      const tx = 86, ty = portrait ? H * .58 : H * .57, tw = W * .62;
      const end = drawHeadline(ctx, pub.hook, tx, ty, tw, portrait ? 71 : 65, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, tx, end + 15, tw, 29, BRAND.dark, 3);
      drawCtaPill(ctx, W - 270, H - 105);
      drawSparkles(ctx, W, H, 0);
      return;
    }

    if (style === 'soft') {
      const grad = ctx.createLinearGradient(0, 0, W, H); grad.addColorStop(0, '#FFF3F2'); grad.addColorStop(.42, '#FFFFFF'); grad.addColorStop(1, '#DFF7F4');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,111,115,.22)'; ctx.beginPath(); ctx.arc(W * .86, H * .18, 180, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(32,184,174,.18)'; ctx.beginPath(); ctx.arc(W * .16, H * .82, 210, 0, Math.PI * 2); ctx.fill();
      drawBrandPill(ctx, logo, 62, 54, 270);
      const px = portrait ? 120 : 110, py = portrait ? 190 : 165, pw = portrait ? W - 240 : W * .58, ph = portrait ? H * .43 : H * .52;
      drawPhotoRounded(ctx, photo, px, py, pw, ph, 42, pub, -.045, 16);
      ctx.save(); ctx.translate(px + pw - 78, py + 62); ctx.rotate(.12); ctx.fillStyle = BRAND.coral; roundedRect(ctx, 0, 0, 162, 58, 18); ctx.fill(); ctx.fillStyle = BRAND.white; ctx.font = '850 22px system-ui'; ctx.fillText('🐾 CARNET DE VIE', 18, 37); ctx.restore();
      const cardY = portrait ? H * .62 : H * .56;
      ctx.save(); ctx.shadowColor = 'rgba(4,51,48,.15)'; ctx.shadowBlur = 38; ctx.shadowOffsetY = 14; ctx.fillStyle = 'rgba(255,255,255,.95)'; roundedRect(ctx, 70, cardY, W - 140, portrait ? 390 : 360, 48); ctx.fill(); ctx.restore();
      const end = drawHeadline(ctx, pub.hook, 105, cardY + 94, W - 210, portrait ? 66 : 61, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, 105, end + 13, W - 210, 28, BRAND.dark, 3);
      drawCtaPill(ctx, W - 300, cardY + (portrait ? 300 : 270));
      drawSparkles(ctx, W, H, 1);
      return;
    }

    if (style === 'sticker') {
      ctx.fillStyle = '#FFF9F1'; ctx.fillRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, 'rgba(32,184,174,.14)'); bg.addColorStop(1, 'rgba(255,111,115,.14)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      drawBrandPill(ctx, logo, 62, 54, 270);
      const mainW = portrait ? 650 : 590, mainH = portrait ? 600 : 530;
      drawPhotoRounded(ctx, photo, W - mainW - 70, portrait ? 185 : 160, mainW, mainH, 64, pub, .025, 12);
      ctx.fillStyle = BRAND.primary; ctx.save(); ctx.translate(65, portrait ? 285 : 240); ctx.rotate(-.08); roundedRect(ctx, 0, 0, 360, 110, 28); ctx.fill(); ctx.restore();
      ctx.fillStyle = BRAND.white; ctx.font = '900 34px system-ui'; ctx.save(); ctx.translate(92, portrait ? 347 : 302); ctx.rotate(-.08); ctx.fillText('PLUS SIMPLE 🐾', 0, 0); ctx.restore();
      const cardY = portrait ? H * .62 : H * .58;
      ctx.fillStyle = BRAND.white; ctx.save(); ctx.shadowColor = 'rgba(4,51,48,.16)'; ctx.shadowBlur = 34; roundedRect(ctx, 62, cardY, W - 124, portrait ? 390 : 340, 46); ctx.fill(); ctx.restore();
      const end = drawHeadline(ctx, pub.hook, 96, cardY + 92, W - 192, portrait ? 65 : 60, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, 96, end + 12, W - 192, 28, BRAND.dark, 3);
      drawCtaPill(ctx, 96, cardY + (portrait ? 292 : 245));
      drawPaw(ctx, W - 110, H - 110, 1.25, .22);
      drawSparkles(ctx, W, H, 0);
      return;
    }

    if (style === 'magazine') {
      ctx.fillStyle = BRAND.white; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = BRAND.dark; ctx.fillRect(0, 0, W, portrait ? 180 : 155);
      drawBrandPill(ctx, logo, 58, 50, 270);
      ctx.fillStyle = BRAND.coral; ctx.font = '900 26px system-ui'; ctx.textAlign = 'right'; ctx.fillText('LE CARNET DE VIE DE VOTRE ANIMAL', W - 58, 102); ctx.textAlign = 'left';
      const imageY = portrait ? 195 : 170, imageH = portrait ? H * .48 : H * .50;
      if (photo) {
        drawPhotoRounded(ctx, photo, 58, imageY, W - 116, imageH, 34, pub, 0, 0);
      } else {
        ctx.fillStyle = BRAND.pale; roundedRect(ctx, 58, imageY, W - 116, imageH, 34); ctx.fill();
      }
      ctx.fillStyle = BRAND.primary; roundedRect(ctx, 75, imageY + imageH - 44, 255, 70, 35); ctx.fill();
      ctx.fillStyle = BRAND.white; ctx.font = '850 24px system-ui'; ctx.fillText('ANIMOA · CONSEIL', 102, imageY + imageH + 1);
      const textY = imageY + imageH + 100;
      const end = drawHeadline(ctx, pub.hook, 66, textY, W - 132, portrait ? 66 : 61, BRAND.ink, 3);
      drawSupport(ctx, pub.imageText, 66, end + 15, W - 132, 29, BRAND.dark, 3);
      drawCtaPill(ctx, W - 275, H - 96);
      ctx.fillStyle = BRAND.coral; ctx.fillRect(66, H - 74, W - 370, 8);
      return;
    }

    // Éclat Animoa : composition par défaut, forte mais lisible.
    const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#20B8AE'); bg.addColorStop(.56, '#0A8C86'); bg.addColorStop(1, '#FF777B');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.beginPath(); ctx.arc(W * .08, H * .14, 210, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.beginPath(); ctx.arc(W * .90, H * .80, 250, 0, Math.PI * 2); ctx.fill();
    drawBrandPill(ctx, logo, 58, 54, 270);
    const ph = portrait ? H * .50 : H * .53, py = portrait ? 185 : 160;
    drawPhotoRounded(ctx, photo, 80, py, W - 160, ph, 58, pub, -.018, 12);
    const cardY = py + ph - 42;
    ctx.save(); ctx.shadowColor = 'rgba(4,51,48,.26)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 18; ctx.fillStyle = BRAND.white; roundedRect(ctx, 54, cardY, W - 108, portrait ? 410 : 360, 50); ctx.fill(); ctx.restore();
    ctx.fillStyle = BRAND.coral; roundedRect(ctx, 88, cardY + 30, 130, 40, 20); ctx.fill(); ctx.fillStyle = BRAND.white; ctx.font = '850 19px system-ui'; ctx.fillText('ANIMOA', 119, cardY + 57);
    const end = drawHeadline(ctx, pub.hook, 88, cardY + 145, W - 176, portrait ? 68 : 63, BRAND.ink, 3);
    drawSupport(ctx, pub.imageText, 88, end + 12, W - 176, 29, BRAND.dark, 3);
    drawCtaPill(ctx, W - 290, cardY + (portrait ? 318 : 270));
    drawSparkles(ctx, W, H, 0);
  }
  function scheduleCanvas() { queueMicrotask(() => requestAnimationFrame(() => drawCanvas().catch(() => {}))); }

  document.addEventListener('input', (event) => {
    if (event.target?.matches?.('select')) return;
    const field = event.target?.dataset?.fbField;
    if (!field) return;
    updateDraftField(field, event.target.value);
  });
  document.addEventListener('change', (event) => {
    const field = event.target?.dataset?.fbField;
    if (!field) return;
    updateDraftField(field, event.target.value);
  });
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-fb-action]');
    if (!target) return;
    const action = target.dataset.fbAction;
    const publishingLockedActions = new Set(['regenerate-text', 'regenerate-image', 'next-media', 'search-stock', 'clear-media', 'choose-media', 'choose-stock-photo', 'auto-focus', 'reset-crop', 'save', 'ready', 'delete-current', 'schedule', 'cancel-schedule']);
    if (['publishing', 'published'].includes(state.draft?.status) && publishingLockedActions.has(action)) {
      state.message = '';
      state.error = 'Cette publication est déjà envoyée ou en cours d’envoi. Elle ne peut plus être modifiée.';
      rerender();
      return;
    }
    if (action === 'generate') {
      state.draft = createPublication();
      state.stockPhotos = []; state.stockError = ''; state.message = ''; state.error = '';
      remember(state.draft); rerender();
      await autoFocusCurrent({ quiet: true });
      await searchStockPhotos({ autoSelect: true, quiet: true });
      return;
    }
    if (action === 'regenerate-text') { regenerateText(); state.message = ''; state.error = ''; rerender(); return; }
    if (action === 'regenerate-image') { regenerateVisual(); state.message = ''; state.error = ''; rerender(); return; }
    if (action === 'next-media') {
      nextMedia(); state.message = ''; state.error = ''; rerender();
      await autoFocusCurrent({ quiet: false });
      return;
    }
    if (action === 'search-stock') { await searchStockPhotos({ autoSelect: false }); return; }
    if (action === 'clear-media' && state.draft) { Object.assign(state.draft, mediaSnapshot(null)); markEdited(); rerender(); return; }
    if (action === 'choose-media' && state.draft) {
      const item = state.mediaLibrary.find((entry) => String(entry.id) === String(target.dataset.mediaId));
      Object.assign(state.draft, mediaSnapshot(item)); markEdited(); rerender();
      await autoFocusCurrent({ quiet: false });
      return;
    }
    if (action === 'choose-stock-photo' && state.draft) {
      const item = state.stockPhotos.find((entry) => String(entry.source || '') === String(target.dataset.stockSource || '') && String(entry.sourceId || entry.id || '') === String(target.dataset.stockId || ''));
      if (item) {
        Object.assign(state.draft, mediaSnapshot(item)); markEdited(); rerender();
        await autoFocusCurrent({ quiet: false });
      }
      return;
    }
    if (action === 'auto-focus' && state.draft) { await autoFocusCurrent({ force: true, quiet: false }); return; }
    if (action === 'reset-crop' && state.draft) {
      state.draft.focusX = .5; state.draft.focusY = .42; state.draft.mediaZoom = 1;
      rememberFocus(state.draft); markEdited(); rerender(); return;
    }
    if (action === 'save') { if (state.draft?.status === 'scheduled') await saveScheduledChanges(); else await saveDraft('draft'); return; }
    if (action === 'ready') { await saveDraft('ready'); return; }
    if (action === 'download') { downloadArtwork(); return; }
    if (action === 'delete-current') { await deletePublication(state.draft?.id); return; }
    if (action === 'publish') { await publishCurrent(); return; }
    if (action === 'schedule') { await scheduleCurrent(); return; }
    if (action === 'cancel-schedule') { await cancelSchedule(target.dataset.publicationId || ''); return; }
    if (action === 'facebook-status') { state.error = ''; state.message = ''; await checkFacebookStatus(true); if (!state.facebook.configured && !state.error) state.message = 'La connexion Facebook n’est pas encore configurée.'; rerender(); return; }
    if (action === 'edit-history') { const item = state.publications.find((entry) => String(entry.id) === String(target.dataset.publicationId)); if (item) { state.draft = { ...item }; state.message = ''; state.error = ''; rerender(); document.getElementById('adminFacebookPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if (action === 'delete-history') { await deletePublication(target.dataset.publicationId); return; }
    if (action === 'open-facebook') { try { const url = new URL(target.dataset.facebookUrl || ''); if (url.protocol === 'https:' && /(^|\.)facebook\.com$/i.test(url.hostname)) window.open(url.href, '_blank', 'noopener,noreferrer'); } catch {} return; }
  });

  window.AnimoaFacebookAdmin = Object.freeze({
    version: VERSION,
    load,
    refresh,
    panelHtml,
    setMediaLibrary(items) { state.mediaLibrary = Array.isArray(items) ? items : []; scheduleCanvas(); },
    count() { return state.publications.length; },
  });
})();
