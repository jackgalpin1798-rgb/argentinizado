# Argentinizado

## What this is
A web app for learning Argentine Castellano through realistic, gamified conversational scenarios. Voice in, Argentine voice out. British English debrief at the end of each scene.

## The concept
- User is dropped into a Buenos Aires scene (El Monumental, a parrilla, a hospital, a taxi, etc.)
- An Argentine character speaks to them in Argentine Spanish (voseo, lunfardo, porteño rhythm)
- User responds via microphone
- Character reacts — warms up if correct, looks confused if wrong
- End of scene: British English scoring breakdown explaining mistakes

## Gamification
- XP + levels: Turista → Porteño → Argentino de ley
- Streak tracking
- Scenarios unlock as you level up
- Survival mode (conversation fails if Spanish breaks down too badly)

## Tech stack
- Frontend: React web app (browser-based, no install)
- STT: Browser Web Speech API (free) → upgrade to Whisper if accuracy needed
- LLM: Claude API (Haiku for conversation, Sonnet for scoring/feedback)
- TTS: ElevenLabs — Argentine Spanish voice (male + female) + British English voice for debrief
- No backend initially — API keys in .env, all client-side for prototype

## API keys needed
- Anthropic API key → ANTHROPIC_API_KEY
- ElevenLabs API key → ELEVENLABS_API_KEY

## ElevenLabs voice IDs
- Argentine male: TBD (user to pick from ElevenLabs library)
- Argentine female: TBD
- British English (debrief): TBD

## Scenarios planned
- El Monumental (football stadium) — fan, match day atmosphere
- Parrilla restaurant — waiter, ordering food
- Hospital — doctor/receptionist
- Taxi — driver
- More unlock at higher levels

## Status
- [ ] API keys obtained
- [ ] ElevenLabs voices chosen
- [ ] Project scaffold built
- [ ] First scenario (El Monumental) working
