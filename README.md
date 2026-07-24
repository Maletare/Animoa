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
