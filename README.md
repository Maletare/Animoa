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

## Mise à jour 3.10.0

Cette version ajoute :

- un e-mail de rappel de vaccin exactement à J-7, à partir de 9 h dans le fuseau de l’utilisateur ;
- la prise en compte des préférences Rendez-vous, Vaccins et Traitements pour les e-mails ;
- un historique anti-doublon des envois et des échecs Brevo ;
- le planning horaire versionné des notifications Web Push ;
- la demande d’avis public avec la cadence 7 jours, puis 7 jours, puis 30 jours ;
- un suivi réservé à l’administrateur.

### Ordre d’installation recommandé

1. Déployer à nouveau l’Edge Function `animoa-reminders-24h` avec le fichier présent dans `supabase/functions/`.
2. Vérifier que le Cron `animoa-reminders-24h-hourly` existe toujours. Le script `supabase/sql/03_rappels_24h.sql` reste la référence si le planning doit être recréé.
3. Exécuter `supabase/sql/04_notifications_push.sql` pour créer ou remettre en place le Cron horaire `animoa-push-dispatch-hourly`. Redéployer aussi `animoa-push-dispatch` si la fonction n’est pas déjà en ligne.
4. Exécuter `supabase/sql/06_demandes_avis.sql` une seule fois dans le SQL Editor Supabase.
5. Déployer les fichiers web sur Vercel.
6. Dans `Administration > Demandes d’avis`, renseigner le lien public HTTPS, puis activer la fonction.

Le script 06 initialise les comptes déjà présents avec une première échéance sept jours après son exécution. Les administrateurs sont exclus. Les nouveaux comptes démarrent leur délai lors de leur première ouverture d’Animoa.

La demande d’avis reste désactivée tant qu’aucun lien HTTPS n’est enregistré dans l’administration.

### Vérifications après installation

Dans Supabase, les deux requêtes suivantes doivent retourner un planning actif :

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname in ('animoa-reminders-24h-hourly', 'animoa-push-dispatch-hourly');
```

Les derniers envois ou échecs d’e-mails sont visibles avec :

```sql
select event_title, reminder_kind, status, attempts, sent_at, last_error, updated_at
from public.animoa_reminder_deliveries
order by updated_at desc
limit 50;
```

Pour tester la demande d’avis avec un compte de test sans attendre sept jours, remplacez l’adresse ci-dessous puis reconnectez-vous avec ce compte :

```sql
update public.animoa_review_requests as requests
set next_prompt_at = now(), status = 'scheduled', updated_at = now()
from auth.users as users
where users.id = requests.user_id
  and lower(users.email) = lower('ADRESSE_DU_COMPTE_TEST');
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
