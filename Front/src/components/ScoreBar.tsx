import { useT } from '../i18n/useT'
import type { Dictionary } from '../i18n/dictionary'
import type { GameState } from '../types/game'

type ScoreBarProps = {
  game: GameState
}

function turnLabel(game: GameState, t: Dictionary): string {
  if (game.isOver) {
    if (game.status === 'BlackWins') {
      return t.game.blackWins
    }

    if (game.status === 'WhiteWins') {
      return t.game.whiteWins
    }

    return game.status === 'Draw' ? t.game.draw : t.game.over
  }

  if (game.mustPass) {
    return t.game.mustPass
  }

  return game.currentPlayer === 'Black' ? t.game.turnBlack : t.game.turnWhite
}

/** Score and side to move, always above the board. */
export function ScoreBar({ game }: ScoreBarProps) {
  const t = useT()

  return (
    <div className="score-bar" data-testid="game-view-score">
      <div
        className={game.currentPlayer === 'Black' && !game.isOver ? 'score score--active' : 'score'}
        data-testid="game-view-score-black"
      >
        <span className="score__disc score__disc--black" aria-hidden="true" />
        <span className="score__value" data-testid="game-text-score-black">
          {game.score.black}
        </span>
      </div>

      <p className="score-bar__turn" data-testid="game-text-turn">
        {turnLabel(game, t)}
      </p>

      <div
        className={game.currentPlayer === 'White' && !game.isOver ? 'score score--active' : 'score'}
        data-testid="game-view-score-white"
      >
        <span className="score__value" data-testid="game-text-score-white">
          {game.score.white}
        </span>
        <span className="score__disc score__disc--white" aria-hidden="true" />
      </div>
    </div>
  )
}
