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

const FEEDBACK_INSTRUCTION = '\n\nCOACHING: After your in-character response, add a new line starting with exactly "FEEDBACK:" followed by one coaching sentence in English for the learner. If they spoke good Argentine Spanish, say what was excellent. If they made an error (used English, said "tú" instead of "vos", wrong verb conjugation, unnatural phrasing), give a specific correction. One sentence only. Examples: "FEEDBACK: ¡Perfecto! Great use of voseo." or "FEEDBACK: Say \'vos tenés\' not \'tú tienes\' — Argentina uses voseo, not tuteo."'

function sanitize(text) {
  return text.replace(/—/g, ',').replace(/–/g, '-')
}

function extractFeedback(text) {
  const lines = text.split('\n')
  const fbIdx = lines.findIndex(l => /^FEEDBACK:/i.test(l.trim()))
  if (fbIdx === -1) return { clean: text.trim(), feedback: null }
  const feedback = lines[fbIdx].replace(/^FEEDBACK:\s*/i, '').trim()
  const clean = lines.slice(0, fbIdx).join('\n').trim()
  return { clean, feedback }
}

function FeedbackNote({ text }) {
  const isGood = /^(great|nice|perfect|excellent|¡perfecto|¡bien|nailed|spot.on)/i.test(text) || /!\s*$/.test(text)
  return (
    <div className={`feedback-note ${isGood ? 'feedback-note-good' : 'feedback-note-tip'}`}>
      {text}
    </div>
  )
}

function SoundWave({ color }) {
  return (
    <div className="sound-wave">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="wave-bar" style={{ '--delay': `${i * 0.07}s`, '--accent': color }} />
      ))}
    </div>
  )
}

