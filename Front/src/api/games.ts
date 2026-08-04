import { api } from './client'
import type {
  AiLevel,
  DemoPosition,
  GameState,
  LegalMove,
  GameSummary,
  MoveHistoryEntry,
  OpponentKind,
  PagedResult,
  Player,
} from '../types/game'

export type CreateGameOptions = {
  opponent: OpponentKind
  level?: AiLevel | null
  humanColor?: Player
}

export function createGame(options: CreateGameOptions): Promise<GameState> {
  return api.post<GameState>('/api/games', {
    opponent: options.opponent,
    level: options.level ?? null,
    humanColor: options.humanColor ?? 'Black',
  })
}

export function listGames(page = 1, pageSize = 20): Promise<PagedResult<GameSummary>> {
  return api.get<PagedResult<GameSummary>>(`/api/games?page=${page}&pageSize=${pageSize}`)
}

export function getGame(id: string): Promise<GameState> {
  return api.get<GameState>(`/api/games/${id}`)
}

export function getLegalMoves(id: string): Promise<LegalMove[]> {
  return api.get<LegalMove[]>(`/api/games/${id}/moves`)
}

/**
 * `deferComputer` keeps the computer's reply out of this response, so the human move can be
 * watched on its own. The reply is then asked for with {@link advanceComputer}.
 */
export function playMove(
  id: string,
  row: number,
  col: number,
  deferComputer = false,
): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/moves`, { row, col, deferComputer })
}

export function advanceComputer(id: string): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/advance`)
}

export function passTurn(id: string): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/pass`)
}

export function undoMove(id: string): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/undo`)
}

export function loadDemoPosition(id: string, position: DemoPosition): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/demo`, { position })
}

export function rewindGame(id: string, moveNumber: number): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/rewind`, { moveNumber })
}

export function getHistory(id: string): Promise<MoveHistoryEntry[]> {
  return api.get<MoveHistoryEntry[]>(`/api/games/${id}/history`)
}
