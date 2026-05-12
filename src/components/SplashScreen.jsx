import React, { useEffect, useRef, useState } from 'react'
import './SplashScreen.css'

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

function Tile({ emoji, label, color, img }) {
  const [failed, setFailed] = useState(false)
  const show = img && !failed
  return (
    <div className="sp-tile" style={{ background: show ? undefined : `linear-gradient(160deg,${color}cc,${color}44)` }}>
      {show && <img src={img} alt={label} className="sp-tile-img" onError={() => setFailed(true)} />}
      <div className="sp-tile-overlay" />
      <div className="sp-tile-content">
        <span className="sp-tile-emoji">{emoji}</span>
        <span className="sp-tile-label">{label}</span>
      </div>
    </div>
  )
}

export default function SplashScreen({ onEnter }) {
  const audioRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = () => {
    const audio = audioRef.current
    if (audio) {
      let v = audio.volume
      const fade = setInterval(() => {
        v = Math.max(0, v - 0.05)
        audio.volume = v
        if (v <= 0) { audio.pause(); clearInterval(fade) }
      }, 60)
    }
    onEnter()
  }

  const handlePlay = () => {
    const audio = new Audio('/intro.mp4')
    audio.volume = 0
    audioRef.current = audio
    audio.play().catch(() => {})
    let v = 0
    const fade = setInterval(() => {
      v = Math.min(0.72, v + 0.025)
      audio.volume = v
      if (v >= 0.72) clearInterval(fade)
    }, 60)
  }

  const doubled = [...CULTURE_TILES, ...CULTURE_TILES]

  return (
    <div className={`splash ${ready ? 'splash-in' : ''}`}>
      <div className="splash-bg" />

      <div className="splash-stars">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="splash-star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            animationDelay: `${Math.random() * 4}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }} />
        ))}
      </div>

      <div className="splash-center">
        <div className="splash-flag">🇦🇷</div>
        <div className="splash-title">ARGENTINIZADO</div>
        <div className="splash-sub">Aprendé el castellano porteño</div>
      </div>

      <div className="splash-strip-wrap">
        <div className="splash-strip-track">
          {doubled.map((t, i) => <Tile key={i} {...t} />)}
        </div>
      </div>

      <div className="splash-bottom">
        <button
          className="splash-enter-btn"
          onClick={() => { handlePlay(); handleEnter() }}
        >
          ENTRAR
        </button>
        <div className="splash-hint">Usá auriculares · Audio on</div>
      </div>
    </div>
  )
}
