# Animoa

Animoa est une application web mobile-first destinée au suivi quotidien des animaux : profils, santé, rendez-vous, soins, documents, dépenses et rappels.

## Lancer le projet en local

Sous Windows, double-cliquez sur `Ouvrir_Animoa.bat`.

Autre méthode :

```bash
py -m http.server 8015
```

Puis ouvrez `http://localhost:8015`.

## Déploiement

Le projet est une application statique déployable directement sur Vercel. Le fichier `vercel.json` contient les principaux en-têtes de sécurité et les règles de cache.

## Mise à jour 3.11.0

Cette version remplace la demande d’avis externe par un système interne à Animoa :

- note obligatoire de 1 à 5 étoiles ;
- commentaire facultatif visible uniquement dans l’Administration ;
- cadence conservée : premier message à 7 jours, puis 7 jours, puis 30 jours ;
- bouton permanent dans `Paramètres > Aide et confidentialité` ;
- possibilité de modifier son avis ;
- affichage sur l’accueil de la note moyenne et du nombre d’avis, sans montrer les commentaires ni l’identité des utilisateurs ;
- suivi détaillé dans `Administration > Avis utilisateurs` et `Administration > Demandes d’avis`.

### Installation de la version 3.11.0

Après avoir installé les versions 3.10.0 et 3.10.1 :

1. Exécuter une seule fois `supabase/sql/08_avis_internes.sql` dans le SQL Editor Supabase.
2. Lancer Animoa en local et vérifier la prévisualisation depuis `Administration > Demandes d’avis`.
3. Déployer les fichiers web sur GitHub/Vercel.

Le script 08 active automatiquement les demandes internes et conserve toutes les échéances déjà calculées. Aucun redéploiement d’Edge Function n’est nécessaire.

### Test immédiat avec un compte de test

Pour rendre un compte éligible sans attendre sept jours, remplacer l’adresse ci-dessous puis exécuter :

```sql
update public.animoa_review_requests as requests
set next_prompt_at = now(), status = 'scheduled', updated_at = now()
from auth.users as users
where users.id = requests.user_id
  and lower(users.email) = lower('ADRESSE_DU_COMPTE_TEST');
```

À la prochaine connexion de ce compte, le formulaire interne doit apparaître. Après l’envoi, l’avis est visible uniquement par l’administrateur dans `Avis utilisateurs`.

## Rappels et notifications

La version conserve :

- l’e-mail de rappel vaccin à J-7 ;
- les e-mails des rendez-vous et traitements dans les 24 heures précédentes ;
- les notifications Web Push planifiées ;
- l’historique anti-doublon des envois.

