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

function createStadiumReverb(ctx) {
  const convolver = ctx.createConvolver()
  const duration = 3.8
  const length = ctx.sampleRate * duration
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      // Exponential decay with early reflections
      const decay = Math.pow(1 - i / length, 4.2)
      const earlyRef = i < ctx.sampleRate * 0.05 ? 1.8 : 1
      data[i] = (Math.random() * 2 - 1) * decay * earlyRef
    }
  }
  convolver.buffer = impulse
  return convolver
}

function buildCrowdNoise(ctx, masterGain) {
  const nodes = []

  // Stadium reverb — makes everything sound like a huge concrete bowl
  const reverb = createStadiumReverb(ctx)
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.38
  reverb.connect(reverbGain)
  reverbGain.connect(masterGain)

  // Pre-reverb bus — all crowd sound goes here first, then splits dry/wet
  const dryBus = ctx.createGain()
  dryBus.gain.value = 0.62
  dryBus.connect(masterGain)

  const wetBus = ctx.createGain()
  wetBus.gain.value = 0.38
  wetBus.connect(reverb)

  const crowdBus = ctx.createGain()
  crowdBus.gain.value = 1
  crowdBus.connect(dryBus)
  crowdBus.connect(wetBus)

  // Low stadium rumble — the physical vibration of 80,000 people
  const rumble = createNoise(ctx)
  const rumbleLP = ctx.createBiquadFilter()
  rumbleLP.type = 'lowpass'
  rumbleLP.frequency.value = 90
  const rumbleGain = ctx.createGain()
  rumbleGain.gain.value = 0.38
  rumble.connect(rumbleLP)
  rumbleLP.connect(rumbleGain)
  rumbleGain.connect(crowdBus)
  rumble.start()
  nodes.push(rumble)

  // Voice frequency layers — tight bandpass = sounds like actual voices not wind
  const voiceGains = []
  const voiceLayers = [
    { freq: 240,  Q: 14, gain: 0.16 },
    { freq: 360,  Q: 11, gain: 0.14 },
    { freq: 500,  Q: 9,  gain: 0.12 },
    { freq: 700,  Q: 8,  gain: 0.09 },
    { freq: 950,  Q: 6,  gain: 0.06 },
    { freq: 1350, Q: 5,  gain: 0.04 },
  ]
  voiceLayers.forEach(({ freq, Q, gain: g }) => {
    const noise = createNoise(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = Q
    const gainNode = ctx.createGain()
    gainNode.gain.value = g
    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(crowdBus)
    noise.start()
    nodes.push(noise)
    voiceGains.push(gainNode)
  })

  // Chanting rhythm LFO — ~0.85 Hz = "OLE-OLE-OLE" pace
  // Sawtooth gives sharp attack (shout onset) with quick decay (between chants)
  const chantLFO = ctx.createOscillator()
  chantLFO.type = 'sawtooth'
  chantLFO.frequency.value = 0.83

  // Shape the waveform: sharp upward hit, slow tail (like a crowd chant attack)
  const shaper = ctx.createWaveShaper()
  const curve = new Float32Array(512)
  for (let i = 0; i < 512; i++) {
    const x = (i / 256) - 1
    curve[i] = x > 0 ? Math.pow(x, 0.28) * 0.9 : Math.pow(-x, 3) * -0.3
  }
  shaper.curve = curve
  shaper.oversample = '4x'

  const chantDepth = ctx.createGain()
  chantDepth.gain.value = 0.11
  chantLFO.connect(shaper)
  shaper.connect(chantDepth)
  // Drive mid-voice frequencies for the chanting effect
  chantDepth.connect(voiceGains[1].gain)
  chantDepth.connect(voiceGains[2].gain)
  chantDepth.connect(voiceGains[3].gain)
  chantLFO.start()
  nodes.push(chantLFO)

  // Second chant layer at slightly different rate — creates "counter-chant" feel
  const chantLFO2 = ctx.createOscillator()
  chantLFO2.type = 'sawtooth'
  chantLFO2.frequency.value = 0.78
  const shaper2 = ctx.createWaveShaper()
  shaper2.curve = curve
  const chantDepth2 = ctx.createGain()
  chantDepth2.gain.value = 0.07
  chantLFO2.connect(shaper2)
  shaper2.connect(chantDepth2)
  chantDepth2.connect(voiceGains[0].gain)
  chantDepth2.connect(voiceGains[4].gain)
  chantLFO2.start()
  nodes.push(chantLFO2)

  // Crowd swell LFO — 25-second cycles of collective excitement rising/falling
  const swellLFO = ctx.createOscillator()
  swellLFO.type = 'sine'
  swellLFO.frequency.value = 0.04
  const swellGain = ctx.createGain()
  swellGain.gain.value = 0.14
  swellLFO.connect(swellGain)
  swellGain.connect(masterGain.gain)
  swellLFO.start()
  nodes.push(swellLFO)

  // High whistles / excitement — the sharp tops of a stadium crowd
  const hiss = createNoise(ctx)
  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = 'bandpass'
  hissFilter.frequency.value = 2600
  hissFilter.Q.value = 0.5
  const hissGain = ctx.createGain()
  hissGain.gain.value = 0.025
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

    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 4)
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
