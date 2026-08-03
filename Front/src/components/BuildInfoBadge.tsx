import { useEffect, useState } from 'react'
import { fetchVersion, type VersionDto } from '../api/version'

/**
 * Two small lines in the top-right corner of every screen: build number, then version and hash.
 * When the API is unreachable the badge says so instead of staying silently empty.
 */
export function BuildInfoBadge() {
  const [version, setVersion] = useState<VersionDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchVersion(controller.signal)
      .then(setVersion)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        console.error('BuildInfo unavailable', cause)
        setError('API indisponible')
      })

    return () => controller.abort()
  }, [])

  if (error !== null) {
    return (
      <div className="build-info build-info--error" data-testid="app-text-build-info">
        <span data-testid="app-text-build-number">—</span>
        <span data-testid="app-text-build-version">{error}</span>
      </div>
    )
  }

  return (
    <div className="build-info" data-testid="app-text-build-info">
      <span data-testid="app-text-build-number">{version?.number ?? '…'}</span>
      <span data-testid="app-text-build-version">{version?.gitVersion ?? '…'}</span>
    </div>
  )
}
