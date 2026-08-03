/**
 * Legend of every mark drawn on the board. Shown in the manual and reachable from the game,
 * because a mark nobody can decode is decoration.
 */
export function BoardLegend({ scope }: { scope: string }) {
  return (
    <ul className="legend" data-testid={`${scope}-view-legend`}>
      <li className="legend__item" data-testid={`${scope}-view-legend-hint`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__hint" />
          </span>
        </span>
        <span className="legend__text">
          <strong>Point clair</strong>
          <span>Une case où le coup est autorisé. Poser un pion ici retourne au moins un pion adverse.</span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-crown`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--black legend__disc--crowned" />
          </span>
        </span>
        <span className="legend__text">
          <strong>Couronne</strong>
          <span>
            Le pion occupe un coin. Un coin ne peut jamais être retourné : la case est acquise pour toute la
            partie.
          </span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-stable`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--white legend__ring legend__ring--stable" />
          </span>
        </span>
        <span className="legend__text">
          <strong>Anneau vert</strong>
          <span>
            Pion assuré. Plus aucun coup, d&apos;un camp comme de l&apos;autre, ne pourra le retourner. La
            stabilité part des coins et se propage le long des bords.
          </span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-at-risk`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--black legend__ring legend__ring--at-risk" />
          </span>
        </span>
        <span className="legend__text">
          <strong>Anneau jaune pointillé</strong>
          <span>
            Pion menacé. Le camp au trait peut le retourner dès son prochain coup. L&apos;anneau disparaît dès
            que la menace n&apos;existe plus.
          </span>
        </span>
      </li>
    </ul>
  )
}
