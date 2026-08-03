import { useState } from 'react'
import { BackButton } from '../components/BackButton'
import { createGame } from '../api/games'
import { LEVELS } from '../constants/levels'
import type { AiLevel, GameState, OpponentKind, Player } from '../types/game'

type NewGameScreenProps = {
  onBack: () => void
  onStarted: (game: GameState) => void
}

export function NewGameScreen({ onBack, onStarted }: NewGameScreenProps) {
  const [opponent, setOpponent] = useState<OpponentKind>('Human')
  const [level, setLevel] = useState<AiLevel>('Normal')
  const [colour, setColour] = useState<Player>('Black')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setBusy(true)
    setError(null)

    try {
      onStarted(
        await createGame({
          opponent,
          level: opponent === 'Computer' ? level : null,
          humanColor: colour,
        }),
      )
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'La partie n’a pas pu être créée.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="screen" data-testid="new-game-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} testId="new-game-btn-retour" />
      </div>

      <div className="screen__body">
        <h2 className="screen__title" data-testid="new-game-text-title">
          Nouvelle partie
        </h2>

        <fieldset className="field" data-testid="new-game-view-modes">
          <legend className="field__legend">Adversaire</legend>

          <div className="segmented">
            <button
              type="button"
              className={opponent === 'Human' ? 'segmented__item segmented__item--on' : 'segmented__item'}
              data-testid="new-game-btn-deux-joueurs"
              aria-pressed={opponent === 'Human'}
              onClick={() => setOpponent('Human')}
            >
              Deux joueurs
            </button>

            <button
              type="button"
              className={opponent === 'Computer' ? 'segmented__item segmented__item--on' : 'segmented__item'}
              data-testid="new-game-btn-ordinateur"
              aria-pressed={opponent === 'Computer'}
              onClick={() => setOpponent('Computer')}
            >
              Ordinateur
            </button>
          </div>
        </fieldset>

        {opponent === 'Computer' ? (
          <fieldset className="field" data-testid="new-game-view-levels">
            <legend className="field__legend">Difficulté</legend>

            <div className="levels">
              {LEVELS.map((entry) => (
                <button
                  key={entry.level}
                  type="button"
                  className={level === entry.level ? 'level level--on' : 'level'}
                  data-testid={`new-game-btn-niveau-${entry.slug}`}
                  aria-pressed={level === entry.level}
                  onClick={() => setLevel(entry.level)}
                >
                  <span className="level__face" aria-hidden="true">
                    {entry.face}
                  </span>
                  <span className="level__label">{entry.label}</span>
                  <span className="level__description">{entry.description}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {opponent === 'Computer' ? (
          <fieldset className="field" data-testid="new-game-view-colour">
            <legend className="field__legend">Votre couleur</legend>

            <div className="segmented">
              <button
                type="button"
                className={colour === 'Black' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                data-testid="new-game-btn-couleur-noirs"
                aria-pressed={colour === 'Black'}
                onClick={() => setColour('Black')}
              >
                <span className="score__disc score__disc--black" aria-hidden="true" />
                Noirs
                <span className="segmented__note">commencent</span>
              </button>

              <button
                type="button"
                className={colour === 'White' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                data-testid="new-game-btn-couleur-blancs"
                aria-pressed={colour === 'White'}
                onClick={() => setColour('White')}
              >
                <span className="score__disc score__disc--white" aria-hidden="true" />
                Blancs
              </button>
            </div>
          </fieldset>
        ) : null}

        <button
          type="button"
          className="btn btn--primary btn--wide"
          data-testid="new-game-btn-commencer"
          disabled={busy}
          onClick={() => void start()}
        >
          Commencer la partie
        </button>

        {error !== null ? (
          <p className="error" role="alert" data-testid="new-game-text-error">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
