import { useEffect, useState } from 'react'

export type Pose = 'idle' | 'thinking' | 'pleased' | 'taunt' | 'worried' | 'hiding' | 'cheer'

type ChampionProps = {
  pose: Pose
  side: 'Black' | 'White'
  facing: 'left' | 'right'
  active: boolean
  testId: string
}

type Hand = { x: number; y: number }

type PoseArt = {
  browLeft: string
  browRight: string
  eyes: 'open' | 'wide' | 'squint' | 'closed'
  mouth: string
  mouthFilled: boolean
  leftHand: Hand
  rightHand: Hand
  covered: boolean
}

const POSES: Record<Pose, PoseArt> = {
  idle: {
    browLeft: 'M 30 40 Q 38 36 46 39',
    browRight: 'M 54 39 Q 62 36 70 40',
    eyes: 'open',
    mouth: 'M 41 71 Q 50 75 59 71',
    mouthFilled: false,
    leftHand: { x: 19, y: 101 },
    rightHand: { x: 81, y: 101 },
    covered: false,
  },
  thinking: {
    browLeft: 'M 30 42 Q 38 34 46 40',
    browRight: 'M 54 40 Q 62 34 70 42',
    eyes: 'squint',
    mouth: 'M 43 72 Q 50 69 57 72',
    mouthFilled: false,
    leftHand: { x: 21, y: 102 },
    rightHand: { x: 60, y: 80 },
    covered: false,
  },
  pleased: {
    browLeft: 'M 30 38 Q 38 33 46 37',
    browRight: 'M 54 37 Q 62 33 70 38',
    eyes: 'open',
    mouth: 'M 38 67 Q 50 81 62 67 Q 50 73 38 67',
    mouthFilled: true,
    leftHand: { x: 26, y: 96 },
    rightHand: { x: 74, y: 96 },
    covered: false,
  },
  taunt: {
    browLeft: 'M 30 43 Q 38 38 46 41',
    browRight: 'M 54 38 Q 62 30 70 35',
    eyes: 'wide',
    mouth: 'M 35 65 Q 50 86 65 65 Q 50 74 35 65',
    mouthFilled: true,
    leftHand: { x: 26, y: 98 },
    rightHand: { x: 98, y: 70 },
    covered: false,
  },
  worried: {
    browLeft: 'M 30 34 Q 38 41 46 43',
    browRight: 'M 54 43 Q 62 41 70 34',
    eyes: 'wide',
    mouth: 'M 42 76 Q 50 68 58 76 Q 50 72 42 76',
    mouthFilled: true,
    leftHand: { x: 41, y: 88 },
    rightHand: { x: 59, y: 88 },
    covered: false,
  },
  hiding: {
    browLeft: 'M 30 32 Q 38 41 46 44',
    browRight: 'M 54 44 Q 62 41 70 32',
    eyes: 'closed',
    mouth: 'M 41 78 Q 50 68 59 78 Q 50 73 41 78',
    mouthFilled: true,
    leftHand: { x: 38, y: 51 },
    rightHand: { x: 62, y: 51 },
    covered: true,
  },
  cheer: {
    browLeft: 'M 30 36 Q 38 30 46 35',
    browRight: 'M 54 35 Q 62 30 70 36',
    eyes: 'wide',
    mouth: 'M 36 64 Q 50 90 64 64 Q 50 74 36 64',
    mouthFilled: true,
    leftHand: { x: 13, y: 58 },
    rightHand: { x: 87, y: 58 },
    covered: false,
  },
}

const LEFT_SHOULDER: Hand = { x: 30, y: 96 }
const RIGHT_SHOULDER: Hand = { x: 70, y: 96 }

function arm(shoulder: Hand, hand: Hand): string {
  // Slight outward bow so the arm never reads as a straight stick.
  const midX = (shoulder.x + hand.x) / 2 + (hand.x > shoulder.x ? 6 : -6)
  const midY = (shoulder.y + hand.y) / 2 + 4

  return `M ${shoulder.x} ${shoulder.y} Q ${midX} ${midY} ${hand.x} ${hand.y}`
}

/**
 * A drawn character rather than a stick figure: crown, beard, big eyes with highlights,
 * and a posture that changes with the balance of the game.
 */
