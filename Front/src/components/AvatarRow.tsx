import { Champion, type Pose } from './Champion'
import { useT } from '../i18n/useT'
import type { Dictionary } from '../i18n/dictionary'
import type { GameState, Player } from '../types/game'

type AvatarRowProps = {
  game: GameState
}

/** Posture of one side, read from the disc gap and from the outcome once the game is over. */
function poseOf(game: GameState, side: Player): Pose {
  const own = side === 'Black' ? game.score.black : game.score.white
  const other = side === 'Black' ? game.score.white : game.score.black
  const gap = own - other

  if (game.isOver) {
    if (gap > 0) {
      return 'cheer'
    }
    return gap < 0 ? 'hiding' : 'idle'
  }

  if (gap >= 12) {
    return 'taunt'
  }

  if (gap >= 4) {
    return 'pleased'
  }

  if (gap <= -14) {
    return 'hiding'
  }

  if (gap <= -4) {
    return 'worried'
  }

  return game.currentPlayer === side ? 'thinking' : 'idle'
}

/** A short line under each character. Impersonal tone, never chatty. */
function lineOf(game: GameState, pose: Pose, t: Dictionary): string {
  if (game.isOver) {
    if (pose === 'cheer') {
      return t.champions.win
    }
    return pose === 'hiding' ? t.champions.loss : t.champions.tie
  }

  switch (pose) {
    case 'taunt':
      return t.champions.ahead
    case 'pleased':
      return t.champions.leading
    case 'worried':
      return t.champions.behind
    case 'hiding':
      return t.champions.hiding
    case 'thinking':
      return t.champions.toPlay
    default:
      return t.champions.waiting
  }
}

function nameOf(game: GameState, side: Player, t: Dictionary): string {
  const colour = side === 'Black' ? t.newGame.black : t.newGame.white

  if (game.opponent === 'Human') {
    return colour
  }

  if (side === game.humanColor) {
    return `${t.champions.you} · ${colour}`
  }

  return `${game.level === null ? t.champions.computer : t.levels[game.level].label} · ${colour}`
}

function Side({ game, side }: { game: GameState; side: Player }) {
  const t = useT()
  const pose = poseOf(game, side)
  const active = !game.isOver && game.currentPlayer === side
  const slug = side === 'Black' ? 'black' : 'white'

  return (
    <div
      className={active ? 'player-card player-card--active' : 'player-card'}
      data-testid={`game-view-player-${slug}`}
      data-pose={pose}
      data-active={active ? 'true' : 'false'}
    >
      <Champion
        pose={pose}
        side={side}
        facing={side === 'Black' ? 'right' : 'left'}
        active={active}
        testId={`game-view-champion-${slug}`}
      />

      <span className="player-card__name" data-testid={`game-view-player-${slug}-name`}>
        {nameOf(game, side, t)}
      </span>
      <span className="player-card__line" data-testid={`game-view-player-${slug}-line`}>
        {lineOf(game, pose, t)}
      </span>
    </div>
  )
}

/** The two champions framing the score, one per side. */
export function AvatarRow({ game }: AvatarRowProps) {
  return (
    <div className="avatar-row" data-testid="game-view-avatars">
      <Side game={game} side="Black" />
      <Side game={game} side="White" />
    </div>
  )
}
