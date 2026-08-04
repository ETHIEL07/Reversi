import { Disc } from './Disc'
import { FLIP_STEP_MS, ringOf } from '../constants/timing'
import type { CellAnalysis, LastMove, LegalMove } from '../types/game'

type BoardProps = {
  board: string[]
  legalMoves: LegalMove[]
  analysis: CellAnalysis[]
  lastMove: LastMove | null
  /** The computer's move is played slower, so it can be followed. */
  slow: boolean
  /** Legal-move dots can be hidden by players who want to read the board unaided. */
  showHints: boolean
  disabled: boolean
  onPlay: (row: number, col: number) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function key(row: number, col: number): string {
  return `${row}-${col}`
}

function fromNotation(notation: string): { row: number; col: number } {
  return {
    col: notation.charCodeAt(0) - 'a'.charCodeAt(0),
    row: Number.parseInt(notation.slice(1), 10) - 1,
  }
}

/**
 * One beam per direction of the capture, drawn from the played square to the last disc it
 * reaches. The line appears before anything turns, so the capture is announced rather than
 * discovered after the fact.
 */
function beamsOf(move: LastMove | null): { x2: number; y2: number }[] {
  if (move === null) {
    return []
  }

  const farthest = new Map<string, { row: number; col: number; ring: number }>()

  for (const notation of move.flips) {
    const cell = fromNotation(notation)

    if (Number.isNaN(cell.row)) {
      continue
    }

    const ring = ringOf(cell.row, cell.col, move.row, move.col)
    const direction = `${Math.sign(cell.row - move.row)},${Math.sign(cell.col - move.col)}`
    const current = farthest.get(direction)

    if (current === undefined || ring > current.ring) {
      farthest.set(direction, { ...cell, ring })
    }
  }

  return [...farthest.values()].map((cell) => ({ x2: cell.col + 0.5, y2: cell.row + 0.5 }))
}

export function Board({ board, legalMoves, analysis, lastMove, slow, showHints, disabled, onPlay }: BoardProps) {
  const legal = new Map(legalMoves.map((move) => [key(move.row, move.col), move]))
  const cells = new Map(analysis.map((cell) => [key(cell.row, cell.col), cell]))
  const flipped = new Set(lastMove?.flips ?? [])
  const beams = beamsOf(lastMove)

  const boardClasses = ['board']

  if (slow) {
    boardClasses.push('board--slow')
  }

  if (lastMove !== null) {
    // The announcement wears the colour of the side doing the capturing.
    boardClasses.push(lastMove.player === 'Black' ? 'board--capture-black' : 'board--capture-white')
  }

  return (
    <div className={boardClasses.join(' ')} data-testid="board-view-container">
      {board.map((line, row) =>
        Array.from(line).map((cell, col) => {
          const move = legal.get(key(row, col))
          const playable = move !== undefined && !disabled
          const notation = `${FILES[col]}${row + 1}`
          const doomed = lastMove !== null && flipped.has(notation)

          // Discs turned by the last move start their rotation in rings, outward from the
          // square that was played. Everything else turns without waiting.
          const delay = doomed ? ringOf(row, col, lastMove.row, lastMove.col) * FLIP_STEP_MS : 0

          return (
            <button
              key={key(row, col)}
              type="button"
              className={playable ? 'board-cell board-cell--playable' : 'board-cell'}
              data-testid={`board-cell-${row}-${col}`}
              aria-label={notation}
              disabled={!playable}
              onClick={() => onPlay(row, col)}
            >
              {cell === 'B' || cell === 'W' ? (
                <Disc
                  colour={cell === 'B' ? 'Black' : 'White'}
                  analysis={cells.get(key(row, col))}
                  delayMs={delay}
                  doomed={doomed}
                  justPlayed={lastMove !== null && lastMove.row === row && lastMove.col === col}
                  testId={`board-disc-${row}-${col}`}
                />
              ) : null}
              {playable && showHints ? (
                <span className="board-hint" data-testid={`board-hint-${row}-${col}`} />
              ) : null}
            </button>
          )
        }),
      )}

      {lastMove !== null && beams.length > 0 ? (
        <svg
          className={lastMove.player === 'Black' ? 'board-beams board-beams--black' : 'board-beams board-beams--white'}
          viewBox="0 0 8 8"
          preserveAspectRatio="none"
          aria-hidden="true"
          data-testid="board-view-beams"
        >
          {beams.map((beam) => (
            <line
              key={`${beam.x2}-${beam.y2}`}
              className="board-beam"
              x1={lastMove.col + 0.5}
              y1={lastMove.row + 0.5}
              x2={beam.x2}
              y2={beam.y2}
            />
          ))}
        </svg>
      ) : null}
    </div>
  )
}
