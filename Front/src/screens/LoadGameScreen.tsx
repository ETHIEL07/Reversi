import { useEffect, useState } from 'react'
import { BackButton } from '../components/BackButton'
import { getGame, listGames } from '../api/games'
import { playTick } from '../audio/sounds'
import { useT } from '../i18n/useT'
import { forgetGame, readSavedGames } from '../storage/savedGames'
import type { Dictionary } from '../i18n/dictionary'
import type { GameState, GameSummary } from '../types/game'

type LoadGameScreenProps = {
  onBack: () => void
  onOpened: (game: GameState) => void
}

function describe(game: GameSummary, t: Dictionary): string {
  if (game.opponent === 'Human') {
    return t.newGame.twoPlayers
  }

  return `${t.newGame.computer} · ${game.level === null ? '—' : t.levels[game.level].label}`
}

export function LoadGameScreen({ onBack, onOpened }: LoadGameScreenProps) {
  const t = useT()
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = readSavedGames()

    if (saved.length === 0) {
      setLoading(false)
      return
    }

    listGames(1, 100)
      .then((page) => {
        const known = new Map(page.items.map((game) => [game.id, game]))
        setGames(saved.map((id) => known.get(id)).filter((game): game is GameSummary => game !== undefined))
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : t.loadGame.unavailable))
      .finally(() => setLoading(false))
  }, [t])

  function drop(id: string) {
    playTick()
    forgetGame(id)
    setGames((current) => current.filter((game) => game.id !== id))
  }

  return (
    <section className="screen" data-testid="load-game-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} label={t.app.back} testId="load-game-btn-retour" />
      </div>

      <div className="screen__body manual">
        <p className="eyebrow">{t.loadGame.eyebrow}</p>
        <h2 className="display display--lg" data-testid="load-game-text-title">
          {t.loadGame.title}
        </h2>

        {error !== null ? (
          <p className="error" role="alert" data-testid="load-game-text-error">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="screen__lead" data-testid="load-game-text-loading">
            {t.loadGame.loading}
          </p>
        ) : null}

        {!loading && games.length === 0 && error === null ? (
          <p className="screen__lead" data-testid="load-game-text-empty">
            {t.loadGame.empty}
          </p>
        ) : null}

        {games.length > 0 ? (
          <ul className="resume-list resume-list--tall" data-testid="load-game-view-list">
            {games.map((game) => (
              <li key={game.id} className="resume-row">
                <button
                  type="button"
                  className="resume"
                  data-testid={`load-game-btn-ouvrir-${game.id}`}
                  onClick={() => {
                    playTick()
                    getGame(game.id)
                      .then(onOpened)
                      .catch((cause: unknown) =>
                        setError(cause instanceof Error ? cause.message : t.loadGame.notFound),
                      )
                  }}
                >
                  <span className="resume__score">
                    <span className="resume__disc resume__disc--black" />
                    {game.score.black}
                    <span className="resume__sep">–</span>
                    {game.score.white}
                    <span className="resume__disc resume__disc--white" />
                  </span>

                  <span className="resume__text">
                    <strong>{describe(game, t)}</strong>
                    <span>
                      {t.loadGame.status[game.status]} · {t.loadGame.moves(game.moveCount)} ·{' '}
                      {new Date(game.updatedAt).toLocaleString()}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-label={t.loadGame.remove}
                  title={t.loadGame.remove}
                  data-testid={`load-game-btn-retirer-${game.id}`}
                  onClick={() => drop(game.id)}
                >
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
