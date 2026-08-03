import { useState } from 'react'
import { AvatarRow } from '../components/AvatarRow'
import { BackButton } from '../components/BackButton'
import { Board } from '../components/Board'
import { BoardLegend } from '../components/BoardLegend'
import { Modal } from '../components/Modal'
import { ScoreBar } from '../components/ScoreBar'
import { loadDemoPosition, passTurn, playMove, undoMove } from '../api/games'
import type { DemoPosition, GameState } from '../types/game'

type GameScreenProps = {
  game: GameState
  onChange: (game: GameState) => void
  onBack: () => void
}

type OpenPanel = 'none' | 'legend' | 'joker'

const DEMO_CHOICES: { position: DemoPosition; label: string; slug: string; description: string }[] = [
  {
    position: 'MidGame',
    label: 'Milieu de partie',
    slug: 'milieu',
    description: 'Plateau bien rempli, les deux camps ont encore beaucoup de coups.',
  },
  {
    position: 'Endgame',
    label: 'Fin de partie serrée',
    slug: 'fin',
    description: 'Quelques cases libres et un score qui se joue à peu de pions.',
  },
]

export function GameScreen({ game, onChange, onBack }: GameScreenProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [panel, setPanel] = useState<OpenPanel>('none')

  async function run(action: () => Promise<GameState>) {
    setBusy(true)
    setError(null)

    try {
      onChange(await action())
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Action impossible.')
    } finally {
      setBusy(false)
    }
  }

  function loadDemo(position: DemoPosition) {
    setPanel('none')
    void run(() => loadDemoPosition(game.id, position))
  }

  return (
    <section className="screen" data-testid="game-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} testId="game-btn-retour" />
      </div>

      <div className="game-layout" data-testid="game-view-layout">
        <div className="game-layout__top">
          <AvatarRow game={game} />
          <ScoreBar game={game} />
        </div>

        <div className="game-layout__board board-frame" data-testid="game-view-board-frame">
          <Board
            board={game.board}
            legalMoves={game.legalMoves}
            analysis={game.analysis}
            disabled={busy || game.isOver}
            onPlay={(row, col) => void run(() => playMove(game.id, row, col))}
          />
        </div>

        <div className="game-layout__actions">
          {error !== null ? (
            <p className="error" role="alert" data-testid="game-text-error">
              {error}
            </p>
          ) : null}

          <div className="actions" data-testid="game-view-actions">
            <button
              type="button"
              className="btn"
              data-testid="game-btn-annuler"
              disabled={busy || !game.canUndo}
              onClick={() => void run(() => undoMove(game.id))}
            >
              Annuler
            </button>

            <button
              type="button"
              className="btn btn--primary"
              data-testid="game-btn-passer"
              disabled={busy || !game.mustPass}
              onClick={() => void run(() => passTurn(game.id))}
            >
              Passer
            </button>
          </div>

          <div className="actions actions--secondary">
            <button
              type="button"
              className="btn btn--ghost btn--icon-text"
              data-testid="game-btn-legende"
              onClick={() => setPanel('legend')}
            >
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.9.7-.9 1.3v.6" />
                <line x1="12" y1="17" x2="12" y2="17" />
              </svg>
              <span>Légende</span>
            </button>

            <button
              type="button"
              className="btn btn--ghost btn--icon-text"
              data-testid="game-btn-joker"
              disabled={busy}
              onClick={() => setPanel('joker')}
            >
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <line x1="6" y1="18" x2="17" y2="7" />
                <path d="M15 5 L19 9" />
                <path d="M5 4 L5 8 M3 6 L7 6" />
                <path d="M17 15 L17 18 M15.5 16.5 L18.5 16.5" />
              </svg>
              <span>Joker</span>
            </button>
          </div>
        </div>
      </div>

      {panel === 'legend' ? (
        <Modal title="Légende du plateau" scope="game-legend" onClose={() => setPanel('none')}>
          <BoardLegend scope="game-legend" />
        </Modal>
      ) : null}

      {panel === 'joker' ? (
        <Modal title="Joker" scope="game-joker" onClose={() => setPanel('none')}>
          <p className="modal__lead" data-testid="game-joker-text-lead">
            Charge une position toute faite à la place de la partie en cours. Outil de démonstration et
            d&apos;essai : la partie actuelle est remplacée.
          </p>

          <div className="menu menu--wide">
            {DEMO_CHOICES.map((choice) => (
              <button
                key={choice.position}
                type="button"
                className="btn btn--menu"
                data-testid={`game-joker-btn-${choice.slug}`}
                onClick={() => loadDemo(choice.position)}
              >
                {choice.label}
                <span className="btn__note">{choice.description}</span>
              </button>
            ))}
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
