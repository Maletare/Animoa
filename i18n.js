(() => {
  'use strict';

  const LANGUAGE_KEY = 'animoa_language';
  const supported = new Set(['fr', 'en']);
  let language = supported.has(localStorage.getItem(LANGUAGE_KEY)) ? localStorage.getItem(LANGUAGE_KEY) : 'fr';

  const exact = {
    'Accueil': 'Home',
    'Santé': 'Health',
    'Dépenses': 'Expenses',
    'Souvenirs': 'Memories',
    'Poids': 'Weight',
    'Mes animaux': 'My pets',
    'Paramètres': 'Settings',
    'Ajouter': 'Add',
    'Ajouter rapidement': 'Quick add',
    'Ajout rapide': 'Quick add',
    'Ajouter un animal': 'Add a pet',
    'Ajouter un nouveau compagnon': 'Add a new companion',
    'Ajouter aux favoris': 'Add to favourites',
    'Ajouter une photo': 'Add a photo',
    'Ajouter un fichier ou une image': 'Add a file or image',
    'Remplacer le fichier ou l’image': 'Replace file or image',
    'Fichier ou image': 'File or image',
    'Voir le fichier ou l’image': 'View file or image',
    'Fichier joint': 'Attachment',
    'Préférences': 'Preferences',
    'Affichage et unités': 'Display and units',
    'Cette action supprime le carnet et les photos de ce compte.': 'This deletes the journal and photos for this account.',
    'Choisir une photo': 'Choose a photo',
    'Remplacer la photo': 'Replace photo',
    'Aucun fichier sélectionné': 'No file selected',
    'Changer': 'Change',
    'Choisir': 'Choose',
    'Actif': 'Active',
    'Animal consulté': 'Current pet',
    'Animal actuellement consulté': 'Pet currently viewed',
    'Chaque compagnon possède son propre carnet.': 'Each companion has their own journal.',
    'Aucun compagnon': 'No companion yet',
    'Ajoute ton premier compagnon pour créer son carnet de vie.': 'Add your first companion to create their life journal.',
    'Bonjour': 'Hello',
    'L’essentiel, sans surcharge.': 'Everything that matters, without clutter.',
    'Profil': 'Profile',
    'Modifier': 'Edit',
    'Supprimer': 'Delete',
    'Supprimer cet animal': 'Delete this pet',
    'Gestion du profil': 'Profile management',
    'Cette action retire aussi son carnet de santé, ses dépenses, ses poids et ses souvenirs.': 'This also removes their health records, expenses, weights and memories.',
    'Date de naissance': 'Date of birth',
    'La date de naissance': 'Date of birth',
    'La date de pesée': 'Weighing date',
    'La date de la dépense': 'Expense date',
    'La date du souvenir': 'Memory date',
    'La date': 'The date',
    'Âge': 'Age',
    'Sexe': 'Sex',
    'Poids actuel': 'Current weight',
    'Couleur': 'Colour',
    'Identification': 'Identification',
    'Allergies': 'Allergies',
    'Informations importantes': 'Important information',
    'Non renseigné': 'Not provided',
    'Non renseignée': 'Not provided',
    'Non renseignées': 'Not provided',
    'Aucune': 'None',
    'Application': 'Application',
    'Seulement les réglages réellement utiles.': 'Only the settings that are genuinely useful.',
    'Devise': 'Currency',
    'Unité de poids': 'Weight unit',
    'Langue': 'Language',
    'Apparence': 'Appearance',
    'Clair': 'Light',
    'Sombre': 'Dark',
    'Système': 'System',
    'Français': 'French',
    'Anglais': 'English',
    'Enregistrer': 'Save',
    'Enregistrer les modifications': 'Save changes',
    'Paramètres enregistrés.': 'Settings saved.',
    'Compte': 'Account',
    'Se déconnecter': 'Sign out',
    'Synchronisation sécurisée activée': 'Secure sync enabled',
    'Mode local de prévisualisation': 'Local preview mode',
    'Les données de ce compte sont synchronisées avec Supabase.': 'This account’s data is synced with Supabase.',
    'Les données restent uniquement dans ce navigateur.': 'Data stays only in this browser.',
    'Effacer toutes les données': 'Delete all data',
    'Action sensible': 'Sensitive action',
    'Toutes les données locales seront effacées.': 'All local data will be deleted.',
    'Compagnons, santé, dépenses, poids, souvenirs et photos seront définitivement supprimés de ce navigateur.': 'Companions, health records, expenses, weights, memories and photos will be permanently removed from this browser.',
    'Annuler': 'Cancel',
    'Oui, tout effacer': 'Yes, delete everything',
    'Toutes les données ont été effacées.': 'All data has been deleted.',
    'Que veux-tu ajouter ?': 'What would you like to add?',
    'Compagnon': 'Companion',
    'Dépense': 'Expense',
    'Souvenir': 'Memory',
    'Information de santé': 'Health information',
    'Nouvelle dépense': 'New expense',
    'Nouveau poids': 'New weight',
    'Nouveau souvenir': 'New memory',
    'Nouvel animal': 'New pet',
    'Type': 'Type',
    'Titre': 'Title',
    'Date': 'Date',
    'État': 'Status',
    'À venir': 'Upcoming',
    'Effectué': 'Completed',
    'Vétérinaire ou professionnel': 'Vet or professional',
    'Note': 'Note',
    'Créer un rappel dans Animoa': 'Create a reminder in Animoa',
    'Montant': 'Amount',
    'Catégorie': 'Category',
    'Description': 'Description',
    'Photo': 'Photo',
    'Anecdote': 'Story',
    'Race, variété ou type': 'Breed, variety or type',
    'Espèce': 'Species',
    'Date de pesée': 'Weighing date',
    'Cette valeur reste liée à l’historique de poids.': 'This value remains linked to the weight history.',
    'Puce, tatouage...': 'Microchip, tattoo...',
    'Créer le profil': 'Create profile',
    'Enregistrer la dépense': 'Save expense',
    'Enregistrer le poids': 'Save weight',
    'Enregistrer le souvenir': 'Save memory',
    'Enregistrement…': 'Saving…',
    'Facultatif': 'Optional',
    'Informations utiles': 'Useful information',
    'Raconte ce moment...': 'Tell the story of this moment...',
    'Ex. Rappel annuel': 'E.g. annual booster',
    'Ex. Croquettes': 'E.g. pet food',
    'Ex. Première baignade': 'E.g. first swim',
    'Ex. Milo': 'E.g. Milo',
    'Écris directement les 8 chiffres, par exemple 15062009.': 'Enter the 8 digits directly, for example 15062009.',
    'Laisse vide pour conserver la photo actuelle.': 'Leave empty to keep the current photo.',
    'La photo est automatiquement allégée puis stockée séparément.': 'The photo is automatically optimised and stored separately.',
    'Laisse vide pour conserver la photo actuelle. La nouvelle photo sera automatiquement allégée.': 'Leave empty to keep the current photo. The new photo will be automatically optimised.',
    'Vaccin': 'Vaccine',
    'Rendez-vous': 'Appointment',
    'Traitement': 'Treatment',
    'Médicament': 'Medication',
    'Analyse': 'Test',
    'Document': 'Document',
    'Autre': 'Other',
    'Tous': 'All',
    'Nourriture': 'Food',
    'Vétérinaire': 'Veterinary',
    'Médicaments': 'Medication',
    'Toilettage': 'Grooming',
    'Jouets': 'Toys',
    'Accessoires': 'Accessories',
    'Assurance': 'Insurance',
    'Moment important': 'Important moment',
    'Première fois': 'First time',
    'Anniversaire': 'Birthday',
    'Chien': 'Dog',
    'Chat': 'Cat',
    'Lapin': 'Rabbit',
    'Oiseau': 'Bird',
    'Femelle': 'Female',
    'Mâle': 'Male',
    'Aucun rappel à venir.': 'No upcoming reminders.',
    'Rappels à venir': 'Upcoming reminders',
    'Notifications': 'Notifications',
    'Choisir un animal': 'Choose a pet',
    'Ouvrir le menu': 'Open menu',
    'Fermer': 'Close',
    'Voir les rappels': 'View reminders',
    'Navigation principale': 'Main navigation',
    'Navigation mobile': 'Mobile navigation',
    'Toute sa vie, près de vous.': 'Their whole life, close to you.',
    'Aucune information': 'No information',
    'Aucun résultat': 'No results',
    'Aucune dépense enregistrée.': 'No expenses recorded.',
    'Aucun poids enregistré.': 'No weights recorded.',
    'Aucun souvenir enregistré.': 'No memories recorded.',
    'Aucune information de santé.': 'No health information.',
    'Modifier une information': 'Edit information',
    'Modifier le poids': 'Edit weight',
    'Modifier la dépense': 'Edit expense',
    'Modifier le souvenir': 'Edit memory',
    'Supprimer définitivement': 'Delete permanently',
    'Modification enregistrée.': 'Changes saved.',
    'Photo enregistrée.': 'Photo saved.',
    'Ajoute d’abord un animal.': 'Add a pet first.',
    'Défile horizontalement pour voir toutes les catégories.': 'Swipe horizontally to see all categories.',
    'Aucun rappel': 'No reminder',
    'Prochaine échéance': 'Next due date',
    'Ce mois-ci': 'This month',
    'Cette année': 'This year',
    'Depuis janvier': 'Since January',
    'Dans son journal': 'In their journal',
    'Dans son carnet': 'In their record',
    'Aucune mesure': 'No measurement',
    'Historique': 'History',
    'Budget': 'Budget',
    'Carnet de vie': 'Life journal',
    'Dernier poids': 'Latest weight',
    'Voir le carnet': 'View journal',
    'Données enregistrées': 'Saved data',
    'Synchronisation en cours…': 'Syncing…',
    'Synchronisé': 'Synced',
    'Hors ligne': 'Offline',
    'Impossible de synchroniser les données. Elles restent enregistrées sur cet appareil.': 'Unable to sync data. It remains saved on this device.',
    'Bienvenue': 'Welcome',
    'Ajoute ton premier compagnon': 'Add your first companion',
    'Animoa commencera par créer son carnet de vie.': 'Animoa will begin by creating their life journal.',
    'Quelques informations suffisent pour commencer.': 'A few details are enough to get started.',
    'Rien à afficher': 'Nothing to display',
    'Aucun souvenir': 'No memories yet',
    'Ajoute une photo ou une anecdote.': 'Add a photo or a story.',
    'Dernier souvenir': 'Latest memory',
    'Catégories': 'Categories',
    'Tout le dossier': 'Full record',
    'Fais glisser le bandeau sur le côté, ou utilise les flèches.': 'Swipe the bar sideways, or use the arrows.',
    'Filtrer le carnet de santé': 'Filter health records',
    'Voir les catégories précédentes': 'View previous categories',
    'Voir les catégories suivantes': 'View next categories',
    'En retard': 'Overdue',
    'Aucun détail': 'No details',
    'Répartition annuelle': 'Annual breakdown',
    'Graphique simple': 'Simple chart',
    'Aucune dépense cette année.': 'No expenses this year.',
    'Total annuel': 'Annual total',
    'Évolution': 'Change',
    'Mesure enregistrée': 'Recorded measurement',
    'Coût annuel': 'Annual cost',
    'Dépenses du mois': 'Monthly expenses',
    'Ajoute une première mesure': 'Add a first measurement',
    'Âge non renseigné': 'Age not provided',
    'Information de santé enregistrée.': 'Health information saved.',
    'Information de santé modifiée.': 'Health information updated.',
    'Dépense enregistrée.': 'Expense saved.',
    'Dépense modifiée.': 'Expense updated.',
    'Poids enregistré.': 'Weight saved.',
    'Mesure de poids modifiée.': 'Weight measurement updated.',
    'Souvenir enregistré.': 'Memory saved.',
    'Souvenir modifié.': 'Memory updated.',
    'Profil modifié.': 'Profile updated.',
    'Animal ajouté.': 'Pet added.',
    'Élément supprimé.': 'Item deleted.',
    'Cet élément n’existe plus.': 'This item no longer exists.',
    'Cette information n’existe plus.': 'This information no longer exists.',
    'Cette mesure n’existe plus.': 'This measurement no longer exists.',
    'Cette dépense n’existe plus.': 'This expense no longer exists.',
    'Impossible de changer d’animal.': 'Unable to change pet.',
    'Déconnexion impossible.': 'Unable to sign out.',
    'Suppression impossible.': 'Unable to delete.',
    'Suppression des données impossible.': 'Unable to delete data.',
    'Une erreur est survenue.': 'Something went wrong.',
    'Indique un montant supérieur à zéro.': 'Enter an amount greater than zero.',
    'Indique un poids valide.': 'Enter a valid weight.',
    'Le fichier choisi n’est pas une image.': 'The selected file is not an image.',
    'Cette image est trop volumineuse. Choisis une photo de moins de 20 Mo.': 'This image is too large. Choose a photo under 20 MB.',
    'Ce fichier est trop volumineux. Choisis un fichier de moins de 15 Mo.': 'This file is too large. Choose a file under 15 MB.',
    'Impossible de réduire cette photo.': 'Unable to optimise this photo.',
    'Impossible de préparer la photo.': 'Unable to prepare this photo.',
    'Impossible d’enregistrer la photo.': 'Unable to save the photo.',
    'Enregistrement de la photo annulé.': 'Photo saving cancelled.',
    'Impossible de lire la photo.': 'Unable to read the photo.',
    'Impossible d’ouvrir le stockage des photos.': 'Unable to open photo storage.',
    'Le stockage des photos est bloqué par un autre onglet Animoa.': 'Photo storage is blocked by another Animoa tab.',
    'Impossible d’enregistrer les données sur cet appareil.': 'Unable to save data on this device.',
    'Impossible d’enregistrer les paramètres.': 'Unable to save settings.',
    'Le stockage local est plein. Les photos sont maintenant séparées des données ; recharge Animoa puis réessaie.': 'Local storage is full. Reload Animoa and try again.',
    'Une information à venir doit être datée d’aujourd’hui ou plus tard.': 'Upcoming information must be dated today or later.',
    'Une information effectuée doit être datée d’aujourd’hui ou d’une date passée.': 'Completed information must be dated today or earlier.',
    'Une information à venir ne peut pas avoir une date passée. Modifie la date ou indique « Effectué ».': 'Upcoming information cannot have a past date. Change the date or mark it as completed.',
    'Une information effectuée ne peut pas avoir une date future.': 'Completed information cannot have a future date.',
    'Autorise l’ouverture du fichier dans ton navigateur.': 'Allow the file to open in your browser.',
    'Aucune note.': 'No note.',
    'Aucune anecdote.': 'No story.',
    'Souvenir favori': 'Favourite memory',
    'Mesure de poids': 'Weight measurement',
    'Courbe de poids': 'Weight chart',
    'Courbe d’évolution': 'Trend chart',
    'Journal de vie': 'Life journal',
    'Les informations essentielles de son dossier.': 'The essential information in their record.',
    'Nouvelle information': 'New information',
    'Prochain rappel': 'Next reminder',
    'Voir le rappel →': 'View reminder →',
    'À ne pas manquer': 'Don’t miss',
    'Cet animal n’existe plus.': 'This pet no longer exists.',
    'Confirmer la suppression': 'Confirm deletion',
    'Oui, supprimer': 'Yes, delete',
    'Cette suppression est définitive sur cet appareil.': 'This deletion is permanent on this device.',
    'cette information de santé': 'this health information',
    'cette mesure de poids': 'this weight measurement',
    'cette dépense': 'this expense',
    'ce souvenir': 'this memory',
    'cet élément': 'this item',
    'Professionnel': 'Professional',
    'Euro (€)': 'Euro (€)',
    'Franc suisse (CHF)': 'Swiss franc (CHF)',
    'Dollar canadien (CAD)': 'Canadian dollar (CAD)',
    'Kilogrammes (kg)': 'Kilograms (kg)',
    'Livres (lb)': 'Pounds (lb)'
  };

  function translateKnownWord(value) {
    const raw = String(value || '').trim();
    if (!raw) return raw;
    if (exact[raw]) return exact[raw];
    const capitalized = `${raw.charAt(0).toUpperCase()}${raw.slice(1)}`;
    return exact[capitalized] || raw;
  }

  function translateRangeText(value) {
    return String(value || '').replace(/\s+à\s+/gu, ' to ');
  }

  /** @type {Array<[RegExp, (...args: string[]) => string]>} */
  const phraseReplacements = [
    [/^La vie de (.+)$/u, (_, name) => `${name}'s life`],
    [/^Photo de (.+)$/u, (_, name) => `Photo of ${name}`],
    [/^Supprimer définitivement (.+?)\s*\?$/u, (_, label) => `Permanently delete ${translateKnownWord(label)}?`],
    [/^Supprimer (.+?)\s*\?$/u, (_, name) => `Delete ${name}?`],
    [/^Supprimer (.+)$/u, (_, name) => `Delete ${name}`],
    [/^(.+) a été supprimé\.$/u, (_, name) => `${name} has been deleted.`],
    [/^(.+) est maintenant sélectionné\.$/u, (_, name) => `${name} is now selected.`],
    [/^(.+) est déjà sélectionné\.$/u, (_, name) => `${name} is already selected.`],
    [/^(\d+) ans?$/u, (_, n) => `${n} year${n === '1' ? '' : 's'}`],
    [/^(\d+) mois$/u, (_, n) => `${n} month${n === '1' ? '' : 's'}`],
    [/^(\d+) éléments?$/u, (_, n) => `${n} item${n === '1' ? '' : 's'}`],
    [/^(\d+) dépenses?$/u, (_, n) => `${n} expense${n === '1' ? '' : 's'}`],
    [/^(\d+) mesures?$/u, (_, n) => `${n} measurement${n === '1' ? '' : 's'}`],
    [/^(\d+) souvenirs?$/u, (_, n) => `${n} memor${n === '1' ? 'y' : 'ies'}`],
    [/^([+-]?[\d.,]+)\s+(kg|lb) depuis la mesure précédente$/u, (_, amount, unit) => `${amount} ${unit} since the previous measurement`],
    [/^Depuis la dernière mesure$/u, () => 'Since the previous measurement'],
    [/^Depuis la mesure précédente$/u, () => 'Since the previous measurement'],
    [/^Pour un (.+), valeur admise : (.+)$/u, (_, pet, rest) => `For a ${translateKnownWord(pet).toLowerCase()}, accepted range: ${translateRangeText(rest)}`],
    [/^Pour un (.+) : (.+)$/u, (_, pet, rest) => `For a ${translateKnownWord(pet).toLowerCase()}: ${translateRangeText(rest)}`],
    [/^Aucun (.+) enregistré\.$/u, (_, what) => `No ${translateKnownWord(what).toLowerCase()} recorded.`],
    [/^Aucune information dans « (.+) »\.$/u, (_, type) => `No information in “${translateKnownWord(type)}”.`],
    [/^Seront supprimés : (\d+) éléments? de santé, (\d+) dépenses?, (\d+) mesures? de poids et (\d+) souvenirs?\.$/u,
      (_, health, expenses, weights, memories) => `This will delete ${health} health item${health === '1' ? '' : 's'}, ${expenses} expense${expenses === '1' ? '' : 's'}, ${weights} weight measurement${weights === '1' ? '' : 's'} and ${memories} memor${memories === '1' ? 'y' : 'ies'}.`],
    [/^Ce poids semble incohérent pour un (.+)\. Indique une valeur entre (.+) et (.+) (kg|lb)\.$/u,
      (_, pet, min, max, unit) => `This weight seems inconsistent for a ${translateKnownWord(pet).toLowerCase()}. Enter a value between ${min} and ${max} ${unit}.`],
    [/^(.+) ne peut pas être dans le futur\.$/u, (_, label) => `${translateKnownWord(label)} cannot be in the future.`],
    [/^(.+) doit être écrite au format JJ\/MM\/AAAA\.$/u, (_, label) => `${translateKnownWord(label)} must use the DD/MM/YYYY format.`],
    [/^(.+) n’est pas valide\.$/u, (_, label) => `${translateKnownWord(label)} is not valid.`],
    [/^Indique (.+)\.$/u, (_, label) => `Enter ${translateKnownWord(label)}.`]
  ];

  function getLanguage() { return language; }

  function setLanguage(next, persist = true) {
    language = supported.has(next) ? next : 'fr';
    if (persist) localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.dispatchEvent(new CustomEvent('animoa:language-changed', { detail: { language } }));
  }

  function locale() { return language === 'en' ? 'en-GB' : 'fr-FR'; }

  function translateText(value) {
    if (language !== 'en') return value;
    const original = String(value ?? '');
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    const text = original.trim();
    if (!text) return original;
    if (exact[text]) return `${leading}${exact[text]}${trailing}`;
    for (const [pattern, replacement] of phraseReplacements) {
      if (pattern.test(text)) return `${leading}${text.replace(pattern, replacement)}${trailing}`;
    }
    let translated = text;
    Object.entries(exact)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([from, to]) => {
        if (translated.includes(from)) translated = translated.split(from).join(to);
      });
    return `${leading}${translated}${trailing}`;
  }

  function translateTree(root = document) {
    document.documentElement.lang = language;
    if (language !== 'en' || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => { node.nodeValue = translateText(node.nodeValue); });
    root.querySelectorAll?.('[placeholder], [title], [aria-label]').forEach((element) => {
      ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, translateText(element.getAttribute(attribute)));
      });
    });
  }

  setLanguage(language, false);
  window.AnimoaI18n = { getLanguage, setLanguage, locale, translateText, translateTree };
})();
