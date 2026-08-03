import { Mascot, type Pose } from './Mascot'
import { LEVELS } from '../constants/levels'
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

/** A short line in the character's own voice. Kept impersonal in tone, never chatty. */
function lineOf(game: GameState, pose: Pose): string {
  if (game.isOver) {
    if (pose === 'cheer') {
      return 'Victoire'
    }
    return pose === 'hiding' ? 'Défaite' : 'Égalité'
  }

  switch (pose) {
    case 'taunt':
      return 'Large avance'
    case 'pleased':
      return 'Prend le dessus'
    case 'worried':
      return 'En difficulté'
    case 'hiding':
      return 'Ne regarde plus'
    case 'thinking':
      return 'À vous de jouer'
    default:
      return 'En attente'
  }
}

function nameOf(game: GameState, side: Player): string {
  const colour = side === 'Black' ? 'Noirs' : 'Blancs'

  if (game.opponent === 'Human') {
    return colour
  }

  if (side === game.humanColor) {
    return `Vous · ${colour}`
  }

  const level = LEVELS.find((entry) => entry.level === game.level)

  return `${level?.label ?? 'Ordinateur'} · ${colour}`
}

function Side({ game, side }: { game: GameState; side: Player }) {
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
      <Mascot
        pose={pose}
        colour={side}
        facing={side === 'Black' ? 'right' : 'left'}
        active={active}
        testId={`game-view-mascot-${slug}`}
      />

      <span className="player-card__name" data-testid={`game-view-player-${slug}-name`}>
        {nameOf(game, side)}
      </span>
      <span className="player-card__line" data-testid={`game-view-player-${slug}-line`}>
        {lineOf(game, pose)}
      </span>
    </div>
  )
}

/** The two characters framing the score, one per side. */
export function AvatarRow({ game }: AvatarRowProps) {
  return (
    <div className="avatar-row" data-testid="game-view-avatars">
      <Side game={game} side="Black" />
      <Side game={game} side="White" />
    </div>
  )
}
