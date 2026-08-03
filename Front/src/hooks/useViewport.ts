import { useEffect, useState } from 'react'
import type { LayoutFormat, Orientation } from '../types/layout'

export type Viewport = {
  format: LayoutFormat
  orientation: Orientation
}

const TABLET_MIN_WIDTH = 600
const FHD_MIN_WIDTH = 1180

function measure(): Viewport {
  const width = window.innerWidth
  const height = window.innerHeight

  const format: LayoutFormat = width >= FHD_MIN_WIDTH ? 'fhd' : width >= TABLET_MIN_WIDTH ? 'tablet' : 'phone'

  return { format, orientation: width >= height ? 'landscape' : 'portrait' }
}

/**
 * Reads the real window. Used only when the preview is on 'auto': inside a preview frame the
 * layout is driven by a class, because media queries cannot see the frame.
 */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(measure)

  useEffect(() => {
    function update() {
      setViewport(measure())
    }

    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return viewport
}
