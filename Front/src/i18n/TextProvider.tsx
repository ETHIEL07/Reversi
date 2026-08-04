import type { ReactNode } from 'react'
import { DICTIONARIES, type Language } from './dictionary'
import { TextContext } from './useT'

export function TextProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <TextContext.Provider value={DICTIONARIES[language]}>{children}</TextContext.Provider>
}
