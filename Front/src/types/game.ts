export type Player = 'Black' | 'White'

export type CellState = 'Empty' | 'Black' | 'White'

export type GameStatus = 'InProgress' | 'BlackWins' | 'WhiteWins' | 'Draw'

export type OpponentKind = 'Human' | 'Computer'

export type AiLevel = 'Beginner' | 'Normal' | 'Strong'

export type DemoPosition = 'MidGame' | 'Endgame'

export type Score = {
  black: number
  white: number
}

export type LegalMove = {
  row: number
  col: number
  notation: string
  flips: string[]
}

export type CellAnalysis = {
  row: number
  col: number
  state: CellState
  isCorner: boolean
  isStable: boolean
  isAtRisk: boolean
}

/** The move that produced the current board: where the disc landed, and what it turned. */
export type LastMove = {
  row: number
  col: number
  player: Player
  isPass: boolean
  flips: string[]
}

export type GameState = {
  id: string
  board: string[]
  currentPlayer: Player
  status: GameStatus
  score: Score
  isOver: boolean
  mustPass: boolean
  canUndo: boolean
  moveCount: number
  opponent: OpponentKind
  level: AiLevel | null
  humanColor: Player
  legalMoves: LegalMove[]
  analysis: CellAnalysis[]
  lastMove: LastMove | null
}

export type GameSummary = {
  id: string
  createdAt: string
  updatedAt: string
  opponent: OpponentKind
  level: AiLevel | null
  status: GameStatus
  moveCount: number
  score: Score
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export type MoveHistoryEntry = {
  number: number
  player: Player
  notation: string
  isPass: boolean
  flipCount: number
}
