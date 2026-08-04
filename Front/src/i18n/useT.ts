import { createContext, useContext } from 'react'
import { DICTIONARIES, type Dictionary } from './dictionary'

export const TextContext = createContext<Dictionary>(DICTIONARIES.fr)

/** The whole dictionary for the current language: `t.game.undo`, never `t('game.undo')`. */
export function useT(): Dictionary {
  return useContext(TextContext)
}
