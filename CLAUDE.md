# Reversi — contexte projet

Projet d'entraînement suivant le Guide méthodologique JM. Le jeu n'est pas le but, la méthode
est le but.

## Phase

**LOCAL.** Git 100 % manuel : commit / push / pull déclenchés par JM uniquement. Claude ne
commit jamais et n'en parle pas. Pas de branches, pas de worktrees.

## Emplacement

`C:\Users\amich\Dev\Test\Reversi`

## Ports réservés — rang 5210-5219

| Port | Usage |
|------|-------|
| 5210 | API (http) |
| 5211 | API (https) |
| 5213 | Front (Vite) |
| 5215 | Seed (lot 8) |

## Stack

- **Back** : .NET 10 / C#. `Reversi.Api` (Minimal API + Swashbuckle), `Reversi.Core` (moteur
  PUR, aucune dépendance EF/ASP.NET), `Reversi.Data` (EF Core, lot 3), `Reversi.Tests` (NUnit).
- **Front** : React 19 + TypeScript + Vite 8 + `vite-plugin-pwa`. Arbitré par JM au lot 0.
- **DB** : PostgreSQL 18 local, user `jmp` / mot de passe `jmp`, `EnsureCreated()`, **pas de
  migrations EF**. Bases : `Reversi_dev` (développement) et `Reversi_test` (droppée et recréée
  à chaque exécution de la suite, avec un garde-fou qui refuse de tourner sur `Reversi_dev`).
- **Pas de framework CSS.** CSS maison dans `Front/src`.

## Architecture — la règle qui prime

Le moteur de jeu vit **entièrement** dans `Reversi.Core` : coups légaux, retournements, passe,
fin de partie, score, IA. Il ne connaît ni HTTP ni EF. Le front n'implémente **aucune** règle :
il affiche un état et poste des coups. Le serveur est l'autorité.

## Scripts

Les `_Run*.cmd` font **build + run**. Ne jamais demander un `dotnet build` séparé.

| Script | Rôle |
|--------|------|
| `_RunBackendReversi.cmd` | kill + clean bin/obj + build + run API sur 5210, ouvre Swagger |
| `_RunFrontReversi.cmd` | kill + `tsc -b` + `npm run dev` sur 5213, ouvre le navigateur |
| `_RunAllTests.cmd` | suite NUnit complète |
| `_KillProcesses.cmd` | arrête tout sur 5210/5211/5213/5215 |
| `_DropDbDevReversi.cmd` | drop de `Reversi_dev` |

## API

Une partie est persistée par sa **liste de coups** (`MovesCsv`, notation Othello, `--` pour un
tour passé) ; le plateau est reconstruit par rejeu. C'est ce qui donne l'undo et le fil des
coups sans structure supplémentaire.

| Méthode | Route |
|---------|-------|
| POST | `/api/games` |
| GET | `/api/games` (paginée) |
| GET | `/api/games/{id}` |
| GET | `/api/games/{id}/moves` |
| POST | `/api/games/{id}/moves` |
| POST | `/api/games/{id}/pass` |
| POST | `/api/games/{id}/undo` |
| POST | `/api/games/{id}/demo` (Joker : charge une position toute faite) |
| GET | `/api/games/{id}/history` |
| GET | `/api/version` |

Les énumérations circulent en **chaînes** dans le JSON. Toute erreur renvoie un corps
`{ "message": "..." }`, jamais une réponse vide.

## Front — écrans

`App.tsx` porte une machine à états simple (`Screen`), sans routeur : `home` → `new-game` →
`game`, plus `how-to-play`, `statistics`, `options` (contenus au lot 8). Chaque écran autre que
l'accueil porte un bouton de retour, avec une **vraie flèche** (hampe + pointe), jamais un
chevron.

Les trois formats sont pilotés par les classes `layout--phone` / `layout--tablet` /
`layout--fhd` et `layout--portrait` / `layout--landscape`, jamais par `@media` seul : dans le
cadre de prévisualisation les media queries voient la fenêtre, pas le cadre. Le plafond du
plateau vient de la variable `--board-max` posée par ces classes — **aucun `vh` ni `vw` dans le
dimensionnement du plateau**, sinon le cadre est faux.

