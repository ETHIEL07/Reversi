type BackButtonProps = {
  onClick: () => void
  testId: string
  label?: string
}

/**
 * Real arrow, not a chevron: this navigates back, it does not fold a section.
 */
export function BackButton({ onClick, testId, label = 'Retour' }: BackButtonProps) {
  return (
    <button type="button" className="btn btn--ghost btn--icon-text" data-testid={testId} onClick={onClick}>
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <line x1="20" y1="12" x2="5" y2="12" />
        <polyline points="11,6 5,12 11,18" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
