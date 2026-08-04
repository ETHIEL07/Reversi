const DISCS = [
  { left: '6%', size: 74, duration: 34, delay: 0 },
  { left: '22%', size: 42, duration: 27, delay: 6 },
  { left: '38%', size: 96, duration: 42, delay: 13 },
  { left: '57%', size: 54, duration: 30, delay: 3 },
  { left: '72%', size: 118, duration: 48, delay: 18 },
  { left: '88%', size: 62, duration: 36, delay: 9 },
]

/** Living background: drifting light, a faint grid, and half black half white discs rising slowly. */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true" data-testid="app-view-backdrop">
      <div className="backdrop__aurora" />
      <div className="backdrop__grid" />

      {DISCS.map((disc) => (
        <span
          key={disc.left}
          className="backdrop__disc"
          style={{
            left: disc.left,
            width: `${disc.size}px`,
            height: `${disc.size}px`,
            animationDuration: `${disc.duration}s`,
            animationDelay: `-${disc.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
