import type { CSSProperties } from 'react'
import type { CellAnalysis } from '../types/game'

type DiscProps = {
  colour: 'Black' | 'White'
  analysis: CellAnalysis | undefined
  /** Discs further from the played square start turning later, so the capture ripples. */
  delayMs: number
  /** True for the square that was just played: it drops instead of turning. */
  justPlayed: boolean
  /** About to be turned by the move being played: outlined until its turn comes. */
  doomed: boolean
  testId: string
}

/** Depth of each body slice, in px. The faces sit just beyond the outermost slices. */
const CORE_STEPS = [-5, -3, -1, 1, 3, 5]

/**
 * The disc is split in two layers on purpose: the inner flipper carries the rotation that
 * produces the flip animation, the outer slot stays upright so the crown and the state rings
 * are never mirrored.
 */
export function Disc({ colour, analysis, delayMs, justPlayed, doomed, testId }: DiscProps) {
  const classes = ['disc-slot']

  if (doomed) {
    classes.push('disc-slot--doomed')
  }

  // Only the four corners get the green protection ring.
  if (analysis?.isCorner === true) {
    classes.push('disc-slot--corner-protected')
  }

  if (justPlayed) {
    classes.push('disc-slot--landed')
  }

  const style = { '--flip-delay': `${delayMs}ms` } as CSSProperties

  return (
    <span
      className={classes.join(' ')}
      style={style}
      data-testid={testId}
      data-colour={colour}
      data-doomed={doomed ? 'true' : 'false'}
    >
      {doomed ? <span className="disc__doom" aria-hidden="true" /> : null}
      <span className={colour === 'White' ? 'disc disc--white' : 'disc'}>
        <span className="disc__face disc__face--black" />
        <span className="disc__face disc__face--white" />
        {/*
         * The body of the piece: full discs stacked along the depth axis. Edge-on, the stack
         * reads as a solid rim — half dark under the black face, half pale under the white
         * one, exactly like a real double-sided piece seen on its side.
         */}
        {CORE_STEPS.map((z) => (
          <span
            key={z}
            className={z > 0 ? 'disc__core disc__core--dark' : 'disc__core disc__core--light'}
            style={{ transform: `translateZ(${z}px)` }}
          />
        ))}
      </span>

      {analysis?.isCorner === true ? <Crown /> : null}
    </span>
  )
}

/** Marks a disc sitting on a corner: it can never be flipped again. */
function Crown() {
  return (
    <svg className="disc__crown" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
      <path d="M2 14 L2 4 L7 8.5 L12 2 L17 8.5 L22 4 L22 14 Z" />
    </svg>
  )
}
