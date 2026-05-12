import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getCharacterReply } from '../services/claudeService'
import { speak, stopSpeaking } from '../services/elevenLabsService'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import AnimatedCharacter from './AnimatedCharacter'
import { DIFFICULTY_MODIFIERS } from '../data/scenes'
import './ConversationScene.css'

const MAX_TURNS = 8
const SURVIVAL_MISTAKES_ALLOWED = 3

function sanitize(text) {
  return text.replace(/—/g, ',').replace(/–/g, '-')
}

function SoundWave({ color }) {
  return (
    <div className="sound-wave">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{ '--delay': `${i * 0.07}s`, '--accent': color }}
        />
      ))}
    </div>
  )
}

function SceneAtmosphere({ sceneId }) {
  const baseId = sceneId.startsWith('monumental') ? 'monumental' : sceneId
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = []

    if (baseId === 'monumental') {
      // Stars
      for (let i = 0; i < 55; i++) {
        particles.push({ type: 'star', x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.48, r: 0.4 + Math.random() * 1.1, twinkle: Math.random() * Math.PI * 2, tSpeed: 0.8 + Math.random() * 2 })
      }
      // People
      for (let i = 0; i < 34; i++) {
        const depth = 0.1 + Math.random() * 0.9
        particles.push({ type: 'person', x: Math.random() * canvas.width, y: canvas.height * (0.62 + depth * 0.13), h: 20 + depth * 36, scarf: Math.random() > 0.45, scarfColor: Math.random() > 0.5 ? '#cc0020' : '#ffffff', bob: Math.random() * Math.PI * 2, speed: (0.10 + Math.random() * 0.20) * (Math.random() > 0.5 ? 1 : -1) })
      }
      // Confetti
      for (let i = 0; i < 22; i++) {
        particles.push({ type: 'confetti', x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.65, cw: 3 + Math.random() * 5, ch: 2 + Math.random() * 3, color: Math.random() > 0.5 ? '#E8052A' : '#ffffff', speed: 0.3 + Math.random() * 0.7, drift: (Math.random() - 0.5) * 0.5, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04 })
      }
    } else if (sceneId === 'parrilla') {
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          r: 1 + Math.random() * 2.5,
          speed: 0.5 + Math.random() * 1.2,
          drift: (Math.random() - 0.5) * 0.6,
          alpha: 0.4 + Math.random() * 0.6,
          color: Math.random() > 0.5 ? '#ff6b1a' : '#ffd700',
        })
      }
    } else if (sceneId === 'taxi') {
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          len: 8 + Math.random() * 18,
          speed: 6 + Math.random() * 8,
          alpha: 0.1 + Math.random() * 0.25,
        })
      }
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      if (baseId === 'monumental') {
        const W = canvas.width, H = canvas.height

        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, H)
        sky.addColorStop(0, '#01000b')
        sky.addColorStop(0.55, '#0e001a')
        sky.addColorStop(1, '#1c0030')
        ctx.fillStyle = sky
        ctx.fillRect(0, 0, W, H)

        // Warm glow from stadium lights behind
        const backGlow = ctx.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, W * 0.6)
        backGlow.addColorStop(0, 'rgba(255,180,60,0.14)')
        backGlow.addColorStop(0.4, 'rgba(200,20,30,0.07)')
        backGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = backGlow
        ctx.fillRect(0, 0, W, H)

        // Stars
        particles.filter(p => p.type === 'star').forEach(p => {
          const a = 0.35 + 0.35 * Math.sin(t * p.tSpeed + p.twinkle)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${a})`
          ctx.fill()
        })

        // Floodlight beams from towers
        ;[[W * 0.14, H * 0.11], [W * 0.86, H * 0.11]].forEach(([bx, by], i) => {
          const a = 0.07 + Math.sin(t * 0.2 + i * 2) * 0.02
          const beam = ctx.createRadialGradient(bx, by, 0, bx, by, H * 0.75)
          beam.addColorStop(0, `rgba(255,240,200,${a})`)
          beam.addColorStop(1, 'rgba(255,240,200,0)')
          ctx.fillStyle = beam
          ctx.fillRect(0, 0, W, H)
        })

        // Stadium body — trapezoid (wider base = perspective of looking up)
        const sTop = H * 0.17, sBot = H * 0.62
        const sL = W * 0.04, sR = W * 0.96
        const sTL = W * 0.10, sTR = W * 0.90
        ctx.fillStyle = '#07000f'
        ctx.beginPath()
        ctx.moveTo(sL, sBot); ctx.lineTo(sR, sBot)
        ctx.lineTo(sTR, sTop); ctx.lineTo(sTL, sTop)
        ctx.closePath()
        ctx.fill()

        // Rim lights along top of stadium
        const rim = ctx.createLinearGradient(0, sTop - 3, 0, sTop + 14)
        rim.addColorStop(0, 'rgba(255,230,130,0.95)')
        rim.addColorStop(1, 'rgba(255,230,130,0)')
        ctx.fillStyle = rim
        ctx.fillRect(sTL, sTop - 3, sTR - sTL, 17)

        // Floodlight towers above rim
        ;[sTL + 12, sTL + (sTR - sTL) * 0.34, sTL + (sTR - sTL) * 0.66, sTR - 12].forEach(tx => {
          ctx.fillStyle = '#151528'
          ctx.fillRect(tx - 2, sTop - 42, 4, 42)
          ctx.fillStyle = 'rgba(255,225,120,0.92)'
          ctx.fillRect(tx - 7, sTop - 46, 14, 6)
          const tg = ctx.createRadialGradient(tx, sTop - 43, 0, tx, sTop - 43, 32)
          tg.addColorStop(0, 'rgba(255,220,100,0.22)')
          tg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = tg
          ctx.fillRect(0, 0, W, H)
        })

        // Arched gate lights on facade
        for (let i = 0; i < 9; i++) {
          const gx = sTL + ((sTR - sTL) / 10) * (i + 1)
          const gy = sTop + 18
          const ga = 0.09 + Math.sin(t * 0.4 + i * 0.7) * 0.03
          ctx.fillStyle = `rgba(255,190,80,${ga})`
          ctx.beginPath()
          ctx.arc(gx, gy + 7, 6, Math.PI, 0)
          ctx.rect(gx - 6, gy + 7, 12, 10)
          ctx.fill()
        }

        // Red band (River Plate colours on facade)
        ctx.fillStyle = 'rgba(210,0,20,0.20)'
        ctx.fillRect(sTL, sTop + 32, sTR - sTL, 13)
        ctx.fillStyle = 'rgba(255,255,255,0.10)'
        ctx.fillRect(sTL, sTop + 47, sTR - sTL, 8)

        // Ground / plaza
        const gnd = ctx.createLinearGradient(0, sBot, 0, H)
        gnd.addColorStop(0, '#0e0009')
        gnd.addColorStop(1, '#040003')
        ctx.fillStyle = gnd
        ctx.fillRect(0, sBot, W, H - sBot)

        // Warm glow pools under stalls
        ;[[W * 0.17, H * 0.75], [W * 0.81, H * 0.75]].forEach(([gx, gy]) => {
          const sg = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.18)
          sg.addColorStop(0, 'rgba(255,140,30,0.22)')
          sg.addColorStop(1, 'rgba(255,140,30,0)')
          ctx.fillStyle = sg
          ctx.fillRect(0, 0, W, H)
        })

        // Food stalls
        const drawStall = (cx, sy, sw, sh, label) => {
          // Awning
          ctx.fillStyle = '#6e0010'
          ctx.beginPath()
          ctx.moveTo(cx - sw / 2 - 10, sy)
          ctx.lineTo(cx + sw / 2 + 10, sy)
          ctx.lineTo(cx + sw / 2, sy + 18)
          ctx.lineTo(cx - sw / 2, sy + 18)
          ctx.closePath()
          ctx.fill()
          for (let s = 0; s < 5; s++) {
            ctx.fillStyle = 'rgba(255,255,255,0.11)'
            ctx.fillRect(cx - sw / 2 + (sw / 5) * s, sy, sw / 10, 18)
          }
          // Body
          ctx.fillStyle = '#150700'
          ctx.fillRect(cx - sw / 2, sy + 18, sw, sh)
          // Interior glow
          const ig = ctx.createRadialGradient(cx, sy + 18 + sh / 2, 0, cx, sy + 18 + sh / 2, sw * 0.55)
          ig.addColorStop(0, 'rgba(255,140,30,0.42)')
          ig.addColorStop(1, 'rgba(255,140,30,0)')
          ctx.fillStyle = ig
          ctx.fillRect(cx - sw / 2, sy + 18, sw, sh)
          // Counter
          ctx.fillStyle = '#2a1000'
          ctx.fillRect(cx - sw / 2, sy + 18 + sh - 18, sw, 18)
          // Label
          ctx.save()
          ctx.fillStyle = 'rgba(255,210,140,0.90)'
          ctx.font = `bold ${Math.max(9, Math.floor(sw * 0.13))}px sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(label, cx, sy + 18 + sh * 0.52 + 4)
          ctx.restore()
          // Smoke
          for (let s = 0; s < 3; s++) {
            const smx = cx - sw / 4 + (sw / 4) * s
            const smy = sy - 8 - Math.sin(t * 0.8 + s * 2 + cx) * 7
            ctx.beginPath()
            ctx.arc(smx, smy, 8 + s * 4, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(200,180,160,${0.07 + Math.sin(t * 0.5 + s) * 0.03})`
            ctx.fill()
          }
        }

        const sW = Math.min(W * 0.15, 112)
        const sH = H * 0.16
        const sY = sBot + (H - sBot) * 0.08
        drawStall(W * 0.17, sY, sW, sH, 'CHORIPAN')
        drawStall(W * 0.81, sY, sW, sH, 'EMPANADAS')

        // People silhouettes
        particles.filter(p => p.type === 'person').forEach(p => {
          p.x += p.speed
          if (p.x > W + 25) p.x = -25
          if (p.x < -25) p.x = W + 25
          const bob = Math.sin(t * 2.5 + p.bob) * 1.2
          const da = Math.min(0.92, 0.42 + ((p.y - H * 0.62) / (H * 0.15)) * 0.5)
          ctx.fillStyle = `rgba(6,0,4,${da})`
          const bw = p.h * 0.30
          ctx.fillRect(p.x - bw / 2, p.y - p.h * 0.62 + bob, bw, p.h * 0.62)
          ctx.beginPath()
          ctx.arc(p.x, p.y - p.h * 0.78 + bob, p.h * 0.14, 0, Math.PI * 2)
          ctx.fill()
          if (p.scarf) {
            ctx.fillStyle = p.scarfColor
            ctx.globalAlpha = da * 0.85
            ctx.fillRect(p.x - bw / 2 - 3, p.y - p.h * 0.65 + bob, bw + 6, 3)
            ctx.globalAlpha = 1
          }
        })

        // Confetti drifting
        particles.filter(p => p.type === 'confetti').forEach(p => {
          p.y += p.speed
          p.x += p.drift + Math.sin(t * 0.4 + p.y * 0.012) * 0.25
          p.rot += p.rotSpeed
          if (p.y > H + 12) { p.y = -12; p.x = Math.random() * W }
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.globalAlpha = 0.6
          ctx.fillStyle = p.color
          ctx.fillRect(-p.cw / 2, -p.ch / 2, p.cw, p.ch)
          ctx.restore()
        })

        // Sweeping floodlight overlay
        const sweep = Math.sin(t * 0.25) * 0.35 + 0.5
        const swGrd = ctx.createRadialGradient(W * sweep, 0, 0, W * sweep, 0, H * 0.9)
        swGrd.addColorStop(0, 'rgba(255,220,150,0.06)')
        swGrd.addColorStop(1, 'rgba(255,220,150,0)')
        ctx.fillStyle = swGrd
        ctx.fillRect(0, 0, W, H)

      } else if (baseId === 'parrilla') {
        const pulse = 0.12 + Math.sin(t * 2.1) * 0.04
        const grd = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height, 0,
          canvas.width * 0.5, canvas.height, canvas.height * 0.9
        )
        grd.addColorStop(0, `rgba(255,80,0,${pulse})`)
        grd.addColorStop(0.4, `rgba(200,40,0,${pulse * 0.5})`)
        grd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        particles.forEach(p => {
          p.y -= p.speed
          p.x += p.drift
          if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 3 + p.x))
          ctx.fill()
          ctx.globalAlpha = 1
        })
      } else if (baseId === 'taxi') {
        const bokeh = [
          { x: 0.15, y: 0.3, r: 40, c: 'rgba(255,200,80,' },
          { x: 0.7,  y: 0.4, r: 30, c: 'rgba(80,180,255,' },
          { x: 0.4,  y: 0.25,r: 25, c: 'rgba(255,100,80,' },
          { x: 0.85, y: 0.5, r: 35, c: 'rgba(255,220,100,' },
          { x: 0.25, y: 0.55,r: 20, c: 'rgba(150,255,150,' },
        ]
        bokeh.forEach((b, i) => {
          const a = 0.06 + Math.sin(t * 0.8 + i) * 0.03
          const grd = ctx.createRadialGradient(
            canvas.width * b.x, canvas.height * b.y, 0,
            canvas.width * b.x, canvas.height * b.y, b.r
          )
          grd.addColorStop(0, b.c + a + ')')
          grd.addColorStop(1, b.c + '0)')
          ctx.fillStyle = grd
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        })

        ctx.strokeStyle = 'rgba(170,210,255,0.25)'
        ctx.lineWidth = 1
        particles.forEach(p => {
          p.y += p.speed
          if (p.y > canvas.height + 20) p.y = -20
          ctx.globalAlpha = p.alpha
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - 1, p.y + p.len)
          ctx.stroke()
        })
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [sceneId])

  return <canvas ref={canvasRef} className="scene-canvas" />
}

function CinematicIntro({ scene, onEnter }) {
  return (
    <div className="cinematic-overlay">
      <div className="cin-city">BUENOS AIRES</div>
      <div className="cin-stadium">EL MONUMENTAL</div>
      <div className="cin-subtitle">{scene.subtitle}</div>
      <div className="cin-char">
        <div className="cin-char-name">{scene.character.name}</div>
        <div className="cin-char-role">{scene.character.role}</div>
      </div>
      <button className="cin-enter-btn" onClick={onEnter}>
        ENTRAR
      </button>
    </div>
  )
}

export default function ConversationScene({ scene, difficulty, onEnd }) {
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [charSpeaking, setCharSpeaking] = useState(false)
  const [userTurn, setUserTurn] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [mistakeCount, setMistakeCount] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState('')
  const historyRef = useRef([])
  const turnCount = useRef(0)
  const endingRef = useRef(false)
  const messagesEndRef = useRef(null)

  const isMonumental = scene.id.startsWith('monumental')
  const ambientAudio = useAmbientAudio(scene.id)
  const { listening, startListening, stopListening, error: micError } = useSpeechRecognition()

  const effectivePrompt = scene.systemPrompt + (DIFFICULTY_MODIFIERS[difficulty] || '')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }])
    historyRef.current.push({ role, content })
  }, [])

  const characterSpeak = useCallback(async (text) => {
    const clean = sanitize(text)
    addMessage('assistant', clean)
    setCharSpeaking(true)
    setUserTurn(false)
    setStatusText('')
    await speak(clean, scene.character.voiceId, null, () => setCharSpeaking(false), 'es-AR')
  }, [scene, addMessage])

  const finishConversation = useCallback(() => {
    if (endingRef.current) return
    endingRef.current = true
    stopSpeaking()
    stopListening()
    ambientAudio.stop()
    onEnd(historyRef.current)
  }, [onEnd, stopListening, ambientAudio])

  const handleUserSpeech = useCallback(async (text) => {
    if (!text.trim() || endingRef.current) return
    setLiveTranscript('')
    addMessage('user', text)
    setUserTurn(false)
    turnCount.current += 1

    const isMistake = !/[áéíóúüñ¿¡vosché]|vos|che|bolud|pibe|labu|morf/i.test(text)
    if (isMistake) {
      const newCount = mistakeCount + 1
      setMistakeCount(newCount)
      if (newCount > SURVIVAL_MISTAKES_ALLOWED) {
        setStatusText('Se rompio la conversacion!')
        setTimeout(finishConversation, 2000)
        return
      }
    }

    if (turnCount.current >= MAX_TURNS) {
      setTimeout(finishConversation, 500)
      return
    }

    setStatusText('Thinking...')
    try {
      const reply = await getCharacterReply(effectivePrompt, historyRef.current)
      await characterSpeak(reply)
      setUserTurn(true)
      setStatusText('Your turn')
    } catch (e) {
      console.error('Claude error:', e)
      setStatusText('Connection issue - try again')
      setUserTurn(true)
    }
  }, [addMessage, mistakeCount, effectivePrompt, characterSpeak, finishConversation])

  const handleStart = async () => {
    setStarted(true)
    ambientAudio.start()
    await characterSpeak(scene.openingLine)
    setUserTurn(true)
    setStatusText('Your turn')
  }

  useEffect(() => {
    return () => { stopSpeaking(); stopListening(); ambientAudio.stop() }
  }, [])

  const handleMicPress = () => {
    if (!userTurn || charSpeaking) return
    setStatusText('Listening...')
    setLiveTranscript('')
    startListening(
      (finalText) => handleUserSpeech(finalText),
      (interim) => setLiveTranscript(interim)
    )
  }

  const survivalPct = Math.max(0, ((SURVIVAL_MISTAKES_ALLOWED - mistakeCount) / SURVIVAL_MISTAKES_ALLOWED) * 100)
  const survivalColor = survivalPct > 60 ? '#4ade80' : survivalPct > 30 ? '#facc15' : '#f87171'

  return (
    <div className="scene" style={{ '--accent': scene.accentColor }}>
      <div className="scene-bg" style={{ background: scene.bgGradient }} />
      <SceneAtmosphere sceneId={scene.id} />
      <div className="scene-vignette" />

      {!started && isMonumental && (
        <CinematicIntro scene={scene} onEnter={handleStart} />
      )}

      {!started && !isMonumental && (
        <div className="start-overlay" onClick={handleStart}>
          <div className="start-scene-name">{scene.name}</div>
          <div className="start-location">{scene.subtitle}</div>
          <div className="start-char-avatar">{scene.character.avatar}</div>
          <div className="start-char-name">{scene.character.name}</div>
          <div className="start-char-role">{scene.character.role}</div>
          <div className="start-tap-btn">
            <span>Tap to enter</span>
          </div>
        </div>
      )}

      <div className="scene-header">
        <button className="btn-back" onClick={finishConversation}>Exit</button>
        <div className="scene-title-block">
          <span className="scene-char-name">{scene.character.name}</span>
          <span className="scene-location">{scene.subtitle}</span>
        </div>
        <div className="scene-turns">{MAX_TURNS - turnCount.current} turns</div>
      </div>

      <div className="survival-bar-wrap">
        <div className="survival-bar" style={{ width: `${survivalPct}%`, background: survivalColor }} />
      </div>

      <div className="character-stage">
        <div className="char-halo" style={{ background: `radial-gradient(circle, ${scene.accentColor}55 0%, transparent 70%)` }} />
        <div className={`char-figure ${charSpeaking ? 'char-speaking' : ''}`}>
          <AnimatedCharacter sceneId={scene.id} speaking={charSpeaking} size={190} />
        </div>
        <div className="char-label">
          <span className="char-label-name">{scene.character.name}</span>
          <span className="char-label-role">{scene.character.role}</span>
        </div>
        {charSpeaking && <SoundWave color={scene.accentColor} />}
      </div>

      <div className="messages-wrap">
        <div className="messages">
          {messages.map(m => (
            <div key={m.id} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-char'}`}>
              {m.role === 'assistant' && <span className="bubble-avatar">{scene.character.avatar}</span>}
              <div className="bubble-text">{m.content}</div>
            </div>
          ))}
          {liveTranscript && (
            <div className="bubble bubble-user bubble-live">
              <div className="bubble-text">{liveTranscript}<span className="cursor">|</span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="scene-controls">
        <div className="status-text">{micError || statusText}</div>
        <button
          className={`mic-btn ${listening ? 'listening' : ''} ${!userTurn || charSpeaking ? 'disabled' : ''}`}
          onClick={handleMicPress}
          disabled={!userTurn || charSpeaking || listening}
        >
          <span className="mic-icon">{listening ? '⏺' : '🎤'}</span>
          {listening && <span className="mic-pulse" />}
        </button>
        <div className="controls-row">
          {listening && <button className="btn-secondary" onClick={stopListening}>Done</button>}
          {userTurn && !listening && <button className="btn-secondary" onClick={finishConversation}>End scene</button>}
        </div>
      </div>
    </div>
  )
}
