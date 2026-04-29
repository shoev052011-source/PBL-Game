# Probability Dungeon — PRD

## Original Problem Statement
Create a top-down pixel-art ARPG called "Probability Dungeon."
Core mechanics:
- Room Entry & Locking with 1.5-tile (~56px) safety buffer
- Anti-stuck physics (nudge to room center)
- Skeletons: spawn on lock, chase player, contact damage, no dialogue
- Robots: stationary, proximity-trigger Probability Quiz UI
- Quiz UI Exit button: 1st click closes, 2nd click destroys robot
- WASD/Arrows movement, 'O' attack
- 'O' damages skeletons only (not robots)
- 20 basic probability questions
- Pixel-art 2D top-down style

## User Choices
- Scope: 8-room medium campaign (with mention of small demo + endless as future)
- HP: 3-heart system, game over on death
- Visuals: programmatic pixel sprites
- Quiz format: multiple-choice + numeric (both)
- Audio: SFX + nostalgic ambient music

## Architecture
- React 19 SPA with Canvas 2D rendering (512x384 backbuffer, CSS-scaled, pixelated)
- Game loop via requestAnimationFrame; React state only for screen + HUD + quiz dialog
- Web Audio API synth for all SFX + ambient loop (no external audio assets)
- Shadcn UI Dialog + Tabs + Input + Button for the Quiz UI
- Backend: untouched (FastAPI hello-world only — game is fully client-side)

## Implemented (Feb 2026)
- Title / Playing / Game Over / Victory screens
- 8 procedurally-built rooms with increasing skeleton count
- Player: 3 HP, WASD/Arrow movement, 'O' weapon swing with arc slash, hurt iframes (700ms), post-quiz iframes (1500ms)
- Skeletons: spawn on room lock, A* free chase, contact damage, knockback, separation, frozen during quiz
- Robots: stationary; 40px proximity opens quiz; 2nd Exit click destroys
- Quiz: 20 probability questions, multi-choice + numeric tabs, correct/incorrect feedback, heart heal on correct
- Room lock: door-entrance becomes solid only after player crosses 56px buffer; anti-stuck nudge to room center
- Exit door: opens after all skeletons cleared; walking onto right-edge exit advances to next room
- HUD: 3-heart display + ROOM x / 8 + control hints
- Sounds: footstep, sword swing, hit, kill, lock, unlock, quiz open, correct, wrong, game over, victory, ambient minor-key chiptune loop

## Files
- /app/frontend/src/App.js
- /app/frontend/src/App.css
- /app/frontend/src/game/ProbabilityDungeon.jsx (main)
- /app/frontend/src/game/QuizDialog.jsx
- /app/frontend/src/game/sprites.js
- /app/frontend/src/game/audio.js
- /app/frontend/src/game/questions.js

## Backlog
- P1: Add an audio-mute toggle in HUD
- P1: Boss room (room 8) with custom big-skeleton sprite
- P1: Question-bank shuffle per playthrough (currently deterministic)
- P2: Endless/procedural mode
- P2: Power-ups / pickups (potions, keys, weapons)
- P2: Persisted high score / completion time via backend
- P2: Mobile touch controls
