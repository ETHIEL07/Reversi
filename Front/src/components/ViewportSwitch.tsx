import { DEVICE_PRESETS, type PreviewMode } from '../types/layout'
import { useT } from '../i18n/useT'

type ViewportSwitchProps = {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}

/** Header toggle that previews the three target formats without resizing the window. */
export function ViewportSwitch({ value, onChange }: ViewportSwitchProps) {
  const t = useT()

  const options: { mode: PreviewMode; label: string; slug: string }[] = [
    { mode: 'auto', label: t.app.preview.auto, slug: 'auto' },
    { mode: 'phone', label: t.app.preview.phone, slug: DEVICE_PRESETS.phone.slug },
    { mode: 'tablet', label: t.app.preview.tablet, slug: DEVICE_PRESETS.tablet.slug },
    { mode: 'fhd', label: t.app.preview.fhd, slug: DEVICE_PRESETS.fhd.slug },
  ]

  return (
    <div className="viewport-switch" role="group" aria-label="Format" data-testid="app-view-viewport">
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          className={value === option.mode ? 'viewport-switch__item viewport-switch__item--on' : 'viewport-switch__item'}
          data-testid={`app-btn-format-${option.slug}`}
          aria-pressed={value === option.mode}
          onClick={() => onChange(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
