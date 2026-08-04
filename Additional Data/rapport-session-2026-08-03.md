# Rapport de session — Reversi

**À** : JM — jmpironneau@hotmail.com
**De** : Ethiel
**Date** : lundi 3 août 2026
**Objet** : Projet d'entraînement Reversi — compte rendu de la première journée

---

## Résumé

Session de 12h20 à 16h20, environ quatre heures. Les lots 0 à 8 du chapitre 11 ont été
traités dans l'ordre, chacun validé avant le suivant. L'application est fonctionnelle de bout
en bout : moteur, API REST, trois niveaux d'IA, interface complète et PWA.

Dépôt : https://github.com/ETHIEL07/Reversi (public, branche `main`).

## Ce qui est livré

| Mesure | Valeur |
|---|---|
| Fichiers de code suivis | 129 |
| Lignes de code (`.cs`, `.ts`, `.tsx`, `.css`) | 7 888 |
| Fichiers C# / TypeScript / CSS | 48 / 38 / 10 |
| Tests NUnit | 83, tous au vert, en une seule passe |
| Build backend et front | 0 erreur, 0 avertissement |
| Endpoints REST | 11, documentés dans Swagger avec leur type de retour |

**Backend** — .NET 10, quatre projets : `Reversi.Core` (moteur pur, zéro dépendance HTTP ou
EF), `Reversi.Data` (EF Core, PostgreSQL, `EnsureCreated()`), `Reversi.Api` (Minimal API +
Swashbuckle), `Reversi.Tests` (NUnit, moteur et intégration `WebApplicationFactory`). Base de
test dédiée `Reversi_test`, droppée et recréée à chaque exécution, avec un garde-fou qui refuse
de tourner sur la base de développement. Projet `Seed` séparé qui peuple via l'API publique.

**Front** — React 19, TypeScript, Vite, `vite-plugin-pwa`. Sept écrans, trois formats
(Téléphone, Tablette, FHD) avec bascule de prévisualisation dans l'en-tête, `data-testid`
partout, aucun framework CSS.

**Choix d'architecture notable** — une partie est persistée par sa liste de coups en notation
Othello, pas par une image du plateau. Le plateau est reconstruit par rejeu. L'annulation, le
fil de partie et les positions de démonstration en découlent sans structure supplémentaire.

## Conformité au guide

**Respecté** : découpage en lots avec validation une par une · moteur entièrement dans `Core`,
aucune règle du jeu dans le front · ports 5210-5219 · NUnit présent dès le squelette · pas de
framework CSS · code et commentaires en anglais, interface en français accentué · BuildInfo
dynamique en haut à droite · `Seed` séparé, aucune donnée de démo dans le backend · pas de VPS,
Docker, SignalR, authentification ni migrations EF · phase LOCAL tenue, aucun commit déclenché
sans demande explicite.

**Checklist de l'étape 10 — cases non cochées** :

- l'installation sur un Android et un iPhone n'a pas été testée. Tout le nécessaire est en
  place, rien n'est prouvé ;
- aucun test UI automatisé, la validation visuelle reste manuelle.

## Appréciation

### Ce qui a bien fonctionné

**L'étude de concurrence avant la première ligne de code.** Cinq applications examinées, et
surtout trois décisions de design formulées comme des décisions et non comme des observations :
points discrets plutôt que surbrillance de case, score toujours visible au-dessus du plateau,
exactement trois niveaux d'IA. Ces trois arbitrages ont tenu jusqu'au bout et n'ont jamais été
rediscutés.

**L'arbitrage de la stack demandé, pas subi.** La préférence initiale allait vers Expo. Une
fois montré que le besoin mobile était déjà couvert par une PWA React et qu'Expo sortait des
deux options imposées, la décision s'est portée sur React + Vite sans s'accrocher à l'idée de
départ. C'est le point le plus difficile du chapitre 2 du guide, et il a été passé au lot 0.

**Le réflexe de vérification.** Avant la sauvegarde GitHub, la question posée a été : « as-tu
déjà fait la sauvegarde quand je te l'ai demandé ? ». Elle ne l'avait pas été. Poser la
question plutôt que supposer a évité de construire sur une croyance fausse.

**La qualité du retour sur le rendu.** Les remarques sur le retournement des pions ont été
justes trois fois de suite. La troisième formulation — « on ne sent pas qu'ils ont une face
noire et une face blanche » — a été la plus utile : elle a fait comprendre que le problème
n'était pas la durée seule mais l'absence de perspective et d'épaisseur. Un retour qui décrit
la sensation plutôt que le réglage fait gagner du temps.

**L'exigence sur la finition.** Personnages jugés invisibles, cartes de difficulté rejetées,
mise en page jugée trop basique : chacun de ces retours a produit un changement réel.

### Ce qui a coûté du temps

**Les demandes groupées et tardives.** Plusieurs messages ont mélangé cinq à sept sujets sans
hiérarchie. Trois éléments — le manuel « Comment jouer », le logo, le joker — relevaient du lot
0 ou du lot 8 mais sont arrivés pendant le lot 5, rouvrant des lots déjà validés. Les formuler
dans le livrable d'étude de concurrence aurait évité les allers-retours.

**Le mot de passe PostgreSQL.** Une trentaine de minutes perdues, dont une panne du service. La
responsabilité est partagée : le script de réinitialisation contenait un défaut d'encodage,
mais l'origine reste un mot de passe d'installation non consigné.

**Le document des règles annoncé mais non fourni.** La source officielle a été récupérée
directement, sans conséquence, mais l'annonce non tenue crée une attente inutile.

**Le cadrage temporel arrivé en fin de course.** La contrainte de quinze minutes a été posée à
15h47, sur un périmètre qui en demandait davantage. Elle a été tenue, mais les compromis ont
été choisis par l'assistant plutôt que par le donneur d'ordre.

### Réserves à lever

1. **Installation PWA non vérifiée** sur un vrai téléphone, Android et iPhone.
2. **Mot de passe `jmp` en clair** dans `appsettings.json`, désormais sur un dépôt public. Le
   risque réel est nul — base locale, mot de passe trivial — mais l'habitude est mauvaise.
3. **Aucun test UI.** Le guide n'en exige pas sur Reversi, mais les `data-testid` étant déjà
   posés partout, le coût d'une première passe Playwright serait faible.
4. **`CHANGELOG.md` absent.** Le guide le réserve aux projets matures ; le projet commence à en
   avoir le volume.

### Note d'ensemble

La méthode a été suivie sans dérive : découpage en lots, validation une par une, refus des
tentations hors périmètre. L'exigence sur le rendu est le point fort de la journée ; la
discipline de cadrage en amont est le point à travailler. Sur un projet dont l'énoncé dit
explicitement que la méthode est le but, le résultat est solide, à deux vérifications près qui
demandent un téléphone et dix minutes.

---

*Rapport rédigé par Claude à la demande d'Ethiel, à partir de la session du 3 août 2026.*
