export type VersionDto = {
  number: string
  date: string
  gitVersion: string
}

/**
 * Reads the build identity from the backend. Failures are surfaced to the caller,
 * never swallowed: the header must show that the API is unreachable.
 */
export async function fetchVersion(signal?: AbortSignal): Promise<VersionDto> {
  const response = await fetch('/api/version', { signal })

  if (!response.ok) {
    throw new Error(`GET /api/version -> ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as VersionDto
}
