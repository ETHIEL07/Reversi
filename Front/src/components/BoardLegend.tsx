import { useT } from '../i18n/useT'

/**
 * Legend of every mark drawn on the board. Shown in the manual and reachable from the game,
 * because a mark nobody can decode is decoration.
 */
export function BoardLegend({ scope }: { scope: string }) {
  const t = useT()

  return (
    <ul className="legend" data-testid={`${scope}-view-legend`}>
      <li className="legend__item" data-testid={`${scope}-view-legend-hint`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__hint" />
          </span>
        </span>
        <span className="legend__text">
          <strong>{t.legend.hint}</strong>
          <span>{t.legend.hintNote}</span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-crown`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--black legend__disc--crowned" />
          </span>
        </span>
        <span className="legend__text">
          <strong>{t.legend.crown}</strong>
          <span>{t.legend.crownNote}</span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-stable`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--white legend__ring legend__ring--stable" />
          </span>
        </span>
        <span className="legend__text">
          <strong>{t.legend.stable}</strong>
          <span>{t.legend.stableNote}</span>
        </span>
      </li>

      <li className="legend__item" data-testid={`${scope}-view-legend-at-risk`}>
        <span className="legend__sample">
          <span className="legend__cell">
            <span className="legend__disc legend__disc--black legend__ring legend__ring--at-risk" />
          </span>
        </span>
        <span className="legend__text">
          <strong>{t.legend.atRisk}</strong>
          <span>{t.legend.atRiskNote}</span>
        </span>
      </li>
    </ul>
  )
}
