import { Champion } from './Champion'
import { useT } from '../i18n/useT'
import type { GameState } from '../types/game'

type EndgameOverlayProps = {
  game: GameState
  onBack: () => void
}

export function EndgameOverlay({ game, onBack }: EndgameOverlayProps) {
  const t = useT()

  const humanIsBlack = game.opponent === 'Human' || game.humanColor === 'Black'
  const humanScore = humanIsBlack ? game.score.black : game.score.white
  const otherScore = humanIsBlack ? game.score.white : game.score.black
  const humanWins = humanScore > otherScore
  const isDraw = humanScore === otherScore

  const winner = humanWins
    ? game.humanColor === 'Black'
      ? 'Black'
      : 'White'
    : game.humanColor === 'Black'
      ? 'White'
      : 'Black'

  const winnerIsHuman = !isDraw && humanWins

  return (
    <div className="endgame-overlay" data-testid="game-endgame-overlay">
      <div className="endgame-backdrop" onClick={onBack} />

      <div className="endgame-panel">
        <div className="endgame-champion">
          <Champion
            side={winner}
            pose={winnerIsHuman ? 'cheer' : isDraw ? 'thinking' : 'hiding'}
            facing="left"
            active={winnerIsHuman}
            testId="endgame-champion"
          />
        </div>

        <div className="endgame-result">
          {isDraw ? (
            <>
              <h2 className="endgame-title">{t.game.results.draw}</h2>
              <p className="endgame-scores">
                {humanScore} — {otherScore}
              </p>
            </>
          ) : winnerIsHuman ? (
            <>
              <h2 className="endgame-title">{t.game.results.youWin}</h2>
              <p className="endgame-scores">
                {humanScore} — {otherScore}
              </p>
            </>
          ) : (
            <>
              <h2 className="endgame-title">{t.game.results.youLose}</h2>
              <p className="endgame-scores">
                {otherScore} — {humanScore}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn btn--primary"
          data-testid="game-btn-home"
          onClick={onBack}
        >
          {t.app.back}
        </button>
      </div>
    </div>
  )
}