Les Crons attendus sont :

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname in ('animoa-reminders-24h-hourly', 'animoa-push-dispatch-hourly');
```

## Configuration Supabase

`supabase-config.js` contient uniquement des identifiants publics utilisables côté navigateur : URL du projet, clé publique Supabase et identifiant client OAuth Google.

Les secrets privés doivent rester dans les variables d’environnement Supabase ou Vercel. Ne jamais publier de clé `service_role`, de secret OAuth, de clé Brevo ou de mot de passe SMTP.

## Structure

- `index.html`, `app.js`, `styles.css` : application principale
- `auth.js`, `cloud.js`, `i18n.js` : authentification, synchronisation et traductions
- `questionnaire.html`, `questionnaire.js` : questionnaire public
- `assets/` : logos, icônes et arrière-plans
- `supabase/functions/` : Edge Functions actives
- `supabase/sql/` : scripts SQL de référence et d’audit
- `supabase/email-templates/` : modèles d’e-mails

## Avant chaque mise en ligne

1. Vérifier qu’aucun secret privé n’a été ajouté au dépôt.
2. Tester la connexion, les animaux, la santé, les documents et l’administration.
3. Vérifier la version affichée dans `app.js`, `index.html`, `sw.js` et les paramètres de cache.


## Mise à jour 3.11.1
- Contraste renforcé sur la page publique, y compris lorsque le téléphone ou le navigateur utilise le mode sombre.
- Boutons, textes, maquette téléphone, cartes et pied de page plus lisibles.
- Aucune nouvelle action Supabase : le script `08_avis_internes.sql` reste celui de la 3.11.0 et ne doit pas être relancé.


## Mise à jour 3.11.2

- Ajout de « Donner votre avis » et « Se déconnecter » directement dans le menu principal.
- Pour le compte administrateur, « Donner votre avis » ouvre uniquement un aperçu et n'enregistre aucune note.
- Retrait de ces deux actions de la page Paramètres.
- Réorganisation des Paramètres en cinq rubriques : Mon compte, Notifications, Apparence, Langue et région, Données et confidentialité.
- Aucune modification Supabase supplémentaire n'est nécessaire après l'installation du script 08 de la version 3.11.0.


## Mise à jour 3.11.3

- Ajout d’un bouton Retour cohérent sur les pages secondaires.
- La navigation mémorise la page précédente et utilise un écran logique de secours si nécessaire.
- Pages concernées : Mes animaux, fiche animal, Poids, Paramètres, Aide, Contact, Confidentialité, Mentions légales et Administration.
- Aucun changement Supabase n’est requis.

## Mise à jour 3.11.4

- Correctif urgent de la boucle de la demande d’avis.
- Suppression du nouveau contrôle automatique 700 ms après la fermeture d’une fenêtre.
- Protection locale par utilisateur après « Envoyer mon avis », « Plus tard » ou « Ne plus afficher » afin que l’accès à l’application reste toujours possible.
- Vérification d’un avis déjà existant avant toute nouvelle demande automatique.
- Ajout du script Supabase idempotent `09_correctif_boucle_avis.sql` pour réparer les anciennes lignes de suivi et fiabiliser les actions.

## Mise à jour 3.11.5

- Ajout des liens officiels TikTok et Facebook dans le pied de page de la page d’accueil publique.
- Ouverture sécurisée des réseaux sociaux dans un nouvel onglet.
- Ajout des profils sociaux aux données structurées de l’organisation Animoa.
- Mise en page responsive et compatible avec les modes clair et sombre.
- Aucun changement Supabase n’est requis.

## Mise à jour 3.11.6

- Ajout d’une rubrique compacte « Aide et contact » dans les paramètres de l’application.
- Accès discret aux profils officiels TikTok et Facebook depuis l’espace connecté.
- Conservation des liens sociaux dans le pied de page de l’accueil public.
- Ouverture sécurisée dans un nouvel onglet et adaptation mobile, ordinateur, mode clair et mode sombre.
- Aucun changement Supabase n’est requis.

## Mise à jour 3.11.7

- Contraste renforcé pour les textes et icônes TikTok et Facebook dans le pied de page public.
- Lisibilité sécurisée en modes clair, sombre et système.
- Renforcement identique des liens sociaux discrets dans les paramètres de l’application.
- Aucun changement Supabase n’est requis.


## Mise à jour 3.12.0

- Ajout d’une **Banque de médias** dans l’Administration, accessible uniquement au compte présent dans `public.animoa_admins`.
- Recherche de vidéos via les API officielles Pexels et Pixabay, avec filtres animal, thème et format vertical/horizontal/carré.
- Prévisualisation des vidéos et affichage obligatoire de la source et du créateur.
- Connexion Google Drive séparée, réservée à l’administratrice, avec le périmètre limité `drive.file`.
- Création automatique du dossier `ANIMOA - MÉDIATHÈQUE`, puis classement par animal et par thème.
- Suivi des médias disponibles, utilisés ou archivés afin d’éviter les répétitions.
- Les clés Pexels et Pixabay et le jeton Google Drive ne sont jamais placés dans le navigateur.

### Installation Supabase 3.12.0

1. Exécuter `supabase/sql/10_banque_medias_admin.sql` dans l’éditeur SQL Supabase.
2. Ajouter les secrets Edge Functions `PEXELS_API_KEY` et `PIXABAY_API_KEY`. Les secrets Google existants `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont réutilisés.
3. Déployer la fonction `supabase/functions/animoa-media-library` sous le nom `animoa-media-library`.
4. Dans Google Cloud, activer l’API Google Drive et ajouter le scope `https://www.googleapis.com/auth/drive.file` à l’écran de consentement OAuth.
5. Déployer les fichiers web de la version 3.12.0.


## Mise à jour 3.12.1