function SceneAtmosphere({ sceneId, hasPhoto }) {
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
      for (let i = 0; i < 55; i++) {
        particles.push({ type: 'star', x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.48, r: 0.4 + Math.random() * 1.1, twinkle: Math.random() * Math.PI * 2, tSpeed: 0.8 + Math.random() * 2 })
      }
      for (let i = 0; i < 34; i++) {
        const depth = 0.1 + Math.random() * 0.9
        particles.push({ type: 'person', x: Math.random() * canvas.width, y: canvas.height * (0.72 + depth * 0.18), h: 18 + depth * 38, scarf: Math.random() > 0.45, scarfColor: Math.random() > 0.5 ? '#cc0020' : '#ffffff', bob: Math.random() * Math.PI * 2, speed: (0.10 + Math.random() * 0.20) * (Math.random() > 0.5 ? 1 : -1) })
      }
      for (let i = 0; i < 22; i++) {
        particles.push({ type: 'confetti', x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.65, cw: 3 + Math.random() * 5, ch: 2 + Math.random() * 3, color: Math.random() > 0.5 ? '#E8052A' : '#ffffff', speed: 0.3 + Math.random() * 0.7, drift: (Math.random() - 0.5) * 0.5, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04 })
      }
    } else if (sceneId === 'parrilla') {
      for (let i = 0; i < 60; i++) {
        particles.push({ x: Math.random() * canvas.width, y: canvas.height + Math.random() * 100, r: 1 + Math.random() * 2.5, speed: 0.5 + Math.random() * 1.2, drift: (Math.random() - 0.5) * 0.6, alpha: 0.4 + Math.random() * 0.6, color: Math.random() > 0.5 ? '#ff6b1a' : '#ffd700' })
      }
    } else if (sceneId === 'taxi') {
      for (let i = 0; i < 120; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, len: 8 + Math.random() * 18, speed: 6 + Math.random() * 8, alpha: 0.1 + Math.random() * 0.25 })
      }
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      if (baseId === 'monumental') {
        const W = canvas.width, H = canvas.height
        if (!hasPhoto) {
          const sky = ctx.createLinearGradient(0, 0, 0, H)
          sky.addColorStop(0, '#01000b')
          sky.addColorStop(1, '#1c0030')
          ctx.fillStyle = sky
          ctx.fillRect(0, 0, W, H)
        }
        particles.filter(p => p.type === 'star').forEach(p => {
          const a = 0.4 + 0.35 * Math.sin(t * p.tSpeed + p.twinkle)
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill()
        })
        const sweep = Math.sin(t * 0.22) * 0.38 + 0.5
        const swGrd = ctx.createRadialGradient(W * sweep, 0, 0, W * sweep, 0, H * 0.95)
        swGrd.addColorStop(0, 'rgba(255,230,160,0.10)'); swGrd.addColorStop(1, 'rgba(255,230,160,0)')
        ctx.fillStyle = swGrd; ctx.fillRect(0, 0, W, H)
        const sweep2 = Math.sin(t * 0.17 + 1.5) * 0.3 + 0.5
        const swGrd2 = ctx.createRadialGradient(W * sweep2, H * 0.1, 0, W * sweep2, H * 0.1, H * 0.85)
        swGrd2.addColorStop(0, 'rgba(255,210,120,0.07)'); swGrd2.addColorStop(1, 'rgba(255,210,120,0)')
        ctx.fillStyle = swGrd2; ctx.fillRect(0, 0, W, H)
        particles.filter(p => p.type === 'person').forEach(p => {
          p.x += p.speed
          if (p.x > W + 25) p.x = -25
          if (p.x < -25) p.x = W + 25
          const bob = Math.sin(t * 2.5 + p.bob) * 1.2
          const da = Math.min(0.88, 0.5 + ((p.y - H * 0.7) / (H * 0.2)) * 0.4)
          ctx.fillStyle = `rgba(4,0,2,${da})`
          const bw = p.h * 0.30
          ctx.fillRect(p.x - bw / 2, p.y - p.h * 0.62 + bob, bw, p.h * 0.62)
          ctx.beginPath(); ctx.arc(p.x, p.y - p.h * 0.78 + bob, p.h * 0.14, 0, Math.PI * 2); ctx.fill()
          if (p.scarf) {
            ctx.fillStyle = p.scarfColor; ctx.globalAlpha = da * 0.85
            ctx.fillRect(p.x - bw / 2 - 3, p.y - p.h * 0.65 + bob, bw + 6, 3); ctx.globalAlpha = 1
          }
        })
        particles.filter(p => p.type === 'confetti').forEach(p => {
          p.y += p.speed; p.x += p.drift + Math.sin(t * 0.4 + p.y * 0.012) * 0.25; p.rot += p.rotSpeed
          if (p.y > H + 12) { p.y = -12; p.x = Math.random() * W }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
          ctx.globalAlpha = 0.65; ctx.fillStyle = p.color
          ctx.fillRect(-p.cw / 2, -p.ch / 2, p.cw, p.ch); ctx.restore()
        })
      } else if (baseId === 'parrilla') {
        const pulse = 0.12 + Math.sin(t * 2.1) * 0.04
        const grd = ctx.createRadialGradient(canvas.width * 0.5, canvas.height, 0, canvas.width * 0.5, canvas.height, canvas.height * 0.9)
        grd.addColorStop(0, `rgba(255,80,0,${pulse})`); grd.addColorStop(0.4, `rgba(200,40,0,${pulse * 0.5})`); grd.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height)
        particles.forEach(p => {
          p.y -= p.speed; p.x += p.drift
          if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 3 + p.x)); ctx.fill(); ctx.globalAlpha = 1
        })
      } else if (baseId === 'taxi') {
        const bokeh = [
          { x: 0.15, y: 0.3, r: 40, c: 'rgba(255,200,80,' }, { x: 0.7, y: 0.4, r: 30, c: 'rgba(80,180,255,' },
          { x: 0.4, y: 0.25, r: 25, c: 'rgba(255,100,80,' }, { x: 0.85, y: 0.5, r: 35, c: 'rgba(255,220,100,' },
          { x: 0.25, y: 0.55, r: 20, c: 'rgba(150,255,150,' },
        ]
        bokeh.forEach((b, i) => {
          const a = 0.06 + Math.sin(t * 0.8 + i) * 0.03
          const grd = ctx.createRadialGradient(canvas.width * b.x, canvas.height * b.y, 0, canvas.width * b.x, canvas.height * b.y, b.r)
          grd.addColorStop(0, b.c + a + ')'); grd.addColorStop(1, b.c + '0)')
          ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height)
        })
        ctx.strokeStyle = 'rgba(170,210,255,0.25)'; ctx.lineWidth = 1
        particles.forEach(p => {
          p.y += p.speed
          if (p.y > canvas.height + 20) p.y = -20
          ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1, p.y + p.len); ctx.stroke()
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
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio('/intro.mp4')
    audio.volume = 0.75
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.src = '' }
  }, [])

  const handleEnter = () => {
    const audio = audioRef.current
    if (audio) {
      let vol = audio.volume
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.06)
        audio.volume = vol
        if (vol <= 0) { audio.pause(); clearInterval(fade) }
      }, 60)
    }
    onEnter()
  }

  return (
    <div className="cinematic-overlay">
      <div className="cin-city">BUENOS AIRES</div>
      <div className="cin-stadium">EL MONUMENTAL</div>
      <div className="cin-subtitle">{scene.subtitle}</div>
      <div className="cin-char">
        <div className="cin-char-name">{scene.character.name}</div>
        <div className="cin-char-role">{scene.character.role}</div>
      </div>
      <button className="cin-enter-btn" onClick={handleEnter}>ENTRAR</button>
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
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('arg_mic_onboarded'))
  const historyRef = useRef([])
  const turnCount = useRef(0)
  const endingRef = useRef(false)
  const messagesEndRef = useRef(null)

  const isMonumental = scene.id.startsWith('monumental')
  const ambientAudio = useAmbientAudio(scene.id)
  const { listening, startListening, stopListening, error: micError } = useSpeechRecognition()

  const effectivePrompt = scene.systemPrompt + (DIFFICULTY_MODIFIERS[difficulty] || '') + FEEDBACK_INSTRUCTION

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }])
    historyRef.current.push({ role, content })
  }, [])

  const addFeedbackNote = useCallback((text) => {
    setMessages(prev => [...prev, { role: 'feedback', content: text, id: Date.now() + Math.random() }])
  }, [])

  const characterSpeak = useCallback(async (text, giveFeedback = false) => {
    const { clean, feedback: fb } = extractFeedback(text)
    const sanitized = sanitize(clean)
    addMessage('assistant', sanitized)
    if (giveFeedback && fb) addFeedbackNote(fb)
    setCharSpeaking(true)
    setUserTurn(false)
    setStatusText('')
    await speak(sanitized, scene.character.voiceId, null, () => setCharSpeaking(false), 'es-AR')
  }, [scene, addMessage, addFeedbackNote])

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
      await characterSpeak(reply, true)
      setUserTurn(true)
      setStatusText('Your turn')
    } catch (e) {
      console.error('Claude error:', e)
      setStatusText('Connection issue — try again')
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

  const dismissOnboarding = () => {
    localStorage.setItem('arg_mic_onboarded', '1')
    setShowOnboarding(false)
  }

  const handleMicPress = () => {
    if (!userTurn || charSpeaking) return
    if (showOnboarding) dismissOnboarding()
    setStatusText('Listening...')
    setLiveTranscript('')
    startListening(
      (finalText) => handleUserSpeech(finalText),
      (interim) => setLiveTranscript(interim)
    )
  }

  const survivalDots = Array.from({ length: SURVIVAL_MISTAKES_ALLOWED }, (_, i) => i >= mistakeCount)

  return (
    <div className="scene" style={{ '--accent': scene.accentColor }}>
      <div className="scene-bg" style={{ background: scene.bgGradient }} />
      {scene.bgPhoto && (
        <div className="scene-photo" style={{ backgroundImage: `url(${scene.bgPhoto})` }} />
      )}
      {scene.bgPhoto && <div className="scene-photo-night" />}
      <SceneAtmosphere sceneId={scene.id} hasPhoto={!!scene.bgPhoto} />
      <div className="scene-vignette" />

      {!started && isMonumental && (
        <CinematicIntro scene={scene} onEnter={handleStart} />
      )}

      {!started && !isMonumental && (
        <div className="start-overlay" onClick={handleStart}>
          <div className="start-scene-name">{scene.name}</div>
          <div className="start-location">{scene.subtitle}</div>
          <div className="start-char-name">{scene.character.name}</div>
          <div className="start-char-role">{scene.character.role}</div>
          <div className="start-tap-btn"><span>Tap to enter</span></div>
        </div>
      )}

      <div className="scene-header">
        <button className="btn-back" onClick={finishConversation}>Exit</button>
        <div className="scene-title-block">
          <span className="scene-char-name">{scene.character.name}</span>
          <span className="scene-location">{scene.subtitle}</span>
        </div>
        <div className="scene-turns">{MAX_TURNS - turnCount.current} left</div>
      </div>

      <div className="survival-dots">
        {survivalDots.map((alive, i) => (
          <div key={i} className={`survival-dot ${alive ? 'survival-dot-alive' : 'survival-dot-lost'}`} />
        ))}
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
          {messages.map(m => {
            if (m.role === 'feedback') return <FeedbackNote key={m.id} text={m.content} />
            return (
              <div key={m.id} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-char'}`}>
                <div className="bubble-text">{m.content}</div>
              </div>
            )
          })}
          {liveTranscript && (
            <div className="bubble bubble-user bubble-live">
              <div className="bubble-text">{liveTranscript}<span className="cursor">|</span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="scene-controls">
        {showOnboarding && userTurn && (
          <div className="onboarding-hint">
            <span>Tap <strong>Hablar</strong> to speak — browser will request microphone access</span>
            <button className="onboarding-dismiss" onClick={dismissOnboarding}>Got it</button>
          </div>
        )}
        <div className="status-text">{micError || statusText}</div>
        <button
          className={`mic-btn ${listening ? 'mic-active' : ''} ${!userTurn || charSpeaking ? 'mic-disabled' : ''}`}
          onClick={handleMicPress}
          disabled={!userTurn || charSpeaking || listening}
        >
          {listening ? (
            <div className="mic-wave">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="mic-wave-bar" style={{ '--i': i }} />
              ))}
            </div>
          ) : (
            <span className="mic-label">Hablar</span>
          )}
        </button>
        <div className="controls-row">
          {listening && <button className="btn-secondary" onClick={stopListening}>Done</button>}
          {userTurn && !listening && <button className="btn-secondary" onClick={finishConversation}>End scene</button>}
        </div>
      </div>
    </div>
  )
}
