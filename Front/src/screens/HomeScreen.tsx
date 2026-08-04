import { Champion } from '../components/Champion'
import { Logo } from '../components/Logo'
import { playTick } from '../audio/sounds'
import { useT } from '../i18n/useT'
import type { Screen } from '../types/navigation'

type HomeScreenProps = {
  onNavigate: (screen: Screen) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const t = useT()

  const entries: { screen: Screen; label: string; note: string; slug: string; variant: string }[] = [
    { screen: 'play', label: t.home.play, note: t.home.playNote, slug: 'jouer', variant: 'btn--gold' },
    { screen: 'how-to-play', label: t.home.howToPlay, note: t.home.howToPlayNote, slug: 'comment-jouer', variant: '' },
    { screen: 'statistics', label: t.home.statistics, note: t.home.statisticsNote, slug: 'statistiques', variant: '' },
    { screen: 'options', label: t.home.options, note: t.home.optionsNote, slug: 'options', variant: '' },
  ]

  function go(screen: Screen) {
    playTick()
    onNavigate(screen)
  }

  return (
    <section className="screen screen--centered home" data-testid="home-view-container">
      <div className="home-hero">
        <Champion pose="taunt" side="Black" facing="right" active testId="home-img-champion-black" />

        <div className="home-hero__title">
          <Logo testId="home-img-logo" />
          <h2 className="display display--xl" data-testid="home-text-title">
            {t.app.title}
          </h2>
          <p className="eyebrow" data-testid="home-text-lead">
            {t.home.lead}
          </p>
        </div>

        <Champion pose="worried" side="White" facing="left" active={false} testId="home-img-champion-white" />
      </div>

      <nav className="menu" data-testid="home-view-menu">
        {entries.map((entry) => (
          <button
            key={entry.screen}
            type="button"
            className={`btn btn--menu ${entry.variant}`.trim()}
            data-testid={`home-btn-${entry.slug}`}
            onClick={() => go(entry.screen)}
          >
            {entry.label}
            <span className="btn__note">{entry.note}</span>
          </button>
        ))}
      </nav>
    </section>
  )
}
