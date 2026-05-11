import { useState, useCallback } from 'react'

export const LEVELS = [
  { name: 'Turista',         minXP: 0,    maxXP: 100  },
  { name: 'Visitante',       minXP: 100,  maxXP: 250  },
  { name: 'Residente',       minXP: 250,  maxXP: 500  },
  { name: 'Porteño',         minXP: 500,  maxXP: 900  },
  { name: 'Argentino de ley',minXP: 900,  maxXP: 9999 },
]

const STORAGE_KEY = 'argentinizado_save'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return { ...LEVELS[i], index: i }
  }
  return { ...LEVELS[0], index: 0 }
}

export function useGameStore() {
  const saved = load()
  const [xp, setXP] = useState(saved?.xp ?? 0)
  const [streak, setStreak] = useState(saved?.streak ?? 0)
  const [lastPlayed, setLastPlayed] = useState(saved?.lastPlayed ?? null)
  const [unlockedScenes, setUnlockedScenes] = useState(saved?.unlockedScenes ?? ['monumental'])

  const persist = useCallback((updates) => {
    const next = { xp, streak, lastPlayed, unlockedScenes, ...updates }
    save(next)
  }, [xp, streak, lastPlayed, unlockedScenes])

  const addXP = useCallback((amount) => {
    setXP(prev => {
      const next = prev + amount
      persist({ xp: next })
      return next
    })
  }, [persist])

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString()
    if (lastPlayed === today) return streak
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = lastPlayed === yesterday ? streak + 1 : 1
    setStreak(newStreak)
    setLastPlayed(today)
    persist({ streak: newStreak, lastPlayed: today })
    return newStreak
  }, [lastPlayed, streak, persist])

  const unlockScene = useCallback((sceneId) => {
    if (!unlockedScenes.includes(sceneId)) {
      const next = [...unlockedScenes, sceneId]
      setUnlockedScenes(next)
      persist({ unlockedScenes: next })
    }
  }, [unlockedScenes, persist])

  return { xp, streak, unlockedScenes, addXP, updateStreak, unlockScene, getLevel }
}
