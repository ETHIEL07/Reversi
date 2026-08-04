import { useState } from 'react'
import { BackButton } from '../components/BackButton'
import { Champion } from '../components/Champion'
import { createGame } from '../api/games'
import { playTick } from '../audio/sounds'
import { LEVELS } from '../constants/levels'
import { useT } from '../i18n/useT'
import type { AiLevel, GameState, OpponentKind, Player } from '../types/game'

type NewGameScreenProps = {
  onBack: () => void
  onStarted: (game: GameState) => void
}

const LEVEL_CLASS: Record<AiLevel, string> = {
  Beginner: 'beginner',
  Normal: 'normal',
  Strong: 'strong',
}

export function NewGameScreen({ onBack, onStarted }: NewGameScreenProps) {
  const t = useT()
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
      setError(cause instanceof Error ? cause.message : t.newGame.failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="screen" data-testid="new-game-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} label={t.app.back} testId="new-game-btn-retour" />
      </div>

      <div className="screen__body new-game">
        <header className="new-game__head">
          <p className="eyebrow">{t.newGame.eyebrow}</p>
          <h2 className="display display--lg" data-testid="new-game-text-title">
            {t.newGame.title}
          </h2>
        </header>

        <div className="new-game__setup">
          <fieldset className="field" data-testid="new-game-view-modes">
            <legend className="field__legend eyebrow">{t.newGame.opponent}</legend>

            <div className="segmented">
              <button
                type="button"
                className={opponent === 'Human' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                data-testid="new-game-btn-deux-joueurs"
                aria-pressed={opponent === 'Human'}
                onClick={() => {
                  playTick()
                  setOpponent('Human')
                }}
              >
                {t.newGame.twoPlayers}
              </button>

              <button
                type="button"
                className={opponent === 'Computer' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                data-testid="new-game-btn-ordinateur"
                aria-pressed={opponent === 'Computer'}
                onClick={() => {
                  playTick()
                  setOpponent('Computer')
                }}
              >
                {t.newGame.computer}
              </button>
            </div>
          </fieldset>

          {opponent === 'Computer' ? (
            <fieldset className="field" data-testid="new-game-view-levels">
              <legend className="field__legend eyebrow">{t.newGame.difficulty}</legend>

              <div className="levels">
                {LEVELS.map((entry) => (
                  <button
                    key={entry.level}
                    type="button"
                    className={`level level--${LEVEL_CLASS[entry.level]}${level === entry.level ? ' level--on' : ''}`}
                    data-testid={`new-game-btn-niveau-${entry.slug}`}
                    aria-pressed={level === entry.level}
                    onClick={() => {
                      playTick()
                      setLevel(entry.level)
                    }}
                  >
                    <Champion
                      pose={entry.pose}
                      side={entry.level === 'Strong' ? 'Black' : 'White'}
                      facing="right"
                      active={level === entry.level}
                      testId={`new-game-img-niveau-${entry.slug}`}
                    />

                    <span className="level__text">
                      <span className="level__tagline">{t.levels[entry.level].tagline}</span>
                      <span className="level__label">{t.levels[entry.level].label}</span>
                      <span className="level__description">{t.levels[entry.level].description}</span>

                      <span className="level__power" aria-hidden="true">
                        {[1, 2, 3].map((pip) => (
                          <span key={pip} className={pip <= entry.power ? 'level__pip level__pip--on' : 'level__pip'} />
                        ))}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {opponent === 'Computer' ? (
            <fieldset className="field" data-testid="new-game-view-colour">
              <legend className="field__legend eyebrow">{t.newGame.yourColour}</legend>

              <div className="segmented">
                <button
                  type="button"
                  className={colour === 'Black' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                  data-testid="new-game-btn-couleur-noirs"
                  aria-pressed={colour === 'Black'}
                  onClick={() => {
                    playTick()
                    setColour('Black')
                  }}
                >
                  <span className="score__disc score__disc--black" aria-hidden="true" />
                  {t.newGame.black}
                  <span className="segmented__note">{t.newGame.blackStarts}</span>
                </button>

                <button
                  type="button"
                  className={colour === 'White' ? 'segmented__item segmented__item--on' : 'segmented__item'}
                  data-testid="new-game-btn-couleur-blancs"
                  aria-pressed={colour === 'White'}
                  onClick={() => {
                    playTick()
                    setColour('White')
                  }}
                >
                  <span className="score__disc score__disc--white" aria-hidden="true" />
                  {t.newGame.white}
                </button>
              </div>
            </fieldset>
          ) : null}

          <button
            type="button"
            className="btn btn--gold btn--wide"
            data-testid="new-game-btn-commencer"
            disabled={busy}
            onClick={() => void start()}
          >
            {t.newGame.start}
          </button>

          {error !== null ? (
            <p className="error" role="alert" data-testid="new-game-text-error">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
