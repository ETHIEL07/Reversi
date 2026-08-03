type LogoProps = {
  testId?: string
}

/**
 * The mark: a board corner holding a crowned disc, and a second disc caught mid-flip
 * showing both faces at once. The whole game in one shape.
 */
export function Logo({ testId = 'app-img-logo' }: LogoProps) {
  return (
    <svg className="logo" viewBox="0 0 64 64" role="img" aria-label="Reversi" data-testid={testId}>
      <rect className="logo__board" x="4" y="10" width="56" height="46" rx="8" />

      <g className="logo__grid">
        <path d="M 4 25 H 60" />
        <path d="M 4 41 H 60" />
        <path d="M 22 10 V 56" />
        <path d="M 42 10 V 56" />
      </g>

      {/* Corner disc, crowned: the square that can never be taken back. */}
      <circle className="logo__disc logo__disc--black" cx="13" cy="18" r="6.5" />
      <path className="logo__crown" d="M 7 15 L 7 9.5 L 10 12 L 13 8 L 16 12 L 19 9.5 L 19 15 Z" />

      {/* Disc caught on its rim, half black and half white. */}
      <ellipse className="logo__disc logo__disc--white" cx="51" cy="48" rx="6.5" ry="6.5" />
      <path className="logo__half" d="M 51 41.5 A 6.5 6.5 0 0 0 51 54.5 Z" />

      <circle className="logo__disc logo__disc--white" cx="32" cy="33" r="8" />
      <circle className="logo__disc logo__disc--black" cx="32" cy="33" r="8" clipPath="url(#logo-half)" />

      <defs>
        <clipPath id="logo-half">
          <rect x="24" y="25" width="8" height="16" />
        </clipPath>
      </defs>
    </svg>
  )
}
