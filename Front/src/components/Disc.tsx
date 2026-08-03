import type { CellAnalysis } from '../types/game'

type DiscProps = {
  colour: 'Black' | 'White'
  analysis: CellAnalysis | undefined
  testId: string
}

/**
 * The disc is split in two layers on purpose: the inner flipper carries the rotation that
 * produces the flip animation, the outer slot stays upright so the crown and the state rings
 * are never mirrored.
 */
export function Disc({ colour, analysis, testId }: DiscProps) {
  const classes = ['disc-slot']

  if (analysis?.isStable === true) {
    classes.push('disc-slot--stable')
  }

  if (analysis?.isAtRisk === true) {
    classes.push('disc-slot--at-risk')
  }

  return (
    <span
      className={classes.join(' ')}
      data-testid={testId}
      data-colour={colour}
      data-stable={analysis?.isStable === true ? 'true' : 'false'}
      data-at-risk={analysis?.isAtRisk === true ? 'true' : 'false'}
    >
      <span className={colour === 'White' ? 'disc disc--white' : 'disc'}>
        <span className="disc__face disc__face--black" />
        <span className="disc__face disc__face--white" />
        {/* The rim gives the piece a real thickness, so the turn reads as a physical flip. */}
        <span className="disc__edge" />
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
