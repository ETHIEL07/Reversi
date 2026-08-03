import { useState } from 'react'
import { BuildInfoBadge } from './components/BuildInfoBadge'
import { PreviewFrame } from './components/PreviewFrame'
import { ViewportSwitch } from './components/ViewportSwitch'
import { useViewport } from './hooks/useViewport'
import { Logo } from './components/Logo'
import { HomeScreen } from './screens/HomeScreen'
import { HowToPlayScreen } from './screens/HowToPlayScreen'
import { NewGameScreen } from './screens/NewGameScreen'
import { GameScreen } from './screens/GameScreen'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { DEVICE_PRESETS, type PreviewMode } from './types/layout'
import type { GameState } from './types/game'
import type { Screen } from './types/navigation'
import './App.css'
import './styles/layout.css'
import './styles/board.css'
import './styles/screens.css'
import './styles/avatars.css'
import './styles/manual.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [game, setGame] = useState<GameState | null>(null)
  const [preview, setPreview] = useState<PreviewMode>('auto')

  const measured = useViewport()

  // Inside a preview frame the media queries do not see the frame, so the layout is driven
  // by these classes and never by @media alone.
  const format = preview === 'auto' ? measured.format : DEVICE_PRESETS[preview].format
  const orientation = preview === 'auto' ? measured.orientation : DEVICE_PRESETS[preview].orientation

  function startGame(started: GameState) {
    setGame(started)
    setScreen('game')
  }

  return (
    <div className="app" data-testid="app-view-container">
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

          {screen === 'new-game' ? (
            <NewGameScreen onBack={() => setScreen('home')} onStarted={startGame} />
          ) : null}

          {screen === 'game' && game !== null ? (
            <GameScreen game={game} onChange={setGame} onBack={() => setScreen('new-game')} />
          ) : null}

          {screen === 'how-to-play' ? <HowToPlayScreen onBack={() => setScreen('home')} /> : null}

          {screen === 'statistics' ? (
            <PlaceholderScreen title="Statistiques" scope="statistics" onBack={() => setScreen('home')} />
          ) : null}

          {screen === 'options' ? (
            <PlaceholderScreen title="Options" scope="options" onBack={() => setScreen('home')} />
          ) : null}
        </main>
      </PreviewFrame>
    </div>
  )
}
