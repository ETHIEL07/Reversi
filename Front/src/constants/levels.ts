import type { Pose } from '../components/Champion'
import type { AiLevel } from '../types/game'

export type LevelChoice = {
  level: AiLevel
  slug: string
  /** Attitude the champion strikes on the difficulty card. */
  pose: Pose
  /** How many pips light up on the power meter. */
  power: 1 | 2 | 3
}

/** The three levels. Wording lives in the dictionary; only the artwork is decided here. */
export const LEVELS: LevelChoice[] = [
  { level: 'Beginner', slug: 'debutant', pose: 'pleased', power: 1 },
  { level: 'Normal', slug: 'normal', pose: 'thinking', power: 2 },
  { level: 'Strong', slug: 'fort', pose: 'taunt', power: 3 },
]
