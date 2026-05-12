import React, { useRef, useEffect } from 'react'

const CHAR_STYLES = {
  facundo: { skin: '#c8855a', hair: '#160800', eye: '#2a1000', shirt: '#111', scarf: true, cap: true, puffa: true, fernet: true },
  mirta:   { skin: '#c8906a', hair: '#1a0a02', eye: '#2e1800', shirt: '#4a6080', scarf: false, earrings: true },
  ruben:   { skin: '#b07252', hair: '#888', eye: '#241200', shirt: '#444', scarf: false, mustache: true },
}

function drawCharacter(ctx, charKey, cx, cy, r, mouthOpen, blinkP) {
  const c = CHAR_STYLES[charKey] || CHAR_STYLES.facundo

  // Shadow under head
  const shadow = ctx.createRadialGradient(cx, cy + r * 1.05, 0, cx, cy + r * 1.05, r * 0.7)
  shadow.addColorStop(0, 'rgba(0,0,0,0.28)')
  shadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadow
  ctx.fillRect(cx - r, cy, r * 2, r)

  // Neck
  ctx.fillStyle = c.skin
  ctx.beginPath()
  ctx.rect(cx - r * 0.18, cy + r * 0.72, r * 0.36, r * 0.35)
  ctx.fill()

  // Puffa jacket (Facundo) or plain shirt
  if (c.puffa) {
    // Dark puffa jacket body
    const puffaGrad = ctx.createLinearGradient(cx, cy + r * 0.88, cx, cy + r * 1.4)
    puffaGrad.addColorStop(0, '#222')
    puffaGrad.addColorStop(1, '#111')
    ctx.fillStyle = puffaGrad
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, cy + r * 0.88)
    ctx.quadraticCurveTo(cx - r * 0.55, cy + r * 0.94, cx - r * 1.2, cy + r * 1.4)
    ctx.lineTo(cx + r * 1.2, cy + r * 1.4)
    ctx.quadraticCurveTo(cx + r * 0.55, cy + r * 0.94, cx + r * 0.2, cy + r * 0.88)
    ctx.closePath()
    ctx.fill()
    // Quilted horizontal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = r * 0.018
    for (let q = 0; q < 4; q++) {
      const qy = cy + r * (0.96 + q * 0.12)
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.9, qy)
      ctx.lineTo(cx + r * 0.9, qy)
      ctx.stroke()
    }
    // River Plate sash stripe on left shoulder
    ctx.fillStyle = '#E8052A'
    ctx.save()
    ctx.translate(cx - r * 0.55, cy + r * 0.88)
    ctx.rotate(0.5)
    ctx.fillRect(-r * 0.08, 0, r * 0.16, r * 0.55)
    ctx.restore()
    // Zip line down centre
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = r * 0.022
    ctx.beginPath()
    ctx.moveTo(cx, cy + r * 0.90)
    ctx.lineTo(cx, cy + r * 1.4)
    ctx.stroke()
  } else {
    const shirtGrad = ctx.createLinearGradient(cx, cy + r * 0.88, cx, cy + r * 1.4)
    shirtGrad.addColorStop(0, c.shirt)
    shirtGrad.addColorStop(1, c.shirt + 'bb')
    ctx.fillStyle = shirtGrad
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, cy + r * 0.88)
    ctx.quadraticCurveTo(cx - r * 0.5, cy + r * 0.94, cx - r * 1.15, cy + r * 1.4)
    ctx.lineTo(cx + r * 1.15, cy + r * 1.4)
    ctx.quadraticCurveTo(cx + r * 0.5, cy + r * 0.94, cx + r * 0.2, cy + r * 0.88)
    ctx.closePath()
    ctx.fill()
  }

  // Fernet bottle in hand (Facundo)
  if (c.fernet) {
    const bx = cx + r * 0.88, by = cy + r * 1.05
    // Bottle body
    ctx.fillStyle = '#0d0d0d'
    ctx.beginPath()
    ctx.roundRect(bx - r * 0.07, by - r * 0.38, r * 0.14, r * 0.38, r * 0.02)
    ctx.fill()
    // Bottle shoulder taper
    ctx.fillStyle = '#0d0d0d'
    ctx.beginPath()
    ctx.moveTo(bx - r * 0.07, by - r * 0.38)
    ctx.lineTo(bx - r * 0.04, by - r * 0.48)
    ctx.lineTo(bx + r * 0.04, by - r * 0.48)
    ctx.lineTo(bx + r * 0.07, by - r * 0.38)
    ctx.fill()
    // Neck
    ctx.fillRect(bx - r * 0.03, by - r * 0.58, r * 0.06, r * 0.12)
    // Label
    ctx.fillStyle = '#e8e0c8'
    ctx.fillRect(bx - r * 0.062, by - r * 0.30, r * 0.124, r * 0.18)
    // Label text
    ctx.save()
    ctx.fillStyle = '#111'
    ctx.font = `bold ${Math.max(5, Math.floor(r * 0.055))}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('FERNET', bx, by - r * 0.20)
    ctx.fillStyle = '#8B0000'
    ctx.font = `${Math.max(4, Math.floor(r * 0.044))}px sans-serif`
    ctx.fillText('BRANCA', bx, by - r * 0.14)
    ctx.restore()
    // Hand gripping bottle
    ctx.fillStyle = darken(c.skin, 0.06)
    ctx.beginPath()
    ctx.ellipse(bx, by + r * 0.01, r * 0.1, r * 0.07, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Scarf (Facundo — River Plate red/white, worn loose around neck)
  if (c.scarf) {
    const scarfY = cy + r * 0.88
    ctx.fillStyle = '#E8052A'
    ctx.fillRect(cx - r * 0.42, scarfY, r * 0.84, r * 0.07)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - r * 0.42, scarfY + r * 0.07, r * 0.84, r * 0.07)
    ctx.fillStyle = '#E8052A'
    ctx.fillRect(cx - r * 0.42, scarfY + r * 0.14, r * 0.84, r * 0.07)
    // Scarf hanging ends
    ctx.fillStyle = '#E8052A'
    ctx.fillRect(cx - r * 0.38, scarfY + r * 0.21, r * 0.12, r * 0.28)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - r * 0.25, scarfY + r * 0.21, r * 0.12, r * 0.28)
  }

  // Head base
  const faceGrad = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.2, r * 0.1, cx, cy, r * 0.95)
  faceGrad.addColorStop(0, lighten(c.skin, 0.15))
  faceGrad.addColorStop(0.6, c.skin)
  faceGrad.addColorStop(1, darken(c.skin, 0.18))
  ctx.fillStyle = faceGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 0.68, r * 0.86, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears
  ctx.fillStyle = darken(c.skin, 0.06)
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.66, cy + r * 0.03, r * 0.1, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.66, cy + r * 0.03, r * 0.1, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  // Inner ear
  ctx.fillStyle = darken(c.skin, 0.15)
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.66, cy + r * 0.03, r * 0.055, r * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  // Earrings (Mirta)
  if (c.earrings) {
    ctx.fillStyle = '#c8a050'
    ctx.beginPath()
    ctx.arc(cx - r * 0.67, cy + r * 0.16, r * 0.04, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + r * 0.67, cy + r * 0.16, r * 0.04, 0, Math.PI * 2)
    ctx.fill()
  }

  // Hair (only visible sides when wearing cap)
  ctx.fillStyle = c.hair
  if (!c.cap) {
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.24, r * 0.7, r * 0.7, 0, Math.PI, 0)
    ctx.fill()
  } else {
    // Just sideburn/ear hair visible below cap
    ctx.fillRect(cx - r * 0.68, cy - r * 0.45, r * 0.13, r * 0.42)
    ctx.fillRect(cx + r * 0.55, cy - r * 0.45, r * 0.13, r * 0.42)
  }

  if (c.cap) {
    // Baseball cap covering hair
    // Cap body
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.55, r * 0.72, r * 0.5, 0, Math.PI, 0)
    ctx.fill()
    // Cap side panels
    ctx.fillRect(cx - r * 0.72, cy - r * 0.55, r * 0.14, r * 0.3)
    ctx.fillRect(cx + r * 0.58, cy - r * 0.55, r * 0.14, r * 0.3)
    // River Plate logo panel on front (white with red stripe)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.62, r * 0.28, r * 0.22, 0, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#E8052A'
    ctx.fillRect(cx - r * 0.28, cy - r * 0.66, r * 0.56, r * 0.07)
    // Cap brim
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.1, cy - r * 0.56, r * 0.65, r * 0.12, 0.12, 0, Math.PI * 2)
    ctx.fill()
    // Brim underside tint
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.12, cy - r * 0.53, r * 0.55, r * 0.07, 0.12, 0, Math.PI)
    ctx.fill()
    // Cap button on top
    ctx.fillStyle = '#E8052A'
    ctx.beginPath()
    ctx.arc(cx, cy - r * 1.04, r * 0.05, 0, Math.PI * 2)
    ctx.fill()
  } else if (charKey === 'mirta') {
    // Hair pulled back — bun
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.88, r * 0.22, r * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    // Sides swept back
    ctx.fillRect(cx - r * 0.68, cy - r * 0.65, r * 0.14, r * 0.4)
    ctx.fillRect(cx + r * 0.54, cy - r * 0.65, r * 0.14, r * 0.4)
  } else if (charKey === 'ruben') {
    // Receding hair — gray
    ctx.fillStyle = '#999'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.24, r * 0.7, r * 0.7, 0, Math.PI, 0)
    ctx.fill()
    // Bald patch on top (skin shows through)
    const bald = ctx.createRadialGradient(cx, cy - r * 0.5, 0, cx, cy - r * 0.5, r * 0.38)
    bald.addColorStop(0, c.skin + 'ff')
    bald.addColorStop(0.6, c.skin + '88')
    bald.addColorStop(1, 'transparent')
    ctx.fillStyle = bald
    ctx.beginPath()
    ctx.ellipse(cx, cy - r * 0.5, r * 0.38, r * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (!c.cap) {
    // Generic — full hair sides
    ctx.fillRect(cx - r * 0.68, cy - r * 0.45, r * 0.14, r * 0.55)
    ctx.fillRect(cx + r * 0.54, cy - r * 0.45, r * 0.14, r * 0.55)
  }

  // Eyebrow helper
  const browColor = charKey === 'ruben' ? '#777' : '#160800'
  ctx.strokeStyle = browColor
  ctx.lineWidth = r * 0.065
  ctx.lineCap = 'round'

  const eyeY = cy - r * 0.1
  const eSpacing = r * 0.265

  // Eyebrows
  ctx.beginPath()
  ctx.moveTo(cx - eSpacing - r * 0.14, eyeY - r * 0.24)
  ctx.quadraticCurveTo(cx - eSpacing, eyeY - r * 0.30, cx - eSpacing + r * 0.16, eyeY - r * 0.25)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + eSpacing - r * 0.16, eyeY - r * 0.25)
  ctx.quadraticCurveTo(cx + eSpacing, eyeY - r * 0.30, cx + eSpacing + r * 0.14, eyeY - r * 0.24)
  ctx.stroke()

  // Eyes
  const eyeOpenH = r * 0.115 * (1 - blinkP * 0.96)
  const drawEye = (ex) => {
    // White
    ctx.fillStyle = '#f8f4ee'
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, r * 0.125, eyeOpenH, 0, 0, Math.PI * 2)
    ctx.fill()
    // Iris
    const irisR = Math.min(eyeOpenH * 0.82, r * 0.075)
    ctx.fillStyle = c.eye
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, irisR, irisR, 0, 0, Math.PI * 2)
    ctx.fill()
    // Pupil
    const pupilR = Math.min(irisR * 0.55, r * 0.042)
    ctx.fillStyle = '#0a0000'
    ctx.beginPath()
    ctx.ellipse(ex, eyeY, pupilR, pupilR, 0, 0, Math.PI * 2)
    ctx.fill()
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.beginPath()
    ctx.arc(ex + r * 0.035, eyeY - r * 0.03, r * 0.026, 0, Math.PI * 2)
    ctx.fill()
    // Eyelid shadow
    ctx.fillStyle = darken(c.skin, 0.12)
    ctx.beginPath()
    ctx.ellipse(ex, eyeY - eyeOpenH * 0.3, r * 0.13, eyeOpenH * 0.4, 0, Math.PI, 0)
    ctx.fill()
  }
  drawEye(cx - eSpacing)
  drawEye(cx + eSpacing)

  // Nose
  const noseY = cy + r * 0.16
  ctx.strokeStyle = darken(c.skin, 0.22)
  ctx.lineWidth = r * 0.03
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.04)
  ctx.quadraticCurveTo(cx + r * 0.14, noseY, cx + r * 0.12, noseY + r * 0.12)
  ctx.stroke()
  // Nostril hints
  ctx.fillStyle = darken(c.skin, 0.2)
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.11, noseY + r * 0.13, r * 0.045, r * 0.03, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.04, noseY + r * 0.13, r * 0.04, r * 0.028, -0.4, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  const mouthY = cy + r * 0.43
  const mouthW = r * 0.3
  const openH = mouthOpen * r * 0.22

  // Lip shadow
  ctx.fillStyle = darken(c.skin, 0.14)
  ctx.beginPath()
  ctx.ellipse(cx, mouthY + openH * 0.3, mouthW + r * 0.04, r * 0.04 + openH * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()

  // Upper lip
  ctx.fillStyle = '#7a3828'
  ctx.beginPath()
  ctx.moveTo(cx - mouthW, mouthY)
  ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY - r * 0.04, cx, mouthY - r * 0.02)
  ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY - r * 0.04, cx + mouthW, mouthY)
  ctx.quadraticCurveTo(cx + mouthW * 0.5, mouthY + r * 0.03, cx, mouthY + r * 0.04 + openH)
  ctx.quadraticCurveTo(cx - mouthW * 0.5, mouthY + r * 0.03 + openH, cx - mouthW, mouthY)
  ctx.fill()

  // Lower lip highlight
  ctx.fillStyle = lighten('#7a3828', 0.15)
  ctx.beginPath()
  ctx.ellipse(cx, mouthY + r * 0.025 + openH * 0.6, mouthW * 0.55, r * 0.025, 0, 0, Math.PI * 2)
  ctx.fill()

  // Mouth interior
  if (mouthOpen > 0.06) {
    ctx.fillStyle = '#2a0808'
    ctx.beginPath()
    ctx.ellipse(cx, mouthY + openH * 0.28, mouthW * 0.72, openH * 0.62, 0, 0, Math.PI * 2)
    ctx.fill()
    // Teeth
    if (mouthOpen > 0.18) {
      ctx.fillStyle = '#f0ebe0'
      ctx.beginPath()
      ctx.rect(cx - mouthW * 0.6, mouthY, mouthW * 1.2, openH * 0.38)
      ctx.fill()
      // Tooth lines
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = r * 0.018
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * mouthW * 0.22, mouthY)
        ctx.lineTo(cx + i * mouthW * 0.22, mouthY + openH * 0.38)
        ctx.stroke()
      }
    }
  }

  // Cheek warmth
  ctx.fillStyle = 'rgba(220,100,80,0.10)'
  ctx.beginPath()
  ctx.ellipse(cx - eSpacing - r * 0.08, eyeY + r * 0.28, r * 0.2, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + eSpacing + r * 0.08, eyeY + r * 0.28, r * 0.2, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  // Facundo: stubble
  if (charKey === 'facundo') {
    ctx.fillStyle = 'rgba(25,10,0,0.14)'
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2
      const dist = 0.38 + Math.random() * 0.22
      const sx = cx + Math.cos(angle) * r * dist * 0.72
      const sy = mouthY + r * 0.04 + Math.sin(angle) * r * dist * 0.32
      if (sy > mouthY + r * 0.06 && sy < cy + r * 0.78) {
        ctx.beginPath()
        ctx.arc(sx, sy, r * 0.018, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Rubén: mustache
  if (c.mustache) {
    ctx.fillStyle = '#666'
    ctx.beginPath()
    ctx.ellipse(cx - r * 0.15, mouthY - r * 0.06, r * 0.17, r * 0.065, -0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + r * 0.15, mouthY - r * 0.06, r * 0.17, r * 0.065, 0.15, 0, Math.PI * 2)
    ctx.fill()
  }
}

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + Math.round(amt * 255))
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(amt * 255))
  const b = Math.min(255, (n & 0xff) + Math.round(amt * 255))
  return `rgb(${r},${g},${b})`
}

function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - Math.round(amt * 255))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
  const b = Math.max(0, (n & 0xff) - Math.round(amt * 255))
  return `rgb(${r},${g},${b})`
}

const CHAR_KEY_MAP = {
  monumental_pregame: 'facundo',
  monumental_partido: 'facundo',
  monumental_festejo: 'facundo',
  parrilla: 'mirta',
  taxi: 'ruben',
}

export default function AnimatedCharacter({ sceneId, speaking, size = 190 }) {
  const canvasRef = useRef(null)
  const speakingRef = useRef(speaking)
  const charKey = CHAR_KEY_MAP[sceneId] || 'facundo'

  useEffect(() => { speakingRef.current = speaking }, [speaking])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const state = {
      blinkTimer: 2.5 + Math.random() * 3,
      blinkP: 0,
      blinkDir: 0,
      mouthOpen: 0,
      mouthTarget: 0,
      mouthTimer: 0,
    }

    // Pre-generate stubble positions so they're stable
    const stubblePoints = Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2
      const dist = 0.38 + Math.sin(i * 7.3) * 0.11
      return { angle, dist, r: 0.015 + Math.sin(i * 3.1) * 0.005 }
    })

    let raf
    const draw = () => {
      // Blink
      state.blinkTimer -= 0.016
      if (state.blinkTimer <= 0 && state.blinkDir === 0) state.blinkDir = 1
      if (state.blinkDir === 1) {
        state.blinkP = Math.min(1, state.blinkP + 0.16)
        if (state.blinkP >= 1) state.blinkDir = -1
      } else if (state.blinkDir === -1) {
        state.blinkP = Math.max(0, state.blinkP - 0.16)
        if (state.blinkP <= 0) { state.blinkDir = 0; state.blinkTimer = 2.5 + Math.random() * 4 }
      }

      // Mouth
      if (speakingRef.current) {
        state.mouthTimer -= 0.016
        if (state.mouthTimer <= 0) {
          state.mouthTimer = 0.05 + Math.random() * 0.11
          state.mouthTarget = 0.12 + Math.random() * 0.78
        }
      } else {
        state.mouthTarget = 0
      }
      state.mouthOpen += (state.mouthTarget - state.mouthOpen) * 0.22

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const r = canvas.height * 0.36
      drawCharacter(ctx, charKey, canvas.width / 2, canvas.height * 0.45, r, state.mouthOpen, state.blinkP)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [charKey])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 1.22)}
      style={{ display: 'block' }}
    />
  )
}
