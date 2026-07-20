# Nettoyage Animoa 2.4.4

## Corrections intégrées

- Numéro de version harmonisé dans toute l’application.
- Correction SQL durable de l’autorisation utilisée par les rappels automatiques.
- Messages d’erreur de la fonction de rappel rendus lisibles dans les journaux Supabase.
- Planning SQL des rappels aligné sur l’exécution à la minute 05.
- Cache hors ligne fiabilisé et mis à jour.
- Écriture du cache attendue correctement par le service worker.
- Configuration publique incluse dans les fichiers essentiels du cache.
- Boutons HTML sécurisés avec un type explicite.
- Dimensions des logos ajoutées pour limiter les décalages visuels au chargement.
- Métadonnées de partage et manifeste de l’application complétés.
- Ancienne formulation « Sur mesure » retirée du fichier de traduction.
- Vouvoiement corrigé dans le modèle de contact.
- Fins de ligne normalisées pour réduire les changements parasites dans GitHub.

## Rangement

- Les scripts SQL sont regroupés dans `supabase/sql/`.
- Les modèles d’e-mails sont regroupés dans `supabase/email-templates/`.
- Les anciens comptes rendus de versions ont été retirés.
- Les icônes anciennes et non utilisées ont été retirées.
- Le dossier `.git` n’est pas inclus dans l’archive afin de ne pas écraser le dépôt local.

## Éléments conservés volontairement

- Les fichiers sources des Edge Functions Supabase.
- Les modèles d’e-mails utiles à l’administration.
- Le fichier d’exemple de configuration publique.
- Les images officielles nécessaires au site, aux e-mails et à l’installation de l’application.
