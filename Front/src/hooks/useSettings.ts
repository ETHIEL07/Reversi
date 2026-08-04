import { useCallback, useEffect, useState } from 'react'
import { setSoundEnabled } from '../audio/sounds'
import type { Language } from '../i18n/dictionary'
import type { Terrain } from '../constants/terrains'

const STORAGE_KEY = 'reversi.settings'

export type Settings = {
  sound: boolean
  /** Set once the player ticks "ne plus afficher" at the end of the guided tour. */
  tutorialDone: boolean
  /** Interface language. The engine and the API never change language. */
  language: Language
  /** Battlefield: repaints the background, the board and the champions' outfit. */
  terrain: Terrain
}

const DEFAULTS: Settings = { sound: true, tutorialDone: false, language: 'fr', terrain: 'forest' }

function read(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULTS
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return DEFAULTS
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Settings>

    return {
      sound: parsed.sound ?? DEFAULTS.sound,
      tutorialDone: parsed.tutorialDone ?? DEFAULTS.tutorialDone,
      language: parsed.language ?? DEFAULTS.language,
      terrain: parsed.terrain ?? DEFAULTS.terrain,
    }
  } catch (cause: unknown) {
    console.error('Unreadable settings, falling back on the defaults', cause)
    return DEFAULTS
  }
}

/** Player preferences, kept in local storage. No account, no server. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(read)

  useEffect(() => {
    setSoundEnabled(settings.sound)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // The terrain paints the page itself, not just the game area.
  useEffect(() => {
    document.documentElement.dataset.terrain = settings.terrain
    document.documentElement.lang = settings.language
  }, [settings.terrain, settings.language])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  return { settings, update }
}
