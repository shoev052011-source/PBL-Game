# Playwright UI regression test for Probability Dungeon iteration 2 features
# Covers: Main Hub, Shop (buy/equip + persistence), Character roster (10 chars),
# Biome Select (5 biomes w/ lock state), Playing screen + canvas, Twin-Beam weapon
# Run with the Emergent browser_automation tool or a stand-alone Playwright runner.
#
# This file is preserved as documentation. The actual run is performed via the
# browser_automation tool by the testing agent.

URL = "https://pixel-chance.preview.emergentagent.com"

SEED_FULL_UNLOCK = """
  localStorage.removeItem('probability-dungeon-save-v2');
  const s={coins:9999,ownedItems:[],equipped:{hat:null,shirt:null,pants:null,shoes:null},
    ownedCharacters:['hero'],currentCharacter:'hero',
    ownedWeapons:['sword','twin-beam'],weapon:'twin-beam',
    currentBiome:'dungeon',biomesUnlocked:['dungeon']};
  localStorage.setItem('probability-dungeon-save-v2', JSON.stringify(s));
"""

CHECKS = [
    "main-hub", "hub-dungeon-btn", "hub-shop-btn", "hub-character-btn", "hub-coins",
    "shop-screen", "shop-tab-hat", "shop-tab-shirt", "shop-tab-pants", "shop-tab-shoes",
    "shop-buy-hat-straw", "shop-equip-hat-straw",
    "character-screen", "character-preview",
    "char-hero", "char-knight", "char-paladin", "char-alchemist", "char-assassin",
    "char-vampire", "char-engineer", "char-werewolf", "char-priest", "char-druid", "char-necromancer",
    "biome-select",
    "biome-dungeon", "biome-hell", "biome-sakura", "biome-ice", "biome-tech",
    "playing-screen", "game-canvas",
]
