# Animoa — application utilisateur 3.15.0

Ce projet contient uniquement l'application destinée aux utilisateurs de **animoa.fr**.
L'administration a été séparée dans un projet indépendant afin de garder l'application publique plus légère et plus simple à maintenir.

## Lancer en local

Sous Windows, double-cliquer sur `Ouvrir_Animoa.bat`.

Ou :

```bash
py -m http.server 8015
```

Puis ouvrir `http://localhost:8015`.

## Nouveautés 3.15.0

- retrait complet de l'interface Administration du projet utilisateur ;
- retrait du générateur Facebook et de la Banque de médias côté utilisateur ;
- nettoyage des styles et du code devenus inutiles ;
- inscription e-mail compatible avec l'accès immédiat après création du compte ;
- ajout du parcours utilisateur : `landing_view` → `signup_click` → `signup_success` → `first_pet_created` ;
- aucune donnée du carnet (nom, santé, documents, photos) n'est envoyée dans ce parcours ;
- politique de confidentialité mise à jour pour décrire cette mesure technique.

## Supabase

Le nouveau script à exécuter pour la version 3.15.0 est :

`supabase/sql/13_parcours_utilisateur.sql`

Il crée le suivi du parcours, sécurise sa lecture pour l'administrateur et synchronise la liste légère des comptes utilisée par l'Admin Animoa.

Les fichiers `05` à `09` restent dans ce projet car les avis et demandes d'avis font partie du fonctionnement utilisateur et réutilisent le contrôle de rôle administrateur côté base de données.

## Structure

- `index.html`, `app.js`, `styles.css` : application utilisateur
- `auth.js`, `cloud.js`, `i18n.js` : compte, synchronisation et langue
- `funnel.js` : parcours utilisateur 3.15.0
- `questionnaire.html`, `questionnaire.js` : questionnaire public
- `supabase/functions/` : fonctions nécessaires à l'application utilisateur
- `supabase/sql/` : schéma partagé et scripts utilisateur
- `assets/` : identité visuelle et ressources

Aucun secret privé ne doit être ajouté à `supabase-config.js` ou au dépôt.
