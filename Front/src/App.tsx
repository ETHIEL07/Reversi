import { useState } from 'react'
import { Backdrop } from './components/Backdrop'
import { BuildInfoBadge } from './components/BuildInfoBadge'
import { Logo } from './components/Logo'
import { PreviewFrame } from './components/PreviewFrame'
import { Tutorial } from './components/Tutorial'
import { ViewportSwitch } from './components/ViewportSwitch'
import { useSettings } from './hooks/useSettings'
import { TextProvider } from './i18n/TextProvider'
import { useViewport } from './hooks/useViewport'
import { HomeScreen } from './screens/HomeScreen'
import { HowToPlayScreen } from './screens/HowToPlayScreen'
import { LoadGameScreen } from './screens/LoadGameScreen'
import { NewGameScreen } from './screens/NewGameScreen'
import { GameScreen } from './screens/GameScreen'
import { OptionsScreen } from './screens/OptionsScreen'
import { PlayScreen } from './screens/PlayScreen'
import { StatisticsScreen } from './screens/StatisticsScreen'
import { DEVICE_PRESETS, type PreviewMode } from './types/layout'
import type { GameState } from './types/game'
import type { Screen } from './types/navigation'
import './App.css'
import './styles/theme.css'
import './styles/terrains.css'
import './styles/layout.css'
import './styles/board.css'
import './styles/screens.css'
import './styles/controls.css'
import './styles/champions.css'
import './styles/tools.css'
import './styles/manual.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [game, setGame] = useState<GameState | null>(null)
  const [preview, setPreview] = useState<PreviewMode>('auto')
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const measured = useViewport()
  const { settings, update } = useSettings()

  // Inside a preview frame the media queries do not see the frame, so the layout is driven
  // by these classes and never by @media alone.
  const format = preview === 'auto' ? measured.format : DEVICE_PRESETS[preview].format
  const orientation = preview === 'auto' ? measured.orientation : DEVICE_PRESETS[preview].orientation

  function startGame(started: GameState) {
    setGame(started)
    setScreen('game')

    if (!settings.tutorialDone) {
      setTutorialOpen(true)
    }
  }

  function openGame(opened: GameState) {
    setGame(opened)
    setScreen('game')
  }

  function closeTutorial(dontShowAgain: boolean) {
    setTutorialOpen(false)

    if (dontShowAgain) {
      update({ tutorialDone: true })
    }
  }

  return (
    <TextProvider language={settings.language}>
    <div className="app" data-testid="app-view-container">
      <Backdrop />

      <header className="app-header" data-testid="app-view-header">
        <div className="app-brand">
          <Logo />
          <h1 className="app-title" data-testid="app-text-title">
            Reversi
          </h1>
        </div>

        <ViewportSwitch value={preview} onChange={setPreview} />

        <BuildInfoBadge />
      </header>

      <PreviewFrame mode={preview}>
        <main
          className={`layout layout--${format} layout--${orientation}`}
          data-testid="app-view-main"
          data-format={format}
          data-orientation={orientation}
        >
          {screen === 'home' ? <HomeScreen onNavigate={setScreen} /> : null}

          {screen === 'play' ? <PlayScreen onNavigate={setScreen} onBack={() => setScreen('home')} /> : null}

          {screen === 'new-game' ? (
            <NewGameScreen onBack={() => setScreen('play')} onStarted={startGame} />
          ) : null}

          {screen === 'load-game' ? (
            <LoadGameScreen onBack={() => setScreen('play')} onOpened={openGame} />
          ) : null}

          {screen === 'game' && game !== null ? (
            <GameScreen game={game} onChange={setGame} onBack={() => setScreen('play')} />
          ) : null}

          {screen === 'how-to-play' ? <HowToPlayScreen onBack={() => setScreen('home')} /> : null}

          {screen === 'statistics' ? <StatisticsScreen onBack={() => setScreen('home')} /> : null}

          {screen === 'options' ? (
            <OptionsScreen settings={settings} onUpdate={update} onBack={() => setScreen('home')} />
          ) : null}
        </main>
      </PreviewFrame>

      {tutorialOpen ? <Tutorial onClose={closeTutorial} /> : null}
    </div>
    </TextProvider>
  )
}
