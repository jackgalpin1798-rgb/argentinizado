import React, { useState } from 'react'
import SceneSelect from './components/SceneSelect'
import ConversationScene from './components/ConversationScene'
import Debrief from './components/Debrief'
import HUD from './components/HUD'
import SplashScreen from './components/SplashScreen'
import { SCENES } from './data/scenes'
import { useGameStore } from './store/gameStore'

const VIEW = { SPLASH: 'splash', SELECT: 'select', SCENE: 'scene', DEBRIEF: 'debrief' }

export default function App() {
  const [view, setView] = useState(VIEW.SPLASH)
  const [activeSceneId, setActiveSceneId] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [difficulty, setDifficulty] = useState('intermediate')
  const { xp, streak, addXP, updateStreak } = useGameStore()

  const handleSelectScene = (sceneId) => {
    setActiveSceneId(sceneId)
    setConversationHistory([])
    setView(VIEW.SCENE)
  }

  const handleSceneEnd = (history) => {
    setConversationHistory(history)
    setView(VIEW.DEBRIEF)
  }

  const handleAddXP = (amount) => {
    addXP(amount)
    updateStreak()
  }

  const handleContinue = () => {
    setActiveSceneId(null)
    setConversationHistory([])
    setView(VIEW.SELECT)
  }

  const activeScene = activeSceneId ? SCENES[activeSceneId] : null

  return (
    <>
      {view === VIEW.SPLASH && (
        <SplashScreen onEnter={() => setView(VIEW.SELECT)} />
      )}
      {view === VIEW.SELECT && (
        <>
          <HUD xp={xp} streak={streak} />
          <SceneSelect xp={xp} streak={streak} onSelect={handleSelectScene} difficulty={difficulty} onDifficulty={setDifficulty} />
        </>
      )}
      {view === VIEW.SCENE && activeScene && (
        <ConversationScene
          scene={activeScene}
          difficulty={difficulty}
          onEnd={handleSceneEnd}
        />
      )}
      {view === VIEW.DEBRIEF && activeScene && (
        <Debrief
          scene={activeScene}
          history={conversationHistory}
          onContinue={handleContinue}
          onAddXP={handleAddXP}
        />
      )}
    </>
  )
}
