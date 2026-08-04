/**
 * Drawn marks rather than words for the two side tools. Each one says what it opens:
 * an open manual showing the board marks, and a jester hat for the wildcard position.
 */

export function LegendIcon() {
  return (
    <svg className="tool-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* Open manual */}
      <path className="tool-icon__page" d="M4 12 Q14 7 23 12 L23 39 Q14 34 4 39 Z" />
      <path className="tool-icon__page" d="M44 12 Q34 7 25 12 L25 39 Q34 34 44 39 Z" />
      <path className="tool-icon__spine" d="M23 12 L23 39 M25 12 L25 39" />

      {/* The marks it explains, drawn on the pages */}
      <circle className="tool-icon__disc-dark" cx="12" cy="20" r="4.6" />
      <path className="tool-icon__crown" d="M7.4 17 L7.4 12.6 L9.9 14.8 L12 11.6 L14.1 14.8 L16.6 12.6 L16.6 17 Z" />
      <circle className="tool-icon__disc-light" cx="35" cy="21" r="4.6" />
      <circle className="tool-icon__ring" cx="35" cy="21" r="7" />
      <line className="tool-icon__rule" x1="7" y1="30" x2="18" y2="31.6" />
      <line className="tool-icon__rule" x1="30" y1="31.6" x2="41" y2="30" />
    </svg>
  )
}

export function TimelineIcon() {
  return (
    <svg className="tool-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* A rewind arrow curling back over a row of played moves */}
      <line className="tool-icon__rail" x1="6" y1="34" x2="42" y2="34" />
      <circle className="tool-icon__step" cx="10" cy="34" r="3" />
      <circle className="tool-icon__step" cx="20" cy="34" r="3" />
      <circle className="tool-icon__step tool-icon__step--on" cx="30" cy="34" r="4.2" />
      <circle className="tool-icon__step" cx="40" cy="34" r="3" />

      <path className="tool-icon__arrow" d="M36 20 Q24 8 12 20" />
      <polyline className="tool-icon__arrow" points="12,13 12,20 19,20" />
    </svg>
  )
}

export function SaveIcon({ done }: { done: boolean }) {
  return (
    <svg className="tool-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* Grimoire: a mystical tome that holds your memories */}
      <path className="tool-icon__book-left" d="M6 10 Q6 8 8 8 L20 8 L20 40 Q20 42 18 42 L8 42 Q6 42 6 40 Z" />
      <path className="tool-icon__book-right" d="M28 8 L40 8 Q42 8 42 10 L42 40 Q42 42 40 42 L28 42 Q28 42 28 40 L28 8 Z" />
      <line className="tool-icon__book-spine" x1="24" y1="8" x2="24" y2="42" strokeWidth="1" />

      {/* Decorative marks on pages */}
      <line className="tool-icon__mark" x1="10" y1="16" x2="16" y2="16" strokeWidth="1.2" />
      <line className="tool-icon__mark" x1="10" y1="22" x2="16" y2="22" strokeWidth="1.2" />
      <line className="tool-icon__mark" x1="32" y1="16" x2="38" y2="16" strokeWidth="1.2" />
      <line className="tool-icon__mark" x1="32" y1="22" x2="38" y2="22" strokeWidth="1.2" />

      {/* Seal: glows when saved */}
      {done ? (
        <>
          <circle className="tool-icon__seal-glow" cx="24" cy="28" r="10" />
          <circle className="tool-icon__seal" cx="24" cy="28" r="6.5" />
          <path className="tool-icon__seal-check" d="M21 28 L23 30 L27 26" strokeWidth="1.8" />
        </>
      ) : null}
    </svg>
  )
}

export function HintIcon({ shown }: { shown: boolean }) {
  return (
    <svg className="tool-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* A board square with its legal-move dot, watched by an eye */}
      <rect className="tool-icon__cell" x="14" y="18" width="20" height="20" rx="3" />
      <circle className="tool-icon__dot" cx="24" cy="28" r="4" />

      <path className="tool-icon__eye" d="M10 12 Q24 2 38 12 Q24 22 10 12 Z" />
      <circle className="tool-icon__pupil" cx="24" cy="11.6" r="3.2" />

      {/* Hidden: a clean slash across the whole mark */}
      {shown ? null : <line className="tool-icon__slash" x1="8" y1="42" x2="40" y2="6" />}
    </svg>
  )
}

export function JokerIcon() {
  return (
    <svg className="tool-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* Jester hat */}
      <path
        className="tool-icon__hat"
        d="M24 14 Q13 14 9 24 Q5 34 8 38 L40 38 Q43 34 39 24 Q35 14 24 14 Z"
      />
      <path className="tool-icon__hat-lobe" d="M9 24 Q2 20 5 13" />
      <path className="tool-icon__hat-lobe" d="M39 24 Q46 20 43 13" />
      <path className="tool-icon__hat-lobe" d="M24 14 L24 6" />
      <circle className="tool-icon__bell" cx="5" cy="11" r="3.4" />
      <circle className="tool-icon__bell" cx="43" cy="11" r="3.4" />
      <circle className="tool-icon__bell" cx="24" cy="4.6" r="3.4" />
      <path className="tool-icon__brim" d="M6 38 L42 38 L42 43 L6 43 Z" />

      {/* Sparkle: the position appears out of nowhere */}
      <path className="tool-icon__spark" d="M33 27 L34.4 30.6 L38 32 L34.4 33.4 L33 37 L31.6 33.4 L28 32 L31.6 30.6 Z" />
    </svg>
  )
}
