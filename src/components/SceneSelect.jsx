import React, { useState } from 'react'
import { SCENES } from '../data/scenes'
import { getLevel } from '../store/gameStore'
import './SceneSelect.css'

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', desc: 'Patient & helpful' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Natural flow' },
  { id: 'advanced', label: 'Advanced', desc: 'No mercy' },
]

const CULTURE_TILES = [
  { emoji: '🏟️', label: 'El Monumental',   color: '#cc0020', img: 'https://upload.wikimedia.org/wikipedia/commons/5/54/RiverPlateStadium.jpg' },
  { emoji: '⚽',  label: 'Messi',            color: '#1a4a8a', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Messi_vs_Nigeria_2018.jpg' },
  { emoji: '🏆',  label: 'Maradona',         color: '#8a6200', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Maradona-Mundial_86_vs_Inglaterra_2.jpg' },
  { emoji: '💧',  label: 'Iguazú',           color: '#1a5a44', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/IguazuArgentina.jpg' },
  { emoji: '🏔️', label: 'Bariloche',        color: '#2a4a6a', img: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Bariloche_panorama_2.jpg' },
  { emoji: '🥩',  label: 'Asado',            color: '#7a2200', img: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Asado1.jpg' },
  { emoji: '🧉',  label: 'Mate',             color: '#2a4a1a', img: null },
  { emoji: '🍾',  label: 'Fernet',           color: '#0a1a0a', img: null },
  { emoji: '🥛',  label: 'Dulce de Leche',   color: '#7a4a10', img: null },
  { emoji: '🎶',  label: 'Tango',            color: '#5a0a18', img: null },
  { emoji: '🥟',  label: 'Empanadas',        color: '#6a3a10', img: null },
  { emoji: '🌆',  label: 'Buenos Aires',     color: '#1a2a4a', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Buenos_Aires_Aerial.JPG' },
]

function CultureTile({ emoji, label, color, img }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = img && !imgFailed
  return (
    <div
      className="culture-tile"
      style={{ background: showImg ? undefined : `linear-gradient(160deg, ${color}cc, ${color}55)` }}
    >
      {showImg && (
        <img
          src={img}
          alt={label}
          className="culture-tile-img"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="culture-tile-overlay" />
      <div className="culture-tile-content">
        <span className="culture-tile-emoji">{emoji}</span>
        <span className="culture-tile-label">{label}</span>
      </div>
    </div>
  )
}

function CultureStrip() {
  const doubled = [...CULTURE_TILES, ...CULTURE_TILES]
  return (
    <div className="culture-strip-wrap">
      <div className="culture-strip-track">
        {doubled.map((t, i) => (
          <CultureTile key={i} {...t} />
        ))}
      </div>
    </div>
  )
}

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

      <CultureStrip />

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
