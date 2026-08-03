import type { GameState } from '../types/game'

type ScoreBarProps = {
  game: GameState
}

const STATUS_LABELS: Record<string, string> = {
  BlackWins: 'Les noirs gagnent',
  WhiteWins: 'Les blancs gagnent',
  Draw: 'Partie nulle',
}

function turnLabel(game: GameState): string {
  if (game.isOver) {
    return STATUS_LABELS[game.status] ?? 'Partie terminée'
  }

  const side = game.currentPlayer === 'Black' ? 'aux noirs' : 'aux blancs'

  return game.mustPass ? `Aucun coup possible, tour à passer` : `Au tour ${side}`
}

/** Score and side to move, always above the board. */
export function ScoreBar({ game }: ScoreBarProps) {
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
        {turnLabel(game)}
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
