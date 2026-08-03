import { DEVICE_PRESETS, type PreviewMode } from '../types/layout'

type ViewportSwitchProps = {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}

const OPTIONS: { mode: PreviewMode; label: string; slug: string }[] = [
  { mode: 'auto', label: 'Auto', slug: 'auto' },
  { mode: 'phone', label: DEVICE_PRESETS.phone.label, slug: DEVICE_PRESETS.phone.slug },
  { mode: 'tablet', label: DEVICE_PRESETS.tablet.label, slug: DEVICE_PRESETS.tablet.slug },
  { mode: 'fhd', label: DEVICE_PRESETS.fhd.label, slug: DEVICE_PRESETS.fhd.slug },
]

/** Header toggle that previews the three target formats without resizing the window. */
export function ViewportSwitch({ value, onChange }: ViewportSwitchProps) {
  return (
    <div className="viewport-switch" role="group" aria-label="Format de prévisualisation" data-testid="app-view-viewport">
      {OPTIONS.map((option) => (
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
