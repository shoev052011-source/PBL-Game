# Probability Dungeon — PRD (rev 4)

## Original Problem
Top-down pixel-art ARPG with rooms, probability quizzes, skeletons, anti-stuck physics, safety buffer, attack with 'O'. Expanded across 4 iterations to: chests + economy + shop, character customization with persistence, 10 characters, 5 biomes with tiered math + biome-specific mobs + twin-beam laser + robot double-lock + mini-map. Iter 4 = environment-visual overhaul.

## Architecture
- 100% client-side React + Canvas. Backend hello-world only.
- State machine in `App.js`: hub → {shop | character | biome → dungeon} → hub
- Persistence via localStorage key `probability-dungeon-save-v2`
- Web Audio API synth (ambient + SFX)

## Implemented (rev 4 — visual overhaul)
- **Tilemap floor & walls**: stone-brick floor with cracked-tile variations + moss/rune accents; 3D wall shading (lighter top, darker bottom).
- **Biome-specific tileset reskins**:
  - Dungeon: purple-grey stone brick + rune speckles + cracks
  - **Hell**: obsidian dark-red/black floor + animated lava strips + deep red brick walls with glowing cracks
  - **Sakura**: warm tan wood-plank floor + grain + pink dust speckles, green bamboo wall accents
  - Ice: pale-blue ice blocks with shine, light-blue walls
  - Tech: dark navy metal panels + cyan circuit traces + LED dots, neon wall seams
- **Wall-mounted torches**: flickering core/mid/outer flame + soft halo, biome-tinted (orange / pink / cyan).
- **Pillars** as solid obstacles (biome-themed).
- **Chests in corners** of every room.
- **Rugs/platforms under robots** (biome-coloured).
- **+30% larger room**: 20×14 grid @ 32px = 640×448 (was 16×12 = 512×384). Display max 1280px.
- **Properly-scaled entities**: player 26px, mobs 26px, robot 32px, chest 30px.
- **Mini-map** top-right with metallic frame (gradient grey + corner bolts) showing player, mobs, robot status, chests, torches, pillars, doors.

## Carry-over Features
- 10 characters (Hero free + Knight, Paladin, Alchemist, Assassin, Vampire, Engineer, Werewolf, Priest, Druid, Necromancer)
- 5 biomes with sequential unlock + tiered math (arithmetic → algebra/probability)
- 2 mob types per biome with shatter death FX + coin drops
- Twin-Beam Laser legendary weapon (tier 3+ chests)
- Robot "Good job!" double-lock (cannot re-trigger; exit gates on mobs-dead AND robots-handled)
- Sakura petal particles
- Ice biome slippery friction physics
- Persistence: coins / owned items / owned characters / owned weapons / equipped / current char / biome unlocks

## Files
- `App.js`, `App.css`
- `game/store.js`, `game/items.js`, `game/characters.js`, `game/biomes.js`, `game/math.js`, `game/questions.js`
- `game/sprites.js` (drawPlayer, MOB_DRAWERS, drawTwinBeam, drawShatter, drawPetal, drawTorch, drawRug, drawMiniMapFrame, biome-aware drawFloorTile/drawWallTile/drawPillar/drawPit)
- `game/audio.js`
- `game/MainHub.jsx`, `game/Shop.jsx`, `game/CharacterScreen.jsx`, `game/BiomeSelect.jsx`, `game/ProbabilityDungeon.jsx`, `game/QuizDialog.jsx`

## Backlog
- P1: Boss room per biome (large unique sprite for room 6)
- P1: Audio mute toggle in HUD
- P1: Daily seeded run / leaderboard
- P2: Sci-fi-styled torches for tech/ice biomes (metal sconce, icicle sconce)
- P2: Weapon select menu, mobile touch controls, backend high-score persistence
