import { useEffect, useState } from 'react'
import { BackButton } from '../components/BackButton'
import { playTick } from '../audio/sounds'
import { useT } from '../i18n/useT'
import { readSavedGames } from '../storage/savedGames'
import type { Screen } from '../types/navigation'

type PlayScreenProps = {
  onNavigate: (screen: Screen) => void
  onBack: () => void
}

/** The fork behind "Jouer": start something new, or pick up a saved game. */
export function PlayScreen({ onNavigate, onBack }: PlayScreenProps) {
  const t = useT()
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => setSavedCount(readSavedGames().length), [])

  function go(screen: Screen) {
    playTick()
    onNavigate(screen)
  }

  const savedNote =
    savedCount === 0 ? t.play.noSaved : savedCount === 1 ? t.play.savedOne : t.play.savedMany(savedCount)

  return (
    <section className="screen screen--centered" data-testid="play-view-container">
      <div className="screen__bar screen__bar--full">
        <BackButton onClick={onBack} label={t.app.back} round testId="play-btn-retour" />
      </div>

      <p className="eyebrow">{t.play.eyebrow}</p>
      <h2 className="display display--lg" data-testid="play-text-title">
        {t.play.title}
      </h2>

      <nav className="menu" data-testid="play-view-menu">
        <button
          type="button"
          className="btn btn--menu btn--gold"
          data-testid="play-btn-nouvelle-partie"
          onClick={() => go('new-game')}
        >
          {t.play.newGame}
          <span className="btn__note">{t.play.newGameNote}</span>
        </button>

        <button
          type="button"
          className="btn btn--menu"
          data-testid="play-btn-charger-partie"
          onClick={() => go('load-game')}
        >
          {t.play.loadGame}
          <span className="btn__note">{savedNote}</span>
        </button>
      </nav>
    </section>
  )
}
