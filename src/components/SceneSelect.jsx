import React from 'react'
import { SCENES } from '../data/scenes'
import { getLevel } from '../store/gameStore'
import './SceneSelect.css'

const DIFFICULTIES = [
  { id: 'easy',         label: 'Easy',         desc: 'Patient & helpful' },
  { id: 'intermediate', label: 'Intermediate',  desc: 'Natural flow'     },
  { id: 'advanced',     label: 'Advanced',      desc: 'No mercy'         },
]

export default function SceneSelect({ xp, streak, onSelect, difficulty, onDifficulty }) {
  const level = getLevel(xp)

  return (
    <div className="scene-select">

      <div className="ss-topbar">
        <h1 className="ss-wordmark">Argentinizado</h1>
        <div className="ss-meta">
          {level.name} · {xp} XP{streak > 0 ? ` · ${streak} streak` : ''}
        </div>
      </div>

      <div className="ss-tabs">
        {DIFFICULTIES.map(d => (
          <button
            key={d.id}
            className={`ss-tab ${difficulty === d.id ? 'ss-tab-active' : ''}`}
            onClick={() => onDifficulty(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="scenes-grid">
        {Object.values(SCENES).map(scene => {
          const locked = xp < scene.unlockXP
          return (
            <button
              key={scene.id}
              className={`scene-card ${locked ? 'locked' : ''}`}
              onClick={() => !locked && onSelect(scene.id)}
              disabled={locked}
              style={{ '--accent': scene.accentColor }}
            >
              <div className="scene-card-bg" style={{ background: scene.bgGradient }} />
              {scene.bgPhoto && (
                <div className="scene-card-photo" style={{ backgroundImage: `url(${scene.bgPhoto})` }} />
              )}
              <div className="scene-card-glow" style={{ background: scene.accentColor }} />
              <div className="scene-card-info">
                <div className="scene-card-name">{scene.name}</div>
                <div className="scene-card-sub">{scene.subtitle}</div>
                <div className="scene-card-char">{scene.character.name} · {scene.character.role}</div>
              </div>
              {locked && (
                <div className="scene-lock">
                  <span className="lock-icon">🔒</span>
                  <span className="lock-xp">{scene.unlockXP} XP</span>
                </div>
              )}
              <div className="scene-xp-reward">+{scene.xpReward} XP</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
