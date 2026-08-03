import { Disc } from './Disc'
import type { CellAnalysis, LegalMove } from '../types/game'

type BoardProps = {
  board: string[]
  legalMoves: LegalMove[]
  analysis: CellAnalysis[]
  disabled: boolean
  onPlay: (row: number, col: number) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function key(row: number, col: number): string {
  return `${row}-${col}`
}

export function Board({ board, legalMoves, analysis, disabled, onPlay }: BoardProps) {
  const legal = new Map(legalMoves.map((move) => [key(move.row, move.col), move]))
  const cells = new Map(analysis.map((cell) => [key(cell.row, cell.col), cell]))

  return (
    <div className="board" data-testid="board-view-container">
      {board.map((line, row) =>
        Array.from(line).map((cell, col) => {
          const move = legal.get(key(row, col))
          const playable = move !== undefined && !disabled
          const notation = `${FILES[col]}${row + 1}`

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
                  testId={`board-disc-${row}-${col}`}
                />
              ) : null}
              {playable ? <span className="board-hint" data-testid={`board-hint-${row}-${col}`} /> : null}
            </button>
          )
        }),
      )}
    </div>
  )
}
