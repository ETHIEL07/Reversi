import { useEffect, useState } from 'react'
import { getHistory } from '../api/games'
import { useT } from '../i18n/useT'
import type { GameState, MoveHistoryEntry } from '../types/game'

type TimelineProps = {
  game: GameState
  onPick: (moveNumber: number) => void
}

const SLOTS = 64

/**
 * The whole game on one rail, one notch per move up to the sixty-four a board can hold.
 * Clicking a notch rewinds the game to that point. Hidden until the tool is opened.
 */
export function Timeline({ game, onPick }: TimelineProps) {
  const t = useT()
  const [history, setHistory] = useState<MoveHistoryEntry[]>([])

  useEffect(() => {
    const controller = new AbortController()

    getHistory(game.id)
      .then((entries) => {
        if (!controller.signal.aborted) {
          setHistory(entries)
        }
      })
      .catch((cause: unknown) => console.error('History unavailable', cause))

    return () => controller.abort()
  }, [game.id, game.moveCount])

  return (
    <div className="timeline" data-testid="game-view-timeline">
      <div className="timeline__head">
        <p className="eyebrow">{t.game.timelinePanel.title}</p>
        <p className="timeline__count" data-testid="game-text-timeline-count">
          {t.game.timelinePanel.moves(game.moveCount)}
        </p>
      </div>

      <div className="timeline__rail" role="group" aria-label={t.game.timelinePanel.title}>
        <button
          type="button"
          className={game.moveCount === 0 ? 'timeline__slot timeline__slot--now' : 'timeline__slot timeline__slot--played'}
          title={t.game.timelinePanel.start}
          aria-label={t.game.timelinePanel.start}
          data-testid="timeline-btn-0"
          onClick={() => onPick(0)}
        />

        {Array.from({ length: SLOTS }, (_, index) => {
          const number = index + 1
          const entry = history[index]
          const played = number <= game.moveCount
          const classes = ['timeline__slot']

          if (played) {
            classes.push('timeline__slot--played')
            classes.push(entry?.player === 'Black' ? 'timeline__slot--black' : 'timeline__slot--white')
          }

          if (entry?.isPass === true) {
            classes.push('timeline__slot--pass')
          }

          if (number === game.moveCount) {
            classes.push('timeline__slot--now')
          }

          const label = entry === undefined ? `${number}` : `${number} · ${entry.notation}`

          return (
            <button
              key={number}
              type="button"
              className={classes.join(' ')}
              title={label}
              aria-label={label}
              data-testid={`timeline-btn-${number}`}
              disabled={!played}
              onClick={() => onPick(number)}
            />
          )
        })}
      </div>

      <p className="timeline__hint">{t.game.timelinePanel.hint}</p>
    </div>
  )
}
