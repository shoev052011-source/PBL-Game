// localStorage-backed save (coins, ownedItems, equipped, ownedCharacters, currentCharacter,
// currentBiome, owned/current weapon, biomesUnlocked, per-biome level progress).

const KEY = "probability-dungeon-save-v3";

const DEFAULT = {
  coins: 0,
  ownedItems: [],
  equipped: { hat: null, shirt: null, pants: null, shoes: null },
  ownedCharacters: ["hero"],
  currentCharacter: "hero",
  ownedWeapons: ["sword"],
  weapon: "sword",
  currentBiome: "dungeon",
  biomesUnlocked: ["dungeon"],
  // per-biome highest level completed (0 means nothing completed yet)
  progress: { dungeon: 0, hell: 0, sakura: 0, ice: 0, tech: 0 },
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem("probability-dungeon-save-v2");
    if (!raw) return { ...DEFAULT, equipped: { ...DEFAULT.equipped }, progress: { ...DEFAULT.progress } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      equipped: { ...DEFAULT.equipped, ...(parsed.equipped || {}) },
      progress: { ...DEFAULT.progress, ...(parsed.progress || {}) },
      ownedItems: parsed.ownedItems || [],
      ownedCharacters: parsed.ownedCharacters || ["hero"],
      ownedWeapons: parsed.ownedWeapons || ["sword"],
      biomesUnlocked: parsed.biomesUnlocked || ["dungeon"],
    };
  } catch {
    return { ...DEFAULT, equipped: { ...DEFAULT.equipped }, progress: { ...DEFAULT.progress } };
  }
};

let state = load();
const listeners = new Set();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };
const emit = () => listeners.forEach((l) => l(state));

export const getState = () => state;
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export const addCoins = (amount) => {
  state = { ...state, coins: Math.max(0, state.coins + amount) };
  persist(); emit();
};

export const buyItem = (item) => {
  if (state.ownedItems.includes(item.id)) return { ok: false, reason: "owned" };
  if (state.coins < item.price) return { ok: false, reason: "broke" };
  state = { ...state, coins: state.coins - item.price, ownedItems: [...state.ownedItems, item.id] };
  persist(); emit();
  return { ok: true };
};

export const equipItem = (item) => {
  if (!state.ownedItems.includes(item.id)) return false;
  state = { ...state, equipped: { ...state.equipped, [item.slot]: item.id } };
  persist(); emit();
  return true;
};

export const unequipSlot = (slot) => {
  state = { ...state, equipped: { ...state.equipped, [slot]: null } };
  persist(); emit();
};

export const buyCharacter = (char) => {
  if (state.ownedCharacters.includes(char.id)) return { ok: false, reason: "owned" };
  if (state.coins < char.price) return { ok: false, reason: "broke" };
  state = { ...state, coins: state.coins - char.price, ownedCharacters: [...state.ownedCharacters, char.id] };
  persist(); emit();
  return { ok: true };
};

export const setCurrentCharacter = (id) => {
  if (!state.ownedCharacters.includes(id)) return false;
  state = { ...state, currentCharacter: id };
  persist(); emit();
  return true;
};

export const addWeapon = (id) => {
  if (state.ownedWeapons.includes(id)) return false;
  state = { ...state, ownedWeapons: [...state.ownedWeapons, id], weapon: id };
  persist(); emit();
  return true;
};

export const setWeapon = (id) => {
  if (!state.ownedWeapons.includes(id)) return;
  state = { ...state, weapon: id };
  persist(); emit();
};

export const setCurrentBiome = (id) => {
  state = { ...state, currentBiome: id };
  persist(); emit();
};

export const unlockBiome = (id) => {
  if (state.biomesUnlocked.includes(id)) return;
  state = { ...state, biomesUnlocked: [...state.biomesUnlocked, id] };
  persist(); emit();
};

// Record level completion. Stores highest level cleared. Auto-unlocks next biome
// when player crosses the threshold (default 5 levels in the current biome).
export const recordLevelClear = (biomeId, level, unlockThreshold = 5, nextBiomeId = null) => {
  const cur = state.progress[biomeId] || 0;
  const newProgress = { ...state.progress, [biomeId]: Math.max(cur, level) };
  let biomesUnlocked = state.biomesUnlocked;
  if (
    nextBiomeId &&
    newProgress[biomeId] >= unlockThreshold &&
    !biomesUnlocked.includes(nextBiomeId)
  ) {
    biomesUnlocked = [...biomesUnlocked, nextBiomeId];
  }
  state = { ...state, progress: newProgress, biomesUnlocked };
  persist(); emit();
};

export const getMaxLevel = (biomeId) => state.progress[biomeId] || 0;

export const resetSave = () => {
  state = { ...DEFAULT, equipped: { ...DEFAULT.equipped }, progress: { ...DEFAULT.progress } };
  persist(); emit();
};

import { useEffect, useState } from "react";
export const useStore = () => {
  const [s, setS] = useState(state);
  useEffect(() => subscribe(setS), []);
  return s;
};
