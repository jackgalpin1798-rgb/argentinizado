import { useEffect, useRef, useCallback } from 'react'

function createNoise(ctx) {
  const size = ctx.sampleRate * 3
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  return src
}

function buildCrowdNoise(ctx, masterGain) {
  const nodes = []

  // Low stadium rumble
  const rumble = createNoise(ctx)
  const rumbleFilter = ctx.createBiquadFilter()
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.value = 180
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.value = 0.35
  rumble.connect(rumbleFilter)
  rumbleFilter.connect(rumbleGain)
  rumbleGain.connect(masterGain)
  rumble.start()
  nodes.push(rumble)

  // Mid crowd chatter
  const chatter = createNoise(ctx)
  const chatterFilter = ctx.createBiquadFilter()
  chatterFilter.type = 'bandpass'
  chatterFilter.frequency.value = 900
  chatterFilter.Q.value = 0.4
  const chatterGain = ctx.createGain()
  chatterGain.gain.value = 0.18
  chatter.connect(chatterFilter)
  chatterFilter.connect(chatterGain)
  chatterGain.connect(masterGain)
  chatter.start()
  nodes.push(chatter)

  // Wave/swell LFO on crowd
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.08
  lfo.connect(lfoGain)
  lfoGain.connect(chatterGain.gain)
  lfo.start()
  nodes.push(lfo)

  // High frequency excitement
  const hiss = createNoise(ctx)
  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = 'highpass'
  hissFilter.frequency.value = 3000
  const hissGain = ctx.createGain()
  hissGain.gain.value = 0.04
  hiss.connect(hissFilter)
  hissFilter.connect(hissGain)
  hissGain.connect(masterGain)
  hiss.start()
  nodes.push(hiss)

  return nodes
}

function buildRestaurantNoise(ctx, masterGain) {
  const nodes = []
  const chatter = createNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 600
  filter.Q.value = 0.3
  const gain = ctx.createGain()
  gain.gain.value = 0.12
  chatter.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  chatter.start()
  nodes.push(chatter)
  return nodes
}

function buildTrafficNoise(ctx, masterGain) {
  const nodes = []
  const traffic = createNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 250
  const gain = ctx.createGain()
  gain.gain.value = 0.2
  traffic.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  traffic.start()
  nodes.push(traffic)
  return nodes
}

export function useAmbientAudio(sceneId) {
  const ctxRef = useRef(null)
  const masterRef = useRef(null)

  const start = useCallback(() => {
    if (ctxRef.current) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    masterRef.current = master

    const base = sceneId.startsWith('monumental') ? 'monumental'
      : sceneId === 'parrilla' ? 'parrilla' : 'taxi'

    if (base === 'monumental') buildCrowdNoise(ctx, master)
    else if (base === 'parrilla') buildRestaurantNoise(ctx, master)
    else buildTrafficNoise(ctx, master)

    // Fade in over 3 seconds
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 3)
  }, [sceneId])

  const stop = useCallback(() => {
    if (!ctxRef.current) return
    const master = masterRef.current
    const ctx = ctxRef.current
    if (master) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
    }
    setTimeout(() => {
      try { ctx.close() } catch {}
      ctxRef.current = null
      masterRef.current = null
    }, 1600)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { start, stop }
}
