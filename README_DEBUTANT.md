# Animoa V1.5.2 — prototype local et partageable

**Animoa** est le carnet de vie numérique de l'animal.

> Toute sa vie, près de vous.

## Lancement local

Il n'y a rien à installer.

1. Le dossier doit être placé dans `C:\Dev\Animoa`.
2. Double-clique sur `OUVRIR_ANIMOA.bat`.
3. Si Windows bloque le fichier `.bat`, ouvre directement `index.html`.

Le même dossier peut aussi être publié avec GitHub Pages.

## Mise à jour

1. Ferme l'onglet Animoa.
2. Décompresse le nouveau ZIP dans `C:\Dev`.
3. Accepte de remplacer les fichiers du dossier `C:\Dev\Animoa`.
4. Rouvre `OUVRIR_ANIMOA.bat`.

Les données enregistrées dans le navigateur sont normalement conservées lors du remplacement des fichiers.

## Fonctions présentes

- gestion de plusieurs animaux ;
- profil et photo de chaque animal ;
- carnet de santé avec catégories et rappels ;
- dépenses ;
- historique et courbe de poids ;
- souvenirs avec photos ;
- ajout, modification et suppression des principales informations ;
- navigation mobile et affichage ordinateur ;
- fenêtres centrées verticalement.

## Changements de la V1.5.2

- retrait de l'importation et de l'exportation visibles dans le menu ;
- date de naissance saisissable directement au format `JJ/MM/AAAA`, sans calendrier ;
- correction du clignotement de la barre Santé : la catégorie change désormais sans reconstruire toute la page ;
- texte adapté à une utilisation locale ou depuis GitHub Pages.

## Principe du projet

- une fonction = un emplacement principal ;
- pas de doublon inutile ;
- mobile d'abord ;
- affichage propre sur ordinateur ;
- aucune API payante ;
- aucune fonction sans besoin réel.
