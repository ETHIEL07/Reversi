export type LayoutFormat = 'phone' | 'tablet' | 'fhd'

export type Orientation = 'portrait' | 'landscape'

/** 'auto' follows the real window; the three others force a preview frame. */
export type PreviewMode = 'auto' | LayoutFormat

export type DevicePreset = {
  format: LayoutFormat
  label: string
  slug: string
  width: number
  height: number
  orientation: Orientation
}

export const DEVICE_PRESETS: Record<LayoutFormat, DevicePreset> = {
  phone: { format: 'phone', label: 'Téléphone', slug: 'telephone', width: 390, height: 844, orientation: 'portrait' },
  tablet: { format: 'tablet', label: 'Tablette', slug: 'tablette', width: 820, height: 1180, orientation: 'portrait' },
  fhd: { format: 'fhd', label: 'FHD', slug: 'fhd', width: 1920, height: 1080, orientation: 'landscape' },
}
