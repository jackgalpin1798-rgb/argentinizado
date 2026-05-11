import React, { useEffect, useState } from 'react'
import { scoreConversation } from '../services/claudeService'
import { speak } from '../services/elevenLabsService'
import './Debrief.css'

const BRITISH_VOICE = import.meta.env.VITE_ELEVENLABS_VOICE_BRITISH

const GRADE_COLOR = { A: '#4ade80', B: '#86efac', C: '#facc15', D: '#fb923c', F: '#f87171' }

export default function Debrief({ scene, history, onContinue, onAddXP }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [xpAnimated, setXpAnimated] = useState(0)

  useEffect(() => {
    const run = async () => {
      try {
        const scored = await scoreConversation(scene, history)
        setResult(scored)
        setLoading(false)
        onAddXP(scored.xpEarned)

        // animate XP counter
        let current = 0
        const step = Math.ceil(scored.xpEarned / 30)
        const timer = setInterval(() => {
          current = Math.min(current + step, scored.xpEarned)
          setXpAnimated(current)
          if (current >= scored.xpEarned) clearInterval(timer)
        }, 40)

        // British debrief TTS
        setSpeaking(true)
        try {
          await speak(scored.debrief, BRITISH_VOICE, null, () => setSpeaking(false))
        } catch { setSpeaking(false) }
      } catch (e) {
        console.error('Scoring error:', e)
        setLoading(false)
        setResult({
          score: 50, grade: 'C', xpEarned: 15, survived: true,
          highlights: ['You completed the scene!'],
          mistakes: [],
          debrief: "Well done for giving it a go! Keep practising your Argentine Spanish.",
        })
      }
    }
    run()
  }, [])

  if (loading) {
    return (
      <div className="debrief loading">
        <div className="debrief-spinner" />
        <p>Scoring your conversation...</p>
      </div>
    )
  }

  const gradeColor = GRADE_COLOR[result.grade] || '#fff'

  return (
    <div className="debrief">
      <div className="debrief-bg" style={{ background: scene.bgGradient }} />
      <div className="debrief-overlay" />

      <div className="debrief-content">
        <div className="debrief-header">
          <div className="debrief-flag">🇬🇧</div>
          <h2 className="debrief-title">Debrief</h2>
          <p className="debrief-subtitle">{scene.name} · {scene.character.name}</p>
        </div>

        <div className="debrief-scorecard">
          <div className="score-grade" style={{ color: gradeColor, borderColor: gradeColor }}>
            {result.grade}
          </div>
          <div className="score-right">
            <div className="score-number">{result.score}<span>/100</span></div>
            <div className="score-xp">+{xpAnimated} XP</div>
            {result.survived
              ? <div className="survived-tag">✓ Survived</div>
              : <div className="failed-tag">✗ Conversation broke down</div>
            }
          </div>
        </div>

        {speaking && (
          <div className="british-speaking">
            <span className="british-flag">🇬🇧</span>
            <div className="british-bars">
              {[0,1,2,3,4].map(i => <span key={i} className="bbar" style={{ animationDelay: `${i*0.1}s` }} />)}
            </div>
            <span className="british-label">Tutor speaking...</span>
          </div>
        )}

        <div className="debrief-section">
          <p className="debrief-text">{result.debrief}</p>
        </div>

        {result.highlights?.length > 0 && (
          <div className="debrief-section">
            <h3 className="section-title">✓ What you did well</h3>
            <ul className="section-list">
              {result.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        )}

        {result.mistakes?.length > 0 && (
          <div className="debrief-section">
            <h3 className="section-title">→ Corrections</h3>
            <div className="corrections">
              {result.mistakes.map((m, i) => (
                <div key={i} className="correction-row">
                  <div className="correction-said">"{m.said}"</div>
                  <div className="correction-arrow">→</div>
                  <div className="correction-better">"{m.better}"</div>
                  <div className="correction-note">{m.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="debrief-actions">
          <button className="btn-continue" onClick={onContinue}>
            Choose next scene →
          </button>
        </div>
      </div>
    </div>
  )
}