- La liste détaillée des vidéos enregistrées a été retirée de l’Administration.
- La Banque de médias affiche désormais uniquement un résumé compact : total, disponibles, utilisées et archivées.
- Un bouton ouvre directement le dossier `ANIMOA - MÉDIATHÈQUE` dans Google Drive.
- Les messages de mise à jour destinés aux utilisateurs restent limités aux nouveautés publiques ; les outils d’administration n’y sont jamais mentionnés.
- Les informations relatives à la médiathèque administratrice ont été retirées de la politique de confidentialité affichée aux utilisateurs, car elles ne concernent pas leurs données.

## Mise à jour 3.12.2

- Activation de Vercel Web Analytics sur la page publique et le questionnaire.
- Intégration adaptée au projet Animoa en HTML/JavaScript sans framework : aucun paquet npm n’est nécessaire.
- Ajout du chargeur local `analytics-loader.js` et du script Vercel `/_vercel/insights/script.js`.
- Mise à jour du cache du service worker afin de diffuser immédiatement la nouvelle intégration.
- Ajout d’une information claire dans la politique de confidentialité concernant les statistiques anonymes de fréquentation.
- Après déploiement sur Vercel, seules les nouvelles visites sont comptabilisées.



## Mise à jour 3.12.3

- Refonte de la page publique pour mieux présenter Animoa et améliorer sa compréhension par Google.
- Ajout de contenus visibles sur le carnet de santé numérique, les rendez-vous, vaccins, traitements, poids, documents, dépenses et souvenirs.
- Ajout de sections dédiées aux chiens, chats, lapins et oiseaux.
- Ajout d’une FAQ visible et alignée avec les données structurées.
- Optimisation du titre, de la description, des balises sociales et du sitemap.
- Questionnaire exclu de l’indexation Google.
- Vercel Web Analytics conservé.


## Mise à jour 3.12.4

- Correction du logo Animoa déformé dans l’aperçu du téléphone sur la page publique.
- Conservation automatique des proportions du logo sur mobile et ordinateur.
- Ajout d’un bouton « Voir / Masquer » dans les champs de mot de passe.
- Bouton disponible pour la connexion, la création de compte et la définition d’un nouveau mot de passe.
- Mise à jour du cache PWA afin de diffuser immédiatement les corrections.
- Aucun changement Supabase n’est requis.

## Mise à jour 3.13.1

- Ajout de **Publications Facebook** dans l’Administration Animoa.
- Générateur interne sans API d’IA payante : thèmes, accroches, textes courts, descriptions et hashtags sont produits localement à partir d’une bibliothèque éditoriale Animoa.
- Variété renforcée : rotation des angles de publication, des accroches, des styles d’affiche, des formats et des médias récents afin d’éviter les publications répétitives.
- Formats Facebook disponibles : carré 1080 × 1080 et vertical 1080 × 1350.
- Composition automatique des affiches avec les vrais logos et couleurs Animoa.
- Réutilisation de la Banque de médias existante et du Drive en complément.
- Recherche de vraies photos HD Pexels/Pixabay adaptées au sujet de la publication, en réutilisant les clés gratuites déjà configurées dans la Banque de médias.
- Cadrage intelligent par point focal : horizontal, vertical et zoom mémorisés par média ; bouton de recentrage automatique.
- Les compositions plein écran placent le bloc texte dans la zone la plus éloignée du point focal afin d’éviter de recouvrir la tête de l’animal.
- 8 familles graphiques plus dynamiques : Éclat Animoa, Photo vedette, Pop éditorial, Bulles & douceur, Affiche impact, Polaroid lumineux, Collage pétillant et Magazine Animoa.
- Aperçu complet de la publication Facebook avant validation, avec modification libre du texte et des hashtags.
- Actions : nouvelle idée, régénérer le texte, changer le style, changer le média, télécharger le PNG, enregistrer en brouillon, marquer prête, supprimer et publier.
- Historique avec les statuts **Brouillon / Prête / Publiée / Erreur**.
- Préparation de la publication directe sur la Page Facebook Animoa via une Edge Function Supabase sécurisée ; aucun jeton Meta n’est exposé dans le navigateur.
- Mode de test local conservé : tant que le SQL 11 n’est pas exécuté, les brouillons sont enregistrés uniquement dans le navigateur.
- Restauration des corrections publiques 3.12.4 écrasées par mégarde : page publique/SEO et bouton Voir/Masquer le mot de passe.
- Conservation du correctif anti-doublons de la Banque de médias.

