const EL_API = 'https://api.elevenlabs.io/v1/text-to-speech'
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

let currentAudio = null
let currentUtterance = null

function browserSpeak(text, lang, onEnd) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang || 'es-AR'
  u.rate = 0.92
  u.pitch = 1.0
  currentUtterance = u
  u.onend = () => { currentUtterance = null; onEnd?.() }
  u.onerror = () => { currentUtterance = null; onEnd?.() }
  window.speechSynthesis.speak(u)
}

export async function speak(text, voiceId, onStart, onEnd, lang) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  if (currentUtterance) { window.speechSynthesis.cancel(); currentUtterance = null }

  if (!API_KEY || !voiceId) {
    browserSpeak(text, lang, onEnd)
    return
  }

  try {
    const res = await fetch(`${EL_API}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.82,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    })

    if (!res.ok) {
      if (res.status === 402) {
        console.warn('ElevenLabs: free tier cannot use this voice — upgrade to Starter at elevenlabs.io for the Argentine accent. Using browser TTS.')
      } else {
        console.warn(`ElevenLabs ${res.status} — falling back to browser TTS`)
      }
      browserSpeak(text, lang, onEnd)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    audio.onplay = () => onStart?.()
    audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.() }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      currentAudio = null
      console.warn('Audio playback error — falling back to browser TTS')
      browserSpeak(text, lang, onEnd)
    }

    await audio.play()
  } catch (e) {
    console.warn('ElevenLabs fetch failed — falling back to browser TTS:', e.message)
    browserSpeak(text, lang, onEnd)
  }
}

export function stopSpeaking() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  if (currentUtterance) { window.speechSynthesis.cancel(); currentUtterance = null }
}
