import React from 'react'
import { SCENES } from '../data/scenes'
import { getLevel } from '../store/gameStore'
import './SceneSelect.css'

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Patient & helpful' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Natural flow' },
  { id: 'advanced', label: 'Advanced', desc: 'No mercy' },
]

export default function SceneSelect({ xp, streak, onSelect, difficulty, onDifficulty }) {
  const level = getLevel(xp)

  return (
    <div className="scene-select">
      <div className="scene-select-hero">
        <div className="hero-flag">🇦🇷</div>
        <h1 className="hero-title">Argentinizado</h1>
        <p className="hero-sub">Learn Argentine Castellano through real conversations</p>
        <div className="hero-badge">{level.name} · {xp} XP{streak > 0 ? ` · 🔥${streak}` : ''}</div>
      </div>

      <div className="difficulty-bar">
        <span className="diff-label">Difficulty</span>
        {DIFFICULTIES.map(d => (
          <button
            key={d.id}
            className={`diff-btn ${difficulty === d.id ? 'diff-active' : ''}`}
            onClick={() => onDifficulty(d.id)}
          >
            {d.label}
            <span className="diff-desc">{d.desc}</span>
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
              <div className="scene-card-glow" style={{ background: scene.accentColor }} />
              <div className="scene-card-avatar">{scene.character.avatar}</div>
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