export function Champion({ pose, side, facing, active, testId }: ChampionProps) {
  const [reacting, setReacting] = useState(false)

  useEffect(() => {
    setReacting(true)
    const timer = window.setTimeout(() => setReacting(false), 950)

    return () => window.clearTimeout(timer)
  }, [pose])

  const art = POSES[pose]
  const classes = ['champion', `champion--${pose}`, `champion--${side.toLowerCase()}`, `champion--faces-${facing}`]

  if (active) {
    classes.push('champion--active')
  }

  if (reacting) {
    classes.push('champion--reacting')
  }

  return (
    <svg
      className={classes.join(' ')}
      viewBox="0 0 100 122"
      role="img"
      aria-label={`Champion ${side === 'Black' ? 'noir' : 'blanc'}`}
      data-testid={testId}
      data-pose={pose}
    >
      <ellipse className="champion__shadow" cx="50" cy="116" rx="30" ry="5" />

      <g className="champion__body">
        {/* Behind everything, so it reads as worn on the back */}
        <Gear />

        {/* Robe and shoulders */}
        <path className="champion__robe" d="M 22 118 Q 24 92 40 86 L 60 86 Q 76 92 78 118 Z" />
        <path className="champion__collar" d="M 40 86 Q 50 96 60 86 Q 50 92 40 86" />

        {/* Arms behind the head so raised hands read correctly */}
        <g className="champion__arms">
          <path className="champion__arm" d={arm(LEFT_SHOULDER, art.leftHand)} />
          <path className="champion__arm" d={arm(RIGHT_SHOULDER, art.rightHand)} />
          <circle className="champion__hand" cx={art.leftHand.x} cy={art.leftHand.y} r="7" />
          <circle className="champion__hand champion__hand--pointing" cx={art.rightHand.x} cy={art.rightHand.y} r="7" />
        </g>

        <WornGear />

        <g className="champion__head">
          {/* Beard first: the face sits on top of it */}
          <path className="champion__beard" d="M 24 56 Q 22 92 50 96 Q 78 92 76 56 Q 68 78 50 78 Q 32 78 24 56" />

          <circle className="champion__ear" cx="21" cy="52" r="6" />
          <circle className="champion__ear" cx="79" cy="52" r="6" />
          <ellipse className="champion__face" cx="50" cy="50" rx="29" ry="30" />

          <path className="champion__brow" d={art.browLeft} />
          <path className="champion__brow" d={art.browRight} />

          <Eye kind={art.eyes} cx={39} cy={50} />
          <Eye kind={art.eyes} cx={61} cy={50} />

          <ellipse className="champion__nose" cx="50" cy="61" rx="7" ry="5.5" />

          <path
            className={art.mouthFilled ? 'champion__mouth champion__mouth--open' : 'champion__mouth'}
            d={art.mouth}
          />

          <Crown />

          {art.covered ? (
            <g className="champion__cover">
              <circle className="champion__hand" cx="38" cy="51" r="10" />
              <circle className="champion__hand" cx="62" cy="51" r="10" />
            </g>
          ) : null}
        </g>
      </g>
    </svg>
  )
}

function Eye({ kind, cx, cy }: { kind: PoseArt['eyes']; cx: number; cy: number }) {
  if (kind === 'closed') {
    return <path className="champion__eye-closed" d={`M ${cx - 6} ${cy} Q ${cx} ${cy + 5} ${cx + 6} ${cy}`} />
  }

  const radius = kind === 'wide' ? 8 : 7
  const pupil = kind === 'wide' ? 4.2 : 3.4
  const squash = kind === 'squint' ? 0.55 : 1

  return (
    <g className="champion__eye">
      <ellipse className="champion__sclera" cx={cx} cy={cy} rx={radius} ry={radius * squash} />
      <circle className="champion__pupil" cx={cx} cy={cy + 0.5} r={pupil} />
      <circle className="champion__glint" cx={cx - 2} cy={cy - 2.4} r={1.5} />
    </g>
  )
}

/**
 * Every piece of gear is drawn; the terrain selected in the options decides which one is
 * visible, in CSS. That keeps the terrain out of the component signature entirely.
 */
function Gear() {
  return (
    <g className="champion__gear champion__gear--cape">
      <path className="champion__cape" d="M 26 88 Q 50 98 74 88 L 84 118 L 16 118 Z" />
      <circle className="champion__cape-star" cx="34" cy="102" r="1.8" />
      <circle className="champion__cape-star" cx="62" cy="97" r="1.4" />
      <circle className="champion__cape-star" cx="70" cy="110" r="1.9" />
      <circle className="champion__cape-star" cx="26" cy="113" r="1.4" />
      <circle className="champion__cape-star" cx="48" cy="108" r="1.6" />
    </g>
  )
}

/** Gear worn over the robe: in front of the arms, behind the head. */
function WornGear() {
  return (
    <>
      <g className="champion__gear champion__gear--scarf">
        <path className="champion__scarf" d="M 30 86 Q 50 100 70 86 Q 73 96 50 105 Q 27 96 30 86 Z" />
        <path className="champion__scarf-tail" d="M 65 97 L 77 116 L 68 119 L 58 101 Z" />
      </g>

      <g className="champion__gear champion__gear--leaves">
        <path className="champion__leaf" d="M 30 92 Q 16 86 18 74 Q 33 78 36 92 Z" />
        <path className="champion__leaf-vein" d="M 20 76 L 34 90" />
        <path className="champion__leaf" d="M 70 92 Q 84 86 82 74 Q 67 78 64 92 Z" />
        <path className="champion__leaf-vein" d="M 80 76 L 66 90" />
      </g>

      <g className="champion__gear champion__gear--headscarf">
        <path className="champion__cloth" d="M 21 42 Q 11 72 21 94 L 33 89 Q 25 68 27 44 Z" />
        <path className="champion__cloth" d="M 79 42 Q 89 72 79 94 L 67 89 Q 75 68 73 44 Z" />
        <path className="champion__cloth-band" d="M 22 40 Q 50 30 78 40 L 78 47 Q 50 37 22 47 Z" />
      </g>
    </>
  )
}

function Crown() {
  return (
    <g className="champion__crown">
      <path className="champion__crown-gold" d="M 24 26 L 24 8 L 34 17 L 50 2 L 66 17 L 76 8 L 76 26 Z" />
      <rect className="champion__crown-band" x="23" y="24" width="54" height="8" rx="3" />
      <circle className="champion__gem" cx="50" cy="28" r="3.4" />
      <circle className="champion__gem champion__gem--side" cx="34" cy="28" r="2.2" />
      <circle className="champion__gem champion__gem--side" cx="66" cy="28" r="2.2" />
    </g>
  )
}
