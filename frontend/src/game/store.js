// localStorage-backed save (coins, ownedItems, equipped, ownedCharacters, currentCharacter, currentBiome, owned/current weapon).

const KEY = "probability-dungeon-save-v2";

const DEFAULT = {
  coins: 0,
  ownedItems: [],
  equipped: { hat: null, shirt: null, pants: null, shoes: null },
  ownedCharacters: ["hero"],
  currentCharacter: "hero",
  ownedWeapons: ["sword"],
  weapon: "sword",
  currentBiome: "dungeon",
  biomesUnlocked: ["dungeon"], // unlocked after first clear of previous biome
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, equipped: { ...DEFAULT.equipped } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...parsed,
      equipped: { ...DEFAULT.equipped, ...(parsed.equipped || {}) },
      ownedItems: parsed.ownedItems || [],
      ownedCharacters: parsed.ownedCharacters || ["hero"],
      ownedWeapons: parsed.ownedWeapons || ["sword"],
      biomesUnlocked: parsed.biomesUnlocked || ["dungeon"],
    };
  } catch {
    return { ...DEFAULT, equipped: { ...DEFAULT.equipped } };
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

export const resetSave = () => {
  state = { ...DEFAULT, equipped: { ...DEFAULT.equipped } };
  persist(); emit();
};

import { useEffect, useState } from "react";
export const useStore = () => {
  const [s, setS] = useState(state);
  useEffect(() => subscribe(setS), []);
  return s;
};
