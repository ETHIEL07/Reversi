# Étude de concurrence — Reversi / Othello

Août 2026. Livrable du lot 0.

## Applications observées

| Application | Ce qu'elle apporte |
|---|---|
| **Reversi AI Factory** (10 M+ téléchargements) | Standard de fait. Marquage clair des coups légaux, undo illimité, 10 niveaux d'IA, thèmes, responsive solide. |
| **Livio Reversi-Othello** | Démarrage immédiat, interface épurée, pensée téléphone d'abord. |
| **みんなのオセロ** | Excellent retour visuel sur les coups légaux, très peu d'options à l'écran. |
| **Reversatile** (moteur Zebra) | Référence de force de jeu côté application grand public. |
| **Edax / WZebra / Egaroucid** | Moteurs open-source de référence : minimax avec évaluation coins, bords et mobilité. |

## Grille de lecture

| Critère | Constat |
|---|---|
| Écran d'accueil et démarrage | Les meilleures lancent une partie en un ou deux appuis. Un menu d'options avant de jouer est un frein. |
| Rendu du plateau | 90 % de l'écran. Contraste fort entre les pions et le tapis, plateau carré en toutes circonstances. |
| Feedback des coups légaux | C'est LA décision d'UX. Trois écoles : rien, surbrillance de case, point discret. |
| Animation du retournement | Ce qui sépare un rendu fini d'un rendu bricolé. |
| Score en cours de partie | Toujours visible, jamais à chercher. |
| Niveaux d'IA | De 3 à 10 selon les applications. Au-delà de 3, l'écart devient illisible pour un joueur occasionnel. |
| Undo / historique | Présent partout, utile surtout à l'apprentissage. |
| Portrait téléphone | Le point qui casse le plus souvent : plateau étiré ou rogné. |
| Ce qui agace | Les menus d'options avant de jouer, et les plateaux qui perdent leur carré en rotation. |

## Décisions de design retenues

1. **Les coups légaux s'affichent par un point discret, pas par une surbrillance de case.**
   La surbrillance sature le plateau et écrase le contraste des pions.
2. **Le retournement est animé et le score reste visible au-dessus du plateau en permanence.**
   Le plateau reste carré en toutes circonstances (`aspect-ratio: 1` combiné à `min()`).
3. **Exactement trois niveaux d'IA** — Débutant, Normal, Fort. Trois niveaux lisibles valent
   mieux que dix niveaux indistincts.

## Règles de référence

Règles officielles de la World Othello Federation : position de départ fixe en diagonale, Noir
commence, encadrement obligatoire pour qu'un coup soit légal, tous les disques encadrés sont
retournés, passe obligatoire si aucun coup légal, fin de partie quand aucun des deux joueurs ne
peut jouer, comptage des disques visibles pour désigner le vainqueur, égalité possible.
