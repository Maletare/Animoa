# Animoa V1.5.1 — prototype local

**Animoa** est le carnet de vie numérique de l'animal.

> Toute sa vie, près de vous.

## Lancement

Il n'y a rien à installer.

1. Le dossier doit être placé dans `C:\Dev\Animoa`.
2. Double-clique sur `OUVRIR_ANIMOA.bat`.
3. Si Windows bloque le fichier `.bat`, ouvre directement `index.html`.

## Mise à jour

1. Dans l'ancienne version, ouvre **Sauvegarde** et télécharge une copie de tes données.
2. Ferme l'onglet Animoa.
3. Décompresse le nouveau ZIP dans `C:\Dev`.
4. Accepte de remplacer les fichiers du dossier `C:\Dev\Animoa`.
5. Rouvre `OUVRIR_ANIMOA.bat`.

Les données enregistrées dans le navigateur sont normalement conservées lors du remplacement des fichiers.

## Fonctions présentes

- gestion de plusieurs animaux ;
- profil et photo de chaque animal ;
- carnet de santé avec catégories et rappels ;
- dépenses ;
- historique et courbe de poids ;
- souvenirs avec photos ;
- ajout, modification et suppression des principales informations ;
- sauvegarde et restauration, photos comprises ;
- navigation mobile et affichage ordinateur ;
- fenêtres centrées verticalement.

## Nettoyage et fiabilité de la V1.5.1

- retrait des anciennes notes de mise à jour devenues inutiles ;
- confirmation d'importation intégrée à Animoa et centrée comme les autres fenêtres ;
- contrôle des noms et titres composés uniquement d'espaces ;
- refus des dépenses nulles ou négatives ;
- nettoyage des anciennes photos remplacées lorsqu'elles ne sont plus utilisées ;
- contrôle des réglages importés ;
- sécurisation de la réinitialisation ;
- correction d’un risque de fenêtre vide lorsqu’on navigue puis qu’on appuie très vite sur Ajouter ;
- retrait de quelques styles inutilisés.

## Sauvegarde

Les données restent dans le navigateur utilisé. La page **Sauvegarde** permet de télécharger un fichier JSON contenant les informations et les photos.

Fais une sauvegarde avant de vider les données du navigateur, de changer d'ordinateur ou d'installer une mise à jour importante.

## Principe du projet

- une fonction = un emplacement principal ;
- pas de doublon inutile ;
- mobile d'abord ;
- affichage propre sur ordinateur ;
- aucune API payante ;
- aucune fonction sans besoin réel.
