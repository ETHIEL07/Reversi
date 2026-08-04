import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AvatarRow } from '../components/AvatarRow'
import { BackButton } from '../components/BackButton'
import { Board } from '../components/Board'
import { BoardLegend } from '../components/BoardLegend'
import { Modal } from '../components/Modal'
import { ScoreBar } from '../components/ScoreBar'
import { Timeline } from '../components/Timeline'
import { HintIcon, JokerIcon, LegendIcon, TimelineIcon } from '../components/ToolIcons'
import { isSaved, saveGame } from '../storage/savedGames'
import { advanceComputer, loadDemoPosition, passTurn, playMove, rewindGame, undoMove } from '../api/games'
import { MAX_FLIP_SOUNDS, playFanfare, playFlip, playPlace, playTick } from '../audio/sounds'
import { REPLY_PAUSE_MS, farthestRing, moveDurationMs, wait } from '../constants/timing'
import { useT } from '../i18n/useT'
import type { DemoPosition, GameState } from '../types/game'

type GameScreenProps = {
  game: GameState
  onChange: (game: GameState) => void
  onBack: () => void
}

type OpenPanel = 'none' | 'legend' | 'joker' | 'timeline' | 'leave'

export function GameScreen({ game, onChange, onBack }: GameScreenProps) {
  const t = useT()

  const demoChoices: { position: DemoPosition; label: string; slug: string; description: string }[] = [
    {
      position: 'MidGame',
      label: t.game.jokerPanel.midGame,
      slug: 'milieu',
      description: t.game.jokerPanel.midGameNote,
    },
    {
      position: 'Endgame',
      label: t.game.jokerPanel.endgame,
      slug: 'fin',
      description: t.game.jokerPanel.endgameNote,
    },
  ]

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [panel, setPanel] = useState<OpenPanel>('none')
  const [saved, setSaved] = useState(() => isSaved(game.id))
  const [showHints, setShowHints] = useState(true)
  // Two players sharing a device: each press turns the board a quarter counter-clockwise,
  // so four presses bring it home. The counter only grows, keeping every turn animated.
  const [turns, setTurns] = useState(0)
  const announced = useRef(false)

  // A move spans several seconds of animation; leaving mid-sequence must not update state.
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true

    return () => {
      alive.current = false
    }
  }, [])

  // The closing fanfare, once per finished game.
  useEffect(() => {
    if (!game.isOver) {
      announced.current = false
      return
    }

    if (announced.current) {
      return
    }

    announced.current = true

    const humanIsBlack = game.opponent === 'Human' || game.humanColor === 'Black'
    const humanScore = humanIsBlack ? game.score.black : game.score.white
    const otherScore = humanIsBlack ? game.score.white : game.score.black

    window.setTimeout(() => playFanfare(humanScore >= otherScore), 350)
  }, [game.isOver, game.opponent, game.humanColor, game.score.black, game.score.white])

  async function run(action: () => Promise<GameState>) {
    setBusy(true)
    setError(null)

    try {
      onChange(await action())
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : t.game.failed)
    } finally {
      setBusy(false)
    }
  }

  /** The knock of the disc landing, then one tick per disc it turns over. */
  function soundOfMove(flips: string[], slow = false) {
    playPlace()
    flips.slice(0, MAX_FLIP_SOUNDS).forEach((_, index) => playFlip(index, slow))
  }

  /**
   * A move against the computer is played in two beats. The human move comes back on its own,
   * is watched until the last captured disc has settled, and only then is the computer asked
   * for its answer. Sent in one go, the two moves land together and the first is never seen.
   */
  async function play(row: number, col: number) {
    const move = game.legalMoves.find((entry) => entry.row === row && entry.col === col)
    const versusComputer = game.opponent === 'Computer'

    soundOfMove(move?.flips ?? [])
    setBusy(true)
    setError(null)

    try {
      const afterHuman = await playMove(game.id, row, col, versusComputer)
      onChange(afterHuman)

      if (!versusComputer || afterHuman.isOver || afterHuman.currentPlayer === afterHuman.humanColor) {
        return
      }

      await wait(moveDurationMs(farthestRing(afterHuman.lastMove)) + REPLY_PAUSE_MS)

      if (!alive.current) {
        return
      }

      const afterComputer = await advanceComputer(game.id)

      if (!alive.current) {
        return
      }

      soundOfMove(afterComputer.lastMove?.flips ?? [], true)
      onChange(afterComputer)

      // Let the computer's own move finish before the board takes clicks again.
      await wait(moveDurationMs(farthestRing(afterComputer.lastMove), true))
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : t.game.failed)
    } finally {
      if (alive.current) {
        setBusy(false)
      }
    }
  }

  /** Leaving an unfinished game offers to keep it; a finished one has nothing to keep. */
  function leave() {
    if (game.isOver || game.moveCount === 0 || saved) {
      onBack()
      return
    }

    playTick()
    setPanel('leave')
  }

  function loadDemo(position: DemoPosition) {
    setPanel('none')
    playTick()
    void run(() => loadDemoPosition(game.id, position))
  }

  return (
    <section className="screen" data-testid="game-view-container">
      <div className="screen__bar">
        <BackButton onClick={leave} label={t.app.back} testId="game-btn-retour" />
      </div>

      <div className="game-layout" data-testid="game-view-layout">
        <div className="game-layout__top">
          <AvatarRow game={game} />
          <ScoreBar game={game} />
        </div>

        <div
          className="game-layout__board board-frame"
          data-testid="game-view-board-frame"
          data-turns={turns % 4}
          style={{ '--board-turns': turns } as CSSProperties}
        >
          <div className="board-shell">
            <Board
              board={game.board}
              legalMoves={game.legalMoves}
              analysis={game.analysis}
              lastMove={game.lastMove}
              slow={game.opponent === 'Computer' && game.lastMove !== null && game.lastMove.player !== game.humanColor}
              showHints={showHints}
              disabled={busy || game.isOver}
              onPlay={(row, col) => void play(row, col)}
            />

            <button
              type="button"
              className="board-rotate"
              title={t.game.flipBoard}
              aria-label={t.game.flipBoard}
              data-testid="game-btn-tourner"
              onClick={() => {
                playTick()
                setTurns((current) => current + 1)
              }}
            >
              {/* The arrow tracks where the original top of the board now points. */}
              <svg
                className="board-rotate__arrow"
                style={{ transform: `rotate(${turns * -90}deg)` }}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 20 L12 6 M6 11 L12 5 L18 11" />
              </svg>
            </button>
          </div>
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
              {t.game.undo}
            </button>

            <button
              type="button"
              className="btn btn--primary"
              data-testid="game-btn-passer"
              disabled={busy || !game.mustPass}
              onClick={() => void run(() => passTurn(game.id))}
            >
              {t.game.pass}
            </button>
          </div>

          <div className="tools" data-testid="game-view-tools">
            <button
              type="button"
              className={showHints ? 'tool' : 'tool tool--off'}
              title={showHints ? t.game.hintsOff : t.game.hintsOn}
              aria-label={showHints ? t.game.hintsOff : t.game.hintsOn}
              aria-pressed={!showHints}
              data-testid="game-btn-aides"
              onClick={() => {
                playTick()
                setShowHints((current) => !current)
              }}
            >
              <HintIcon shown={showHints} />
            </button>

            <button
              type="button"
              className="tool"
              title={t.game.legend}
              aria-label={t.game.legend}
              data-testid="game-btn-legende"
              onClick={() => {
                playTick()
                setPanel('legend')
              }}
            >
              <LegendIcon />
            </button>

            <button
              type="button"
              className="tool tool--timeline"
              title={t.game.timeline}
              aria-label={t.game.timeline}
              data-testid="game-btn-fil"
              disabled={game.moveCount === 0}
              onClick={() => {
                playTick()
                setPanel(panel === 'timeline' ? 'none' : 'timeline')
              }}
            >
              <TimelineIcon />
            </button>

            <button
              type="button"
              className="tool tool--joker"
              title={t.game.joker}
              aria-label={t.game.joker}
              data-testid="game-btn-joker"
              disabled={busy}
              onClick={() => {
                playTick()
                setPanel('joker')
              }}
            >
              <JokerIcon />
            </button>
          </div>

          {panel === 'timeline' ? (
            <Timeline game={game} onPick={(moveNumber) => void run(() => rewindGame(game.id, moveNumber))} />
          ) : null}
        </div>
      </div>

      {panel === 'leave' ? (
        <Modal title={t.game.leave.title} scope="game-leave" onClose={() => setPanel('none')}>
          <p className="modal__lead" data-testid="game-leave-text-lead">
            {t.game.leave.lead}
          </p>

          <div className="menu menu--wide">
            <button
              type="button"
              className="btn btn--primary"
              data-testid="game-leave-btn-sauvegarder"
              onClick={() => {
                playTick()
                saveGame(game.id)
                setSaved(true)
                setPanel('none')
                onBack()
              }}
            >
              {t.game.leave.save}
            </button>

            <button
              type="button"
              className="btn"
              data-testid="game-leave-btn-quitter"
              onClick={() => {
                setPanel('none')
                onBack()
              }}
            >
              {t.game.leave.discard}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              data-testid="game-leave-btn-annuler"
              onClick={() => setPanel('none')}
            >
              {t.game.leave.cancel}
            </button>
          </div>
        </Modal>
      ) : null}

      {panel === 'legend' ? (
        <Modal title={t.game.legend} scope="game-legend" onClose={() => setPanel('none')}>
          <BoardLegend scope="game-legend" />
        </Modal>
      ) : null}

      {panel === 'joker' ? (
        <Modal title={t.game.joker} scope="game-joker" onClose={() => setPanel('none')}>
          <p className="modal__lead" data-testid="game-joker-text-lead">
            {t.game.jokerPanel.lead}
          </p>

          <div className="menu menu--wide">
            {demoChoices.map((choice) => (
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