Le disque est en deux couches : `.disc-slot` reste droit et porte la couronne des coins et les
anneaux d'état, `.disc` porte la rotation `rotateY(180deg)` qui produit l'animation de
retournement. Ne pas fusionner les deux, sinon la couronne se retrouve en miroir.

## Conventions

- Code, commentaires, scripts : **anglais**. UI affichée : **français avec accents**, ton neutre,
  jamais « je ».
- `data-testid` partout, convention `{scope}-{type}-{slug}`. Cases du plateau :
  `board-cell-{row}-{col}`. Posés à l'écriture, jamais après coup.
- Niveaux d'IA : `Beginner` / `Normal` / `Strong` dans le code, « Débutant » / « Normal » /
  « Fort » dans l'UI.
- Pas d'emoji dans le code. Aucun `catch {}` vide.
- Tests : une seule passe en fin de chantier, pas à chaque prompt.

## Décisions de design arrêtées (ne pas rediscuter)

1. Coups légaux = **points discrets**, pas de surbrillance de case.
2. Animation de retournement fluide. Score **toujours visible au-dessus du plateau**.
3. Plateau **toujours carré** : `aspect-ratio: 1` + `min()`. C'est le piège n°1 du responsive.
4. Exactement **3 niveaux d'IA**.
5. Trois formats traités dès le départ : Téléphone ~390×844, Tablette ~820×1180, FHD 1920×1080,
   avec bascule de prévisualisation dans l'en-tête — pilotée par **prop/classe**, pas par
   `@media` (le cadre de prévisualisation n'est pas vu par les media queries).

## Demandes de JM à intégrer (août 2026)

| Demande | Lot |
|---------|-----|
| Bouton de retour sur l'écran de choix de partie, et écrans Solo / 2 joueurs / Autres jeux / Comment jouer / Options / Statistiques | 4 (navigation) puis 8 (contenus) |
| Sélecteur de difficulté modernisé, une émotion par niveau | 5 (fait) |
| Deux visages, un par camp, dont l'expression suit l'évolution de la partie | 5 (fait : `AvatarRow`) |
| Sauvegarde de la partie + échelle 1→64 cliquable pour remonter le fil des coups, masquée par défaut et révélée par un bouton « Fil de partie » | 3 (endpoint historique, fait) puis 8 (UI) |
| Couronne sur les pions des quatre coins ; pions « assurés » quand ils ne peuvent plus être retournés, « craintifs » quand ils sont menacés | 2 (fait : `BoardAnalyzer`) puis 4 (fait : rendu) |
| Écran « Comment jouer » façon manuel du Solitaire de Windows : règles, et surtout la légende des marques du plateau — anneau vert et couronne = coin acquis, intouchable ; anneau jaune = pion menacé, renversable | fait |
| Logo et identité visuelle | fait |
| Joker : charge une position de démonstration (milieu de partie, fin serrée) | fait |
| Personnages animés : ils narguent l'adversaire quand ils mènent largement, se cachent le visage quand c'est perdu | fait |

## Hors périmètre

Pas de VPS, Docker, déploiement, multijoueur temps réel, SignalR, authentification, classement
en ligne, notifications, framework CSS, migrations EF, branches git.

## Règles officielles retenues (World Othello Federation)

Position de départ **fixe en diagonale**, Noir commence, passe obligatoire si aucun coup légal,
fin de partie quand **aucun des deux** joueurs ne peut jouer (le plateau peut rester incomplet),
tous les disques encadrés doivent être retournés.

## Pièges connus

- `Swashbuckle.AspNetCore` 10.x tire `Microsoft.OpenApi` 2.4.1, vulnérable (GHSA-v5pm-xwqc-g5wc).
  Version épinglée à 2.7.5 dans `Reversi.Api.csproj`.
- En Swashbuckle 10, `OpenApiInfo` est dans `Microsoft.OpenApi`, plus dans `Microsoft.OpenApi.Models`.
- `psql` n'est pas dans le PATH : `C:\Program Files\PostgreSQL\18\bin\psql.exe`.
