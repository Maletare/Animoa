# Animoa V2.0

**Animoa** est le carnet de vie numérique de l’animal.

> Toute sa vie, près de vous.

## Ce qui a été ajouté

- logo officiel Animoa dans toute l’application, le favicon et les e-mails ;
- choix Français / English lors de la première ouverture ;
- langue modifiable ensuite dans les paramètres ;
- thèmes Clair / Sombre / Système ;
- création de compte, connexion, confirmation d’e-mail, mot de passe oublié et déconnexion ;
- données séparées pour chaque utilisateur avec les règles de sécurité Supabase ;
- synchronisation des animaux, de la santé, des dépenses, des poids, des souvenirs et des réglages ;
- stockage privé des photos et pièces jointes ;
- migration automatique des anciennes données locales vers le premier compte utilisé ;
- nouveau bouton moderne « Ajouter un fichier ou une image » ;
- fenêtres et confirmations toujours centrées ;
- amélioration mobile, mode installable et cache des fichiers de l’application.

## 1. Ouvrir Animoa sur l’ordinateur

1. Place le dossier dans `C:\Dev\Animoa`.
2. Double-clique sur `OUVRIR_ANIMOA.bat`.
3. Le navigateur ouvre `http://127.0.0.1:3001`.

Ne double-clique plus directement sur `index.html` : la connexion et la réinitialisation du mot de passe ont besoin d’une adresse `http://` ou `https://`.

## 2. Activer Supabase

### A — Créer les tables et le stockage

Dans Supabase :

1. ouvre **SQL Editor** ;
2. ouvre le fichier `SUPABASE_INSTALLATION.sql` ;
3. copie tout son contenu ;
4. colle-le dans SQL Editor puis clique sur **Run**.

### B — Ajouter les deux informations publiques

Ouvre `supabase-config.js` puis remplace :

- `REMPLACER_PAR_URL_SUPABASE` par l’URL du projet ;
- `REMPLACER_PAR_CLE_ANON_PUBLIQUE` par la clé **anon** ou **publishable**.

Ces deux valeurs servent au navigateur. **Ne mets jamais la clé `service_role`, un mot de passe SMTP ou une autre information privée dans ce fichier.**

Le fichier `.env.local` reste privé : ne l’ajoute jamais au ZIP ni à GitHub.

## 3. Mettre le logo dans les e-mails Supabase

Le dossier `email-templates` contient les modèles prêts :

- confirmation d’inscription ;
- réinitialisation du mot de passe ;
- lien magique.

Dans Supabase, ouvre **Authentication > Email Templates**, puis copie le modèle correspondant. Le logo est chargé depuis :

`https://animoa.fr/assets/animoa-logo-email.png`

## 4. Réglages conseillés dans Supabase

Dans **Authentication > URL Configuration** :

- Site URL : `https://animoa.fr`
- Redirect URLs : ajoute `https://animoa.fr/**` et, pour les tests locaux, `http://127.0.0.1:3001/**`.

## 5. Test rapide

1. Choisis Français ou English.
2. Crée un compte.
3. Clique sur le lien reçu par e-mail.
4. Ajoute un animal et une photo.
5. Déconnecte-toi puis reconnecte-toi.
6. Vérifie que les données réapparaissent.
7. Teste Clair, Sombre et Système dans Paramètres.

## Sécurité

- chaque utilisateur ne peut lire et modifier que ses propres données ;
- les fichiers sont placés dans un dossier privé portant l’identifiant du compte ;
- le ZIP ne contient aucun `.env`, `.env.local`, mot de passe SMTP ou clé privée.
