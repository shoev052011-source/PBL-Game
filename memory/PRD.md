# Probability Dungeon — PRD (rev 3)

## Original Problem
Top-down pixel-art ARPG with rooms, robots that quiz on probability, skeletons, anti-stuck physics, safety buffer, attack with 'O'. Expanded to: chests + economy + shop + character customization with persistence; then again expanded to: 10 characters, 5 biomes, tiered math, biome-mobs, Twin-Beam Laser, robot "Good job" double-lock, mini-map.

## Architecture (Feb 2026)
- 100% client-side React+Canvas. No backend usage.
- State machine in `App.js`: hub → {shop | character | biome → dungeon} → hub
- Persistence via localStorage key `probability-dungeon-save-v2`
- Web Audio API synth for ambient + SFX

## Implemented (rev 3)
- **10 characters** (Hero free + 10 purchasable 120–240 coins): Hero, Knight, Paladin, Alchemist, Assassin, Vampire, Engineer, Werewolf, Priest, Druid, Necromancer with palette + accessory (halo, fangs, antlers, goggles, mask, skull, etc.)
- **5 biomes**: Dungeon, Hell, Sakura, Ice, Tech — own tile palettes, mob types, math difficulty; sequential unlock on clear; ice biome has slippery friction physics; sakura has petal particles
- **Tiered math** (math.js): T0 arithmetic, T1 mult/div, T2 fractions, T3 percentages, T4 algebra + complex probability
- **Biome mobs (2 each)**: skeleton+zombie, lavaslime+imp, spirit+blossombat, icegolem+frostwolf, drone+sentry — shatter death FX + coin drop
- **Twin-Beam Laser** rare weapon: drops from tier 3+ chests, holds 'O' to fire 2 parallel beams with DOT
- **Robot Double-Lock**: correct answer → robot says "Good job!" → `isCompleted=true`, no re-trigger. Exit opens only when (mobs dead) AND (every robot completed or destroyed-via-2-Exit-clicks)
- **Mini-map** top-right showing room layout, mobs, robot, chests, player
- **Layered player rendering**: base char + pants + shirt + hat + accessory on any of 10 chars
- **Shop**: 16 clothes across 4 slots, BUY/EQUIP, disabled when broke
- **Character screen**: 10-char roster with locked overlay + price; live preview canvas
- **Persistence**: coins, owned items/chars/weapons, equipped, currentChar, currentBiome, biomesUnlocked

## Files (rev 3)
- `App.js`, `App.css`
- `game/store.js` (localStorage), `game/items.js` (clothes + weapons), `game/characters.js` (10 chars), `game/biomes.js` (5), `game/math.js` (tiered Q), `game/questions.js` (legacy prob bank)
- `game/sprites.js` (drawPlayer, MOB_DRAWERS, drawTwinBeam, drawShatter, drawPetal, biome tiles)
- `game/audio.js`
- `game/MainHub.jsx`, `game/Shop.jsx`, `game/CharacterScreen.jsx`, `game/BiomeSelect.jsx`, `game/ProbabilityDungeon.jsx`, `game/QuizDialog.jsx`

## Backlog
- P1: Boss room with custom large sprite per biome
- P1: Audio mute toggle in HUD
- P1: Daily seeded run / leaderboard
- P2: Weapon select menu (currently latest pickup overrides)
- P2: Mobile touch controls
- P2: Backend high-score persistence
