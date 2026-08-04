type BackButtonProps = {
  onClick: () => void
  testId: string
  label?: string
  /** Turns the straight arrow into one that loops back on itself. */
  round?: boolean
}

/**
 * Real arrow, not a chevron: this navigates back, it does not fold a section.
 */
export function BackButton({ onClick, testId, label = 'Retour', round = false }: BackButtonProps) {
  return (
    <button
      type="button"
      className={round ? 'btn btn--ghost btn--icon-text btn--loop' : 'btn btn--ghost btn--icon-text'}
      data-testid={testId}
      onClick={onClick}
    >
      {round ? (
        // A full turn on itself: the page goes back where it came from.
        <svg className="icon icon--loop" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4.5 12a7.5 7.5 0 1 0 2.6-5.7" />
          <polyline points="3.4,3.9 4.2,9.4 9.7,8.6" />
        </svg>
      ) : (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <line x1="20" y1="12" x2="5" y2="12" />
          <polyline points="11,6 5,12 11,18" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  )
}