### Installation Supabase 3.13.1

1. Tester d’abord le module en local : la génération, l’aperçu et l’historique local fonctionnent sans nouveau secret.
2. Pour activer les nouvelles photos HD, redéployer `supabase/functions/animoa-media-library` sous le nom `animoa-media-library` (aucune nouvelle clé).
3. Pour activer l’historique Supabase, exécuter `supabase/sql/11_publications_facebook_admin.sql`.
4. Déployer `supabase/functions/animoa-facebook-publications` sous le nom `animoa-facebook-publications`.
5. **Instruction remplacée par la 3.14.0 :** ne créez plus les anciens secrets préfixés `ANIMOA_FACEBOOK_`. La configuration actuelle est décrite dans la section 3.14.0 ci-dessous.
6. Aucun secret Facebook et aucun fichier `.env.local` ne doivent être placés dans le ZIP ou dans le navigateur.

## Mise à jour 3.14.0

- Conservation intégrale du générateur visuel Facebook validé en 3.13.1 : 8 styles, formats 1:1 / 4:5, photos HD, Banque de médias et cadrage intelligent.
- Connexion réelle à la Page Facebook Animoa via l’Edge Function `animoa-facebook-publications`.
- Les secrets utilisés sont désormais ceux enregistrés dans Supabase : `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN` et `FACEBOOK_DATA_ACCESS_EXPIRES_AT`.
- Alignement de la fonction Facebook sur Graph API `v26.0` par défaut, avec possibilité de surcharge par `META_GRAPH_API_VERSION` côté serveur.
- Ajout de **Publier maintenant** avec verrouillage anti-double-envoi pendant l’envoi.
- Ajout de **Programmer / Reprogrammer / Annuler** en heure de Paris (`Europe/Paris`).
- Historique enrichi avec les états **Programmée** et **Envoi en cours**.
- Les modifications d’une publication programmée retirent temporairement la ligne de la file, régénèrent l’affiche puis réactivent la programmation afin d’éviter l’envoi d’une version incomplète.
- Ajout du répartiteur serveur `animoa-facebook-dispatch` : il traite les publications arrivées à échéance même lorsque le navigateur et l’ordinateur sont fermés.
- Réservation atomique des publications dues avec `FOR UPDATE SKIP LOCKED` afin que deux exécutions du Cron ne prennent pas la même publication.
- Ajout d’un contrôle permanent de la connexion Facebook dans Administration > Publications Facebook.
- Alertes visuelles d’échéance de l’accès aux données à J-14 / J-7 / J-3 et après expiration.
- Ajout d’un rappel e-mail unique à `contact@animoa.fr` dans la fenêtre J-7, envoyé côté serveur via Brevo.
- Aucun token Facebook n’est stocké dans PostgreSQL, dans le navigateur, dans le ZIP ou dans `.env.local`.

### Installation Supabase 3.14.0

1. Le script `supabase/sql/11_publications_facebook_admin.sql` doit avoir été exécuté une première fois.
2. Déployer la fonction mise à jour `supabase/functions/animoa-facebook-publications` sous le nom `animoa-facebook-publications`.
3. Déployer la nouvelle fonction `supabase/functions/animoa-facebook-dispatch` sous le nom `animoa-facebook-dispatch`. Cette fonction est configurée avec `verify_jwt = false` dans `supabase/config.toml`, mais refuse les appels sans le secret `ANIMOA_CRON_SECRET`.
4. Exécuter `supabase/sql/12_publications_facebook_programmation.sql`. Il ajoute les colonnes de programmation, la réservation atomique, une vérification chaque minute qui n’appelle l’Edge Function que lorsqu’un envoi est dû, et un contrôle quotidien pour le rappel J-7.
5. Les secrets Edge nécessaires sont : `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_DATA_ACCESS_EXPIRES_AT` et l’existant `ANIMOA_CRON_SECRET`. Le rappel e-mail réutilise les secrets Brevo déjà présents.
6. Aucun secret ne doit être copié dans les fichiers du site ni dans le ZIP.
