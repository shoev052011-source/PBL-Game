import React from "react";
import { useStore } from "./store";
import { CHARACTER_BY_ID } from "./characters";
import { BIOME_BY_ID } from "./biomes";

export default function MainHub({ onEnterDungeon, onOpenShop, onOpenCharacter }) {
  const s = useStore();
  const char = CHARACTER_BY_ID[s.currentCharacter] || CHARACTER_BY_ID["hero"];
  const biome = BIOME_BY_ID[s.currentBiome];
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 fade-in" data-testid="main-hub">
      <div className="max-w-3xl w-full text-center">
        <h1 className="pixel-font text-3xl sm:text-5xl lg:text-6xl text-[#f4bf4f] glow-amber mb-3">PROBABILITY</h1>
        <h1 className="pixel-font text-3xl sm:text-5xl lg:text-6xl text-[#ff6ec7] glow-magenta mb-8">DUNGEON</h1>

        <div className="hud-bar inline-flex flex-wrap items-center gap-3 px-5 py-3 mb-10" data-testid="hub-coins">
          <span className="pixel-font text-xs text-[#f4bf4f]">COINS</span>
          <span className="text-2xl text-[#ffd166] glow-amber font-bold">{s.coins}</span>
          <span className="text-[#bba6e0] text-sm">·</span>
          <span className="pixel-font text-xs text-[#9affd6]">{char.name.toUpperCase()}</span>
          <span className="text-[#bba6e0] text-sm">·</span>
          <span className="pixel-font text-xs" style={{ color: biome?.color || "#bba6e0" }}>{biome?.short || "DUNGEON"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <button data-testid="hub-dungeon-btn" onClick={onEnterDungeon} className="btn-pixel">ENTER DUNGEON</button>
          <button data-testid="hub-shop-btn" onClick={onOpenShop} className="btn-pixel">SHOP</button>
          <button data-testid="hub-character-btn" onClick={onOpenCharacter} className="btn-pixel">CHARACTER</button>
        </div>

        <div className="hud-bar inline-block px-6 py-4 text-left text-base text-[#e9d8a6]">
          <div className="pixel-font text-xs text-[#f4bf4f] mb-3">// MAIN HUB</div>
          <div className="text-[#bba6e0] mb-1">Pick a biome on the World Map after pressing <span className="text-[#f4bf4f]">ENTER DUNGEON</span>.</div>
          <div className="text-[#bba6e0] mb-1">Spend coins at the Shop and unlock new heroes in the Character menu.</div>
          <div className="text-[#bba6e0]">Defeat all mobs <span className="text-[#9affd6]">AND</span> complete every robot's puzzle to open the exit door.</div>
        </div>
      </div>
    </div>
  );
}
