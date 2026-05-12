// Clothes catalog (4 slots × 4 tiers) + weapons + chest reward roll (tier-aware).

export const CLOTHES = [
  { id: "hat-straw", slot: "hat", name: "Straw Hat", price: 25, color: "#e0c080", trim: "#8a6a2a", shape: "wide" },
  { id: "hat-wizard", slot: "hat", name: "Wizard Hat", price: 60, color: "#5a3a8a", trim: "#f4bf4f", shape: "tall" },
  { id: "hat-knight", slot: "hat", name: "Knight Helm", price: 80, color: "#9aa5b8", trim: "#3d4760", shape: "helm" },
  { id: "hat-crown", slot: "hat", name: "Royal Crown", price: 150, color: "#f4bf4f", trim: "#ff6ec7", shape: "crown" },

  { id: "shirt-red", slot: "shirt", name: "Red Tunic", price: 30, color: "#d04545", trim: "#7a2020" },
  { id: "shirt-green", slot: "shirt", name: "Forest Tunic", price: 30, color: "#3a8a4a", trim: "#1f4a26" },
  { id: "shirt-cyan", slot: "shirt", name: "Mage Robe", price: 70, color: "#3aa6c5", trim: "#1f6b81" },
  { id: "shirt-gold", slot: "shirt", name: "Royal Vestment", price: 130, color: "#f4bf4f", trim: "#a8770e" },

  { id: "pants-brown", slot: "pants", name: "Leather Pants", price: 20, color: "#8a5a2a", trim: "#4a2f15" },
  { id: "pants-blue", slot: "pants", name: "Denim Trousers", price: 25, color: "#3a4a8a", trim: "#1f2a4a" },
  { id: "pants-magenta", slot: "pants", name: "Jester Pants", price: 55, color: "#b03a8a", trim: "#5a1f47" },
  { id: "pants-gold", slot: "pants", name: "Gilded Greaves", price: 110, color: "#f4bf4f", trim: "#a8770e" },

  { id: "shoes-leather", slot: "shoes", name: "Leather Boots", price: 15, color: "#5a3a1a", trim: "#2a1a0e" },
  { id: "shoes-iron", slot: "shoes", name: "Iron Boots", price: 45, color: "#9aa5b8", trim: "#3d4760" },
  { id: "shoes-runner", slot: "shoes", name: "Runner Sneakers", price: 60, color: "#9affd6", trim: "#3a8a6a" },
  { id: "shoes-ember", slot: "shoes", name: "Ember Sandals", price: 90, color: "#ff6e2a", trim: "#a8330a" },
];

export const ITEM_BY_ID = Object.fromEntries(CLOTHES.map((i) => [i.id, i]));

export const WEAPONS = [
  { id: "sword", name: "Iron Sword", color: "#ffd166", damage: 1, rarity: "common", tier: 1 },
  { id: "saber", name: "Crimson Saber", color: "#ff6ec7", damage: 1, rarity: "uncommon", tier: 2 },
  { id: "axe", name: "Battle Axe", color: "#9affd6", damage: 2, rarity: "rare", tier: 3 },
  { id: "staff", name: "Arcane Staff", color: "#b07cff", damage: 1, rarity: "uncommon", tier: 2 },
  // NEW rare weapon — twin-beam laser. Two parallel continuous beams that deal damage over time.
  { id: "twin-beam", name: "Twin-Beam Laser", color: "#ff3a6f", damage: 1, dot: true, rarity: "legendary", tier: 4, beamColor1: "#ff3a6f", beamColor2: "#9affd6" },
];
export const WEAPON_BY_ID = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

// Chest reward, biome-tier aware. Higher tier biomes drop better weapons.
// chestTier: 1..4 (tier 4 has a chance to drop twin-beam laser)
export const rollChestReward = (chestTier = 1) => {
  const r = Math.random();
  // 65% coins, 35% weapon
  if (r < 0.65) {
    const base = 5 + Math.floor(Math.random() * 16); // 5..20
    const bonus = (chestTier - 1) * 4; // +0..+12 in later biomes
    return { type: "coins", amount: base + bonus };
  }
  // Weapon, weighted by tier
  let pool;
  if (chestTier <= 1) pool = WEAPONS.filter((w) => w.tier <= 2);
  else if (chestTier === 2) pool = WEAPONS.filter((w) => w.tier <= 3);
  else if (chestTier === 3) pool = WEAPONS.filter((w) => w.tier <= 3);
  else pool = WEAPONS; // tier 4 — twin-beam possible
  const w = pool[Math.floor(Math.random() * pool.length)];
  return { type: "weapon", weapon: w };
};
