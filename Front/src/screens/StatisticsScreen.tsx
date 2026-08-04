import { useEffect, useState } from 'react'
import { BackButton } from '../components/BackButton'
import { listGames } from '../api/games'
import { LEVELS } from '../constants/levels'
import { useT } from '../i18n/useT'
import type { GameSummary } from '../types/game'

type StatisticsScreenProps = {
  onBack: () => void
}

type Totals = {
  played: number
  finished: number
  blackWins: number
  whiteWins: number
  draws: number
  inProgress: number
  averageMoves: number
  bestScore: number
  versusComputer: number
  byLevel: Record<string, number>
}

function summarise(games: GameSummary[]): Totals {
  const finished = games.filter((game) => game.status !== 'InProgress')
  const moves = finished.reduce((total, game) => total + game.moveCount, 0)
  const byLevel: Record<string, number> = {}

  for (const game of games) {
    if (game.level !== null) {
      byLevel[game.level] = (byLevel[game.level] ?? 0) + 1
    }
  }

  return {
    played: games.length,
    finished: finished.length,
    blackWins: games.filter((game) => game.status === 'BlackWins').length,
    whiteWins: games.filter((game) => game.status === 'WhiteWins').length,
    draws: games.filter((game) => game.status === 'Draw').length,
    inProgress: games.filter((game) => game.status === 'InProgress').length,
    averageMoves: finished.length === 0 ? 0 : Math.round(moves / finished.length),
    bestScore: games.reduce((best, game) => Math.max(best, game.score.black, game.score.white), 0),
    versusComputer: games.filter((game) => game.opponent === 'Computer').length,
    byLevel,
  }
}

export function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const t = useT()
  const [totals, setTotals] = useState<Totals | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listGames(1, 100)
      .then((page) => setTotals(summarise(page.items)))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : t.statistics.unavailable))
  }, [t])

  return (
    <section className="screen" data-testid="statistics-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} label={t.app.back} testId="statistics-btn-retour" />
      </div>

      <div className="screen__body manual">
        <p className="eyebrow">{t.statistics.eyebrow}</p>
        <h2 className="display display--lg" data-testid="statistics-text-title">
          {t.statistics.title}
        </h2>

        {error !== null ? (
          <p className="error" role="alert" data-testid="statistics-text-error">
            {error}
          </p>
        ) : null}

        {totals === null && error === null ? (
          <p className="screen__lead" data-testid="statistics-text-loading">
            {t.statistics.loading}
          </p>
        ) : null}

        {totals !== null ? (
          <>
            <div className="stat-grid" data-testid="statistics-view-tiles">
              <Tile label={t.statistics.played} value={totals.played} slug="parties" />
              <Tile label={t.statistics.finished} value={totals.finished} slug="terminees" />
              <Tile label={t.statistics.inProgress} value={totals.inProgress} slug="en-cours" />
              <Tile label={t.statistics.averageMoves} value={totals.averageMoves} slug="coups-moyens" />
              <Tile label={t.statistics.bestScore} value={totals.bestScore} slug="meilleur-score" />
              <Tile label={t.statistics.versusComputer} value={totals.versusComputer} slug="contre-ordinateur" />
            </div>

            <article className="card" data-testid="statistics-view-outcomes">
              <h3 className="card__title">{t.statistics.outcomes}</h3>

              <Bar label={t.statistics.blackWins} value={totals.blackWins} total={totals.finished} tone="black" />
              <Bar label={t.statistics.whiteWins} value={totals.whiteWins} total={totals.finished} tone="white" />
              <Bar label={t.statistics.draws} value={totals.draws} total={totals.finished} tone="draw" />

              {totals.finished === 0 ? (
                <p className="card__text" data-testid="statistics-text-empty">
                  {t.statistics.empty}
                </p>
              ) : null}
            </article>

            <article className="card" data-testid="statistics-view-levels">
              <h3 className="card__title">{t.statistics.levels}</h3>

              {LEVELS.map((entry) => (
                <Bar
                  key={entry.level}
                  label={t.levels[entry.level].label}
                  value={totals.byLevel[entry.level] ?? 0}
                  total={Math.max(1, totals.versusComputer)}
                  tone={entry.slug}
                />
              ))}
            </article>
          </>
        ) : null}
      </div>
    </section>
  )
}

function Tile({ label, value, slug }: { label: string; value: number; slug: string }) {
  return (
    <div className="stat-tile" data-testid={`statistics-view-tile-${slug}`}>
      <span className="stat-tile__value" data-testid={`statistics-text-${slug}`}>
        {value}
      </span>
      <span className="stat-tile__label">{label}</span>
    </div>
  )
}

function Bar({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const share = total === 0 ? 0 : Math.round((value / total) * 100)

  return (
    <div className="stat-bar" data-testid={`statistics-view-bar-${tone}`}>
      <div className="stat-bar__head">
        <span>{label}</span>
        <span className="stat-bar__value">
          {value} {total > 0 ? `· ${share} %` : ''}
        </span>
      </div>

      <div className="stat-bar__track">
        <span className={`stat-bar__fill stat-bar__fill--${tone}`} style={{ width: `${share}%` }} />
      </div>
    </div>
  )
}
