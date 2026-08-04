const STORAGE_KEY = 'reversi.savedGames'
const MAX_SAVED = 20

/** Identifiers the player explicitly saved before leaving a game. Nothing else is listed. */
export function readSavedGames(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch (cause: unknown) {
    console.error('Unreadable saved games list', cause)
    return []
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_SAVED)))
}

export function saveGame(id: string) {
  write([id, ...readSavedGames().filter((entry) => entry !== id)])
}

export function forgetGame(id: string) {
  write(readSavedGames().filter((entry) => entry !== id))
}

export function isSaved(id: string): boolean {
  return readSavedGames().includes(id)
}
