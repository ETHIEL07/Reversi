import { BackButton } from '../components/BackButton'
import { BoardLegend } from '../components/BoardLegend'
import { LEVELS } from '../constants/levels'

type HowToPlayScreenProps = {
  onBack: () => void
}

/** The manual: the official rules first, then the meaning of every mark on the board. */
export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <section className="screen" data-testid="how-to-play-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} testId="how-to-play-btn-retour" />
      </div>

      <div className="screen__body manual">
        <h2 className="screen__title" data-testid="how-to-play-text-title">
          Comment jouer
        </h2>

        <article className="card" data-testid="how-to-play-view-goal">
          <h3 className="card__title">Le but</h3>
          <p className="card__text">
            Terminer la partie avec plus de pions de sa couleur que l&apos;adversaire. Le plateau compte
            soixante-quatre cases, chaque joueur dispose de trente-deux pions, et un même pion peut changer de
            camp un grand nombre de fois avant la fin.
          </p>
        </article>

        <article className="card" data-testid="how-to-play-view-rules">
          <h3 className="card__title">Les règles</h3>
          <ol className="card__list">
            <li>
              La partie démarre avec quatre pions au centre, disposés en diagonale. <strong>Les noirs
              commencent.</strong>
            </li>
            <li>
              Un coup n&apos;est autorisé que s&apos;il <strong>encadre</strong> au moins un pion adverse :
              une ligne droite — horizontale, verticale ou diagonale — bornée aux deux extrémités par ses
              propres pions.
            </li>
            <li>
              Tous les pions encadrés par le coup <strong>doivent</strong> être retournés, même quand cela
              n&apos;arrange pas. On ne saute jamais par-dessus ses propres pions.
            </li>
            <li>Un pion posé ne se déplace plus jamais. Il ne peut que changer de couleur.</li>
            <li>
              Quand aucun coup n&apos;est possible, le tour est <strong>passé</strong>, et l&apos;adversaire
              rejoue. Passer est interdit tant qu&apos;un coup existe.
            </li>
            <li>
              La partie s&apos;arrête dès qu&apos;<strong>aucun des deux camps</strong> ne peut jouer. Le
              plateau n&apos;est pas forcément plein. Les pions visibles sont comptés, l&apos;égalité est
              possible.
            </li>
          </ol>
        </article>

        <article className="card" data-testid="how-to-play-view-marks">
          <h3 className="card__title">Les marques du plateau</h3>
          <p className="card__text">
            Ces repères sont propres à cette application. Ils affichent ce qu&apos;un joueur expérimenté voit
            de lui-même.
          </p>
          <BoardLegend scope="how-to-play" />
        </article>

        <article className="card" data-testid="how-to-play-view-strategy">
          <h3 className="card__title">Trois conseils</h3>
          <ul className="card__list">
            <li>
              <strong>Viser les coins.</strong> Ils ne se retournent jamais et solidifient tout un bord.
            </li>
            <li>
              <strong>Se méfier des cases voisines d&apos;un coin.</strong> S&apos;y poser offre souvent le
              coin à l&apos;adversaire.
            </li>
            <li>
              <strong>Ne pas courir après les pions au début.</strong> Avoir peu de pions en milieu de partie
              laisse plus de coups possibles, et c&apos;est le décompte final qui décide.
            </li>
          </ul>
        </article>

        <article className="card" data-testid="how-to-play-view-levels">
          <h3 className="card__title">Les trois niveaux</h3>
          <ul className="card__list">
            {LEVELS.map((entry) => (
              <li key={entry.level}>
                <span className="manual__face" aria-hidden="true">
                  {entry.face}
                </span>
                <strong>{entry.label}</strong> — {entry.description}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
