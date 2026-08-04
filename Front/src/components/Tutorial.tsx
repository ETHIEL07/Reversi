import { useState, type ReactNode } from 'react'
import { playTick } from '../audio/sounds'
import { useT } from '../i18n/useT'

type TutorialProps = {
  onClose: (dontShowAgain: boolean) => void
}

/** Artwork only: the wording of every step lives in the dictionary, in the same order. */
const SAMPLES: { slug: string; sample: ReactNode }[] = [
  {
    slug: 'but',
    sample: (
      <span className="legend__cell legend__cell--wide">
        <span className="legend__disc legend__disc--black" />
        <span className="legend__disc legend__disc--white" />
      </span>
    ),
  },
  {
    slug: 'coup',
    sample: (
      <span className="legend__cell">
        <span className="legend__hint" />
      </span>
    ),
  },
  {
    slug: 'couronne',
    sample: (
      <span className="legend__cell">
        <span className="legend__disc legend__disc--black legend__disc--crowned" />
      </span>
    ),
  },
  {
    slug: 'vert',
    sample: (
      <span className="legend__cell">
        <span className="legend__disc legend__disc--white legend__ring legend__ring--stable" />
      </span>
    ),
  },
  {
    slug: 'jaune',
    sample: (
      <span className="legend__cell">
        <span className="legend__disc legend__disc--black legend__ring legend__ring--at-risk" />
      </span>
    ),
  },
  {
    slug: 'champions',
    sample: <span className="legend__cell legend__cell--wide legend__cell--plain">♛</span>,
  },
]

/** Guided tour of the board marks, one window at a time, with a "do not show again" box. */
export function Tutorial({ onClose }: TutorialProps) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [dontShow, setDontShow] = useState(false)

  const art = SAMPLES[index]
  const step = t.tutorial.steps[index]
  const isLast = index === SAMPLES.length - 1

  function go(next: number) {
    playTick()
    setIndex(next)
  }

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={t.tutorial.label}
      data-testid="tutorial-modal-root"
    >
      <div className="modal__backdrop modal__backdrop--static" />

      <div className="modal__panel tutorial">
        <div className="modal__header">
          <p className="eyebrow" data-testid="tutorial-text-step">
            {t.tutorial.label} · {index + 1} / {SAMPLES.length}
          </p>

          <button
            type="button"
            className="btn-icon"
            aria-label={t.app.close}
            data-testid="tutorial-btn-fermer"
            onClick={() => onClose(dontShow)}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body tutorial__body" data-testid={`tutorial-view-${art.slug}`}>
          <div className="tutorial__sample">{art.sample}</div>

          <h3 className="display display--lg tutorial__title" data-testid="tutorial-text-title">
            {step.title}
          </h3>

          <p className="tutorial__text" data-testid="tutorial-text-body">
            {step.text}
          </p>

          <div className="tutorial__dots" aria-hidden="true">
            {SAMPLES.map((entry, position) => (
              <span
                key={entry.slug}
                className={position === index ? 'tutorial__dot tutorial__dot--on' : 'tutorial__dot'}
              />
            ))}
          </div>
        </div>

        <div className="tutorial__footer">
          <label className="checkbox" data-testid="tutorial-view-dont-show">
            <input
              type="checkbox"
              checked={dontShow}
              data-testid="tutorial-input-dont-show"
              onChange={(event) => setDontShow(event.target.checked)}
            />
            {t.tutorial.dontShow}
          </label>

          <div className="tutorial__nav">
            <button
              type="button"
              className="btn btn--ghost"
              data-testid="tutorial-btn-precedent"
              disabled={index === 0}
              onClick={() => go(index - 1)}
            >
              {t.tutorial.previous}
            </button>

            <button
              type="button"
              className="btn btn--primary"
              data-testid="tutorial-btn-suivant"
              onClick={() => (isLast ? onClose(dontShow) : go(index + 1))}
            >
              {isLast ? t.tutorial.start : t.tutorial.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
