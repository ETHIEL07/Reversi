import { BackButton } from '../components/BackButton'
import { BoardLegend } from '../components/BoardLegend'
import { LEVELS } from '../constants/levels'
import { useT } from '../i18n/useT'

type HowToPlayScreenProps = {
  onBack: () => void
}

/** The manual: the official rules first, then the meaning of every mark on the board. */
export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const t = useT()

  return (
    <section className="screen" data-testid="how-to-play-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} label={t.app.back} testId="how-to-play-btn-retour" />
      </div>

      <div className="screen__body manual">
        <h2 className="screen__title" data-testid="how-to-play-text-title">
          {t.howToPlay.title}
        </h2>

        <article className="card" data-testid="how-to-play-view-goal">
          <h3 className="card__title">{t.howToPlay.goalTitle}</h3>
          <p className="card__text">{t.howToPlay.goal}</p>
        </article>

        <article className="card" data-testid="how-to-play-view-rules">
          <h3 className="card__title">{t.howToPlay.rulesTitle}</h3>
          <ol className="card__list">
            {t.howToPlay.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </article>

        <article className="card" data-testid="how-to-play-view-marks">
          <h3 className="card__title">{t.howToPlay.marksTitle}</h3>
          <p className="card__text">{t.howToPlay.marksLead}</p>
          <BoardLegend scope="how-to-play" />
        </article>

        <article className="card" data-testid="how-to-play-view-strategy">
          <h3 className="card__title">{t.howToPlay.strategyTitle}</h3>
          <ul className="card__list">
            {t.howToPlay.strategy.map(([lead, rest]) => (
              <li key={lead}>
                <strong>{lead}</strong> {rest}
              </li>
            ))}
          </ul>
        </article>

        <article className="card" data-testid="how-to-play-view-levels">
          <h3 className="card__title">{t.howToPlay.levelsTitle}</h3>
          <ul className="card__list">
            {LEVELS.map((entry) => (
              <li key={entry.level}>
                <strong>{t.levels[entry.level].label}</strong> · <em>{t.levels[entry.level].tagline}</em> —{' '}
                {t.levels[entry.level].description}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
