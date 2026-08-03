import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  title: string
  scope: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, scope, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} data-testid={`${scope}-modal-root`}>
      <button
        type="button"
        className="modal__backdrop"
        aria-label="Fermer"
        data-testid={`${scope}-btn-fermer-fond`}
        onClick={onClose}
      />

      <div className="modal__panel">
        <div className="modal__header">
          <h3 className="modal__title" data-testid={`${scope}-text-title`}>
            {title}
          </h3>

          <button
            type="button"
            className="btn-icon"
            aria-label="Fermer"
            data-testid={`${scope}-btn-fermer`}
            onClick={onClose}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
