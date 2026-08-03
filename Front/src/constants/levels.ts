import type { AiLevel } from '../types/game'

export type LevelChoice = {
  level: AiLevel
  label: string
  slug: string
  face: string
  description: string
}

/** The three levels, each with the mood it plays in. Labels in French, values in English. */
export const LEVELS: LevelChoice[] = [
  {
    level: 'Beginner',
    label: 'Débutant',
    slug: 'debutant',
    face: '🙂',
    description: 'Joue au hasard parmi les coups possibles. Idéal pour apprendre.',
  },
  {
    level: 'Normal',
    label: 'Normal',
    slug: 'normal',
    face: '🤔',
    description: 'Prend le plus de pions possible à chaque coup.',
  },
  {
    level: 'Strong',
    label: 'Fort',
    slug: 'fort',
    face: '😈',
    description: 'Anticipe plusieurs coups à l’avance et vise les coins.',
  },
]
