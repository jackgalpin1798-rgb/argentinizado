const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function getCharacterReply(systemPrompt, history) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: systemPrompt,
      messages: history,
    }),
  })
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

export async function scoreConversation(scene, history) {
  const transcript = history
    .map(m => `${m.role === 'user' ? 'User' : scene.character.name}: ${m.content}`)
    .join('\n')

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a British language tutor who specialises in Argentine Castellano. Analyse the user's Spanish in the conversation transcript and give a concise debrief.

Return ONLY valid JSON in this exact shape:
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "xpEarned": <number 10-50>,
  "survived": <true/false>,
  "highlights": ["<one thing done well>", "<another positive>"],
  "mistakes": [
    { "said": "<what they said>", "better": "<Argentine way>", "note": "<brief British English explanation>" }
  ],
  "debrief": "<2-3 sentence British English spoken summary, warm and encouraging, mention one specific Argentine expression they should remember>"
}`,
      messages: [{ role: 'user', content: `Scene: ${scene.name}\n\nTranscript:\n${transcript}` }],
    }),
  })
  if (!res.ok) throw new Error(`Claude scoring error: ${res.status}`)
  const data = await res.json()
  try {
    return JSON.parse(data.content[0].text)
  } catch {
    return {
      score: 60, grade: 'C', xpEarned: 20, survived: true,
      highlights: ['You gave it a go!'],
      mistakes: [],
      debrief: "Not bad for a first attempt! Keep practising your voseo and you'll sound like a proper porteño in no time.",
    }
  }
}
