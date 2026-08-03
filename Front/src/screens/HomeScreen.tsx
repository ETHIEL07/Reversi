import { Logo } from '../components/Logo'
import type { Screen } from '../types/navigation'

type HomeScreenProps = {
  onNavigate: (screen: Screen) => void
}

const ENTRIES: { screen: Screen; label: string; slug: string }[] = [
  { screen: 'new-game', label: 'Jouer', slug: 'jouer' },
  { screen: 'how-to-play', label: 'Comment jouer', slug: 'comment-jouer' },
  { screen: 'statistics', label: 'Statistiques', slug: 'statistiques' },
  { screen: 'options', label: 'Options', slug: 'options' },
]

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <section className="screen screen--centered" data-testid="home-view-container">
      <div className="home-brand">
        <Logo testId="home-img-logo" />
      </div>

      <p className="screen__lead" data-testid="home-text-lead">
        Le jeu de plateau où la partie se retourne jusqu&apos;au dernier coup.
      </p>

      <nav className="menu" data-testid="home-view-menu">
        {ENTRIES.map((entry) => (
          <button
            key={entry.screen}
            type="button"
            className="btn btn--menu"
            data-testid={`home-btn-${entry.slug}`}
            onClick={() => onNavigate(entry.screen)}
          >
            {entry.label}
          </button>
        ))}
      </nav>
    </section>
  )
}
