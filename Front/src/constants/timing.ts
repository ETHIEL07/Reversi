/**
 * One place for the pace of a move, because the CSS and the turn sequencing have to agree:
 * the disc has to be seen landing, then the discs it captures turn one after the other,
 * and only once that wave is finished does the computer get to answer.
 */

/** The disc dropping onto its square. */
export const DROP_MS = 360

/** A single disc turning over on its rim. */
export const FLIP_MS = 1300

/** Added per square of distance from the played square, so the flips ripple outward. */
export const FLIP_STEP_MS = 130

/** Breath between the end of a move and the computer starting its own. */
export const REPLY_PAUSE_MS = 420

/**
 * The computer plays slower than the player does. Its move is the one nobody chose, so it is
 * the one that has to be readable: the disc is seen coming down, and the capture is announced
 * before it happens.
 */
export const COMPUTER_SLOWDOWN = 1.45

/** How long the doomed discs are outlined before the first one starts turning. */
export const TELEGRAPH_MS = 520

/** Chebyshev distance: discs on the same ring around the played square turn together. */
export function ringOf(row: number, col: number, fromRow: number, fromCol: number): number {
  return Math.max(Math.abs(row - fromRow), Math.abs(col - fromCol))
}

/** How long the whole move takes on screen, from the drop to the last disc settling. */
export function moveDurationMs(farthestRing: number, slow = false): number {
  const total = DROP_MS + TELEGRAPH_MS + farthestRing * FLIP_STEP_MS + FLIP_MS

  return Math.round(slow ? total * COMPUTER_SLOWDOWN : total)
}

/** Ring of the disc that turns last, which is the one the move has to wait for. */
export function farthestRing(move: { row: number; col: number; flips: string[] } | null): number {
  if (move === null) {
    return 0
  }

  return move.flips.reduce((far, notation) => {
    const col = notation.charCodeAt(0) - 'a'.charCodeAt(0)
    const row = Number.parseInt(notation.slice(1), 10) - 1

    return Number.isNaN(row) ? far : Math.max(far, ringOf(row, col, move.row, move.col))
  }, 0)
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
