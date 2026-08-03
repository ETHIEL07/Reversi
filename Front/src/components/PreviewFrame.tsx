import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DEVICE_PRESETS, type PreviewMode } from '../types/layout'

type PreviewFrameProps = {
  mode: PreviewMode
  children: ReactNode
}

/**
 * Draws the app inside a device sized box. The box keeps its real pixel size and is scaled
 * down to fit the window, so what is on screen is what the target device would show.
 */
export function PreviewFrame({ mode, children }: PreviewFrameProps) {
  const holder = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const preset = mode === 'auto' ? null : DEVICE_PRESETS[mode]

  useEffect(() => {
    if (preset === null) {
      setScale(1)
      return
    }

    function fit() {
      const available = holder.current
      if (available === null || preset === null) {
        return
      }

      const width = available.clientWidth
      const height = available.clientHeight

      setScale(Math.min(1, width / preset.width, height / preset.height))
    }

    fit()
    window.addEventListener('resize', fit)

    return () => window.removeEventListener('resize', fit)
  }, [preset])

  if (preset === null) {
    return <>{children}</>
  }

  return (
    <div className="preview" ref={holder} data-testid="app-view-preview">
      <div
        className={`preview__device preview__device--${preset.slug}`}
        style={{
          width: `${preset.width}px`,
          height: `${preset.height}px`,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>

      <p className="preview__caption" data-testid="app-text-preview-caption">
        {preset.label} · {preset.width} × {preset.height} · {Math.round(scale * 100)} %
      </p>
    </div>
  )
}
