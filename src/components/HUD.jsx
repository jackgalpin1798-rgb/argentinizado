import React from 'react'
import { getLevel, LEVELS } from '../store/gameStore'
import './HUD.css'

export default function HUD({ xp, streak }) {
  const level = getLevel(xp)
  const nextLevel = LEVELS[level.index + 1]
  const progress = nextLevel
    ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100
    : 100

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-level">{level.name}</div>
        <div className="hud-xp-bar">
          <div className="hud-xp-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="hud-xp-label">{xp} XP</div>
      </div>
      {streak > 0 && (
        <div className="hud-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{streak}</span>
        </div>
      )}
    </div>
  )
}
