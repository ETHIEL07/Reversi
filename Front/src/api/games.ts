import { api } from './client'
import type {
  AiLevel,
  DemoPosition,
  GameState,
  LegalMove,
  MoveHistoryEntry,
  OpponentKind,
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

export function getGame(id: string): Promise<GameState> {
  return api.get<GameState>(`/api/games/${id}`)
}

export function getLegalMoves(id: string): Promise<LegalMove[]> {
  return api.get<LegalMove[]>(`/api/games/${id}/moves`)
}

export function playMove(id: string, row: number, col: number): Promise<GameState> {
  return api.post<GameState>(`/api/games/${id}/moves`, { row, col })
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

export function getHistory(id: string): Promise<MoveHistoryEntry[]> {
  return api.get<MoveHistoryEntry[]>(`/api/games/${id}/history`)
}
