import { useEffect, useState } from 'react'

export type Pose = 'idle' | 'thinking' | 'pleased' | 'taunt' | 'worried' | 'hiding' | 'cheer'

type MascotProps = {
  pose: Pose
  colour: 'Black' | 'White'
  facing: 'left' | 'right'
  active: boolean
  testId: string
}

type PoseArt = {
  leftArm: string
  rightArm: string
  leftLeg: string
  rightLeg: string
  brows: { left: string; right: string }
  mouth: string
  eyes: 'open' | 'closed' | 'wide'
  covered: boolean
}

const STAND_LEGS = { leftLeg: 'M 32 62 L 25 84', rightLeg: 'M 32 62 L 39 84' }
const WIDE_LEGS = { leftLeg: 'M 32 62 L 21 82', rightLeg: 'M 32 62 L 43 82' }

const POSES: Record<Pose, PoseArt> = {
  idle: {
    leftArm: 'M 32 40 L 21 57',
    rightArm: 'M 32 40 L 43 57',
    ...STAND_LEGS,
    brows: { left: 'M 22 15 L 29 15', right: 'M 35 15 L 42 15' },
    mouth: 'M 26 30 L 38 30',
    eyes: 'open',
    covered: false,
  },
  thinking: {
    // One hand under the chin, weight on one leg.
    leftArm: 'M 32 40 L 22 55',
    rightArm: 'M 32 40 L 42 48 L 36 32',
    ...STAND_LEGS,
    brows: { left: 'M 22 13 L 29 16', right: 'M 35 16 L 42 13' },
    mouth: 'M 27 31 L 36 29',
    eyes: 'open',
    covered: false,
  },
  pleased: {
    // Hands on hips.
    leftArm: 'M 32 40 L 21 50 L 28 55',
    rightArm: 'M 32 40 L 43 50 L 36 55',
    ...STAND_LEGS,
    brows: { left: 'M 22 14 L 29 13', right: 'M 35 13 L 42 14' },
    mouth: 'M 25 28 Q 32 36 39 28',
    eyes: 'open',
    covered: false,
  },
  taunt: {
    // Points straight at the opponent, other hand on the hip.
    leftArm: 'M 32 40 L 21 51 L 28 56',
    rightArm: 'M 32 40 L 48 44 L 60 40',
    ...WIDE_LEGS,
    brows: { left: 'M 22 13 L 29 17', right: 'M 35 17 L 42 12' },
    mouth: 'M 24 27 Q 32 38 40 27 Q 32 33 24 27',
    eyes: 'wide',
    covered: false,
  },
  worried: {
    // Arms pulled in tight.
    leftArm: 'M 32 41 L 27 53',
    rightArm: 'M 32 41 L 37 53',
    leftLeg: 'M 32 62 L 27 84',
    rightLeg: 'M 32 62 L 37 84',
    brows: { left: 'M 22 12 L 29 17', right: 'M 35 17 L 42 12' },
    mouth: 'M 26 33 Q 32 26 38 33',
    eyes: 'wide',
    covered: false,
  },
  hiding: {
    // Shuts up shop: both hands over the face, refuses to look at the board.
    leftArm: 'M 32 42 L 24 30 L 27 22',
    rightArm: 'M 32 42 L 40 30 L 37 22',
    leftLeg: 'M 32 62 L 28 84',
    rightLeg: 'M 32 62 L 36 84',
    brows: { left: 'M 22 11 L 29 18', right: 'M 35 18 L 42 11' },
    mouth: 'M 26 34 Q 32 25 38 34',
    eyes: 'closed',
    covered: true,
  },
  cheer: {
    // Both arms thrown up.
    leftArm: 'M 32 40 L 19 24 L 16 15',
    rightArm: 'M 32 40 L 45 24 L 48 15',
    ...WIDE_LEGS,
    brows: { left: 'M 22 14 L 29 11', right: 'M 35 11 L 42 14' },
    mouth: 'M 24 27 Q 32 40 40 27 Q 32 34 24 27',
    eyes: 'wide',
    covered: false,
  },
}

/**
 * A small character, not a picture: it has arms, legs, a posture and a loop of its own.
 * It taunts the opponent when it is well ahead and hides behind its hands when it thinks
 * the game is lost.
 */
export function Mascot({ pose, colour, facing, active, testId }: MascotProps) {
  const [reacting, setReacting] = useState(false)

  useEffect(() => {
    setReacting(true)
    const timer = window.setTimeout(() => setReacting(false), 950)

    return () => window.clearTimeout(timer)
  }, [pose])

  const art = POSES[pose]
  const classes = ['mascot', `mascot--${pose}`, `mascot--${colour.toLowerCase()}`, `mascot--faces-${facing}`]

  if (active) {
    classes.push('mascot--active')
  }

  if (reacting) {
    classes.push('mascot--reacting')
  }

  return (
    <svg
      className={classes.join(' ')}
      viewBox="0 0 64 92"
      role="img"
      aria-label={`Personnage ${colour === 'Black' ? 'noir' : 'blanc'}`}
      data-testid={testId}
      data-pose={pose}
    >
      <g className="mascot__body">
        <ellipse className="mascot__shadow" cx="32" cy="87" rx="15" ry="3.5" />

        <g className="mascot__limbs">
          <path className="mascot__limb" d={art.leftLeg} />
          <path className="mascot__limb" d={art.rightLeg} />
        </g>

        <path className="mascot__limb mascot__torso" d="M 32 34 L 32 63" />

        <g className="mascot__arms">
          <path className="mascot__limb" d={art.leftArm} />
          <path className="mascot__limb mascot__limb--pointing" d={art.rightArm} />
        </g>

        <g className="mascot__head">
          <circle className="mascot__skull" cx="32" cy="19" r="15" />
          <path className="mascot__stroke" d={art.brows.left} />
          <path className="mascot__stroke" d={art.brows.right} />
          <Eyes kind={art.eyes} />
          <path className="mascot__mouth" d={art.mouth} />
          {art.covered ? <path className="mascot__hands" d="M 19 22 Q 32 34 45 22 Q 32 28 19 22" /> : null}
        </g>
      </g>
    </svg>
  )
}

function Eyes({ kind }: { kind: 'open' | 'closed' | 'wide' }) {
  if (kind === 'closed') {
    return (
      <g className="mascot__eyes">
        <path className="mascot__stroke" d="M 22 22 Q 26 25 30 22" />
        <path className="mascot__stroke" d="M 34 22 Q 38 25 42 22" />
      </g>
    )
  }

  const radius = kind === 'wide' ? 3.4 : 2.7

  return (
    <g className="mascot__eyes">
      <circle className="mascot__eye" cx="26" cy="22" r={radius} />
      <circle className="mascot__eye" cx="38" cy="22" r={radius} />
    </g>
  )
}
