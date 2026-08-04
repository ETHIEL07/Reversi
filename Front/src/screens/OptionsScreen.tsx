import { BackButton } from '../components/BackButton'
import { playPlace, playTick } from '../audio/sounds'
import { TERRAINS } from '../constants/terrains'
import { LANGUAGES } from '../i18n/dictionary'
import { useT } from '../i18n/useT'
import type { Settings } from '../hooks/useSettings'

type OptionsScreenProps = {
  settings: Settings
  onUpdate: (patch: Partial<Settings>) => void
  onBack: () => void
}

export function OptionsScreen({ settings, onUpdate, onBack }: OptionsScreenProps) {
  const t = useT()

  function toggleSound() {
    const next = !settings.sound
    onUpdate({ sound: next })

    if (next) {
      // Play right after enabling so the choice is audible.
      window.setTimeout(playPlace, 40)
    }
  }

  return (
    <section className="screen" data-testid="options-view-container">
      <div className="screen__bar">
        <BackButton onClick={onBack} label={t.app.back} testId="options-btn-retour" />
      </div>

      <div className="screen__body manual">
        <p className="eyebrow">{t.options.eyebrow}</p>
        <h2 className="display display--lg" data-testid="options-text-title">
          {t.options.title}
        </h2>

        <article className="card" data-testid="options-view-language">
          <h3 className="card__title">{t.options.language}</h3>
          <p className="card__text">{t.options.languageNote}</p>

          <div className="segmented">
            {LANGUAGES.map((entry) => (
              <button
                key={entry.language}
                type="button"
                className={
                  settings.language === entry.language ? 'segmented__item segmented__item--on' : 'segmented__item'
                }
                aria-pressed={settings.language === entry.language}
                data-testid={`options-btn-langue-${entry.language}`}
                onClick={() => {
                  playTick()
                  onUpdate({ language: entry.language })
                }}
              >
                {entry.label}
                <span className="segmented__note">{entry.note}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="card" data-testid="options-view-terrain">
          <h3 className="card__title">{t.options.terrain}</h3>
          <p className="card__text">{t.options.terrainNote}</p>

          <div className="terrains">
            {TERRAINS.map((entry) => (
              <button
                key={entry.terrain}
                type="button"
                className={settings.terrain === entry.terrain ? 'terrain terrain--on' : 'terrain'}
                aria-pressed={settings.terrain === entry.terrain}
                data-testid={`options-btn-terrain-${entry.terrain}`}
                onClick={() => {
                  playTick()
                  onUpdate({ terrain: entry.terrain })
                }}
              >
                <span
                  className="terrain__swatch"
                  style={{ background: `linear-gradient(160deg, ${entry.sky} 38%, ${entry.felt} 100%)` }}
                  aria-hidden="true"
                >
                  <span className="terrain__disc terrain__disc--black" />
                  <span className="terrain__disc terrain__disc--white" />
                </span>

                <span className="terrain__text">
                  <strong>{settings.language === 'fr' ? entry.label : entry.labelEn}</strong>
                  <span>{settings.language === 'fr' ? entry.note : entry.noteEn}</span>
                </span>
              </button>
            ))}
          </div>
        </article>

        <button
          type="button"
          className="switch"
          role="switch"
          aria-checked={settings.sound}
          data-testid="options-switch-son"
          onClick={toggleSound}
        >
          <span className="switch__text">
            <strong>{t.options.sound}</strong>
            <span className="switch__note">{t.options.soundNote}</span>
          </span>

          <span className={settings.sound ? 'switch__track switch__track--on' : 'switch__track'}>
            <span className="switch__knob" />
          </span>
        </button>

        <button
          type="button"
          className="switch"
          role="switch"
          aria-checked={!settings.tutorialDone}
          data-testid="options-switch-guide"
          onClick={() => {
            playTick()
            onUpdate({ tutorialDone: !settings.tutorialDone })
          }}
        >
          <span className="switch__text">
            <strong>{t.options.guide}</strong>
            <span className="switch__note">{t.options.guideNote}</span>
          </span>

          <span className={!settings.tutorialDone ? 'switch__track switch__track--on' : 'switch__track'}>
            <span className="switch__knob" />
          </span>
        </button>
      </div>
    </section>
  )
}
