import React from "react";
import { useStore, setCurrentBiome } from "./store";
import { BIOMES } from "./biomes";
import { sfxPickup, sfxWrong } from "./audio";
import { toast } from "sonner";

const BiomeThumb = ({ biome }) => (
  <div className="w-full h-24 relative overflow-hidden border-2 border-[#3a2a52]" style={{ background: biome.floor[0] }}>
    {/* tile pattern */}
    <div className="absolute inset-0 grid grid-cols-8 grid-rows-3">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{ background: biome.floor[i % 4] }} />
      ))}
    </div>
    {/* wall strip */}
    <div className="absolute left-0 right-0 top-0 h-3" style={{ background: biome.wallBase }} />
    <div className="absolute left-0 right-0 bottom-0 h-1" style={{ background: biome.floorTrim }} />
    {/* accent */}
    <div className="absolute inset-0" style={{ background: biome.accentTint }} />
    {/* name overlay */}
    <div className="absolute bottom-1 left-2 right-2 flex justify-between items-end">
      <span className="pixel-font text-xs" style={{ color: biome.accent }}>{biome.short}</span>
      <span className="pixel-font text-[10px] text-[#bba6e0]">T{biome.mathTier}</span>
    </div>
  </div>
);

export default function BiomeSelect({ onPick, onBack }) {
  const s = useStore();

  const handlePick = (biome) => {
    const unlocked = s.biomesUnlocked.includes(biome.id);
    if (!unlocked) {
      sfxWrong();
      toast.error(`Clear the previous biome to unlock ${biome.name}.`);
      return;
    }
    setCurrentBiome(biome.id);
    sfxPickup();
    onPick(biome.id);
  };

  return (
    <div className="min-h-screen px-6 py-10 fade-in" data-testid="biome-select">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl text-[#f4bf4f] glow-amber">// WORLD MAP</h1>
          <button data-testid="biome-back-btn" onClick={onBack} className="btn-pixel btn-exit">BACK</button>
        </div>

        <p className="text-[#bba6e0] mb-6 text-base">Choose a biome. Each one ramps the math difficulty and introduces new mobs.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BIOMES.map((biome, i) => {
            const unlocked = s.biomesUnlocked.includes(biome.id);
            const isCurrent = s.currentBiome === biome.id;
            return (
              <button
                key={biome.id}
                data-testid={`biome-${biome.id}`}
                onClick={() => handlePick(biome)}
                disabled={!unlocked}
                className={`hud-bar text-left p-4 transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${isCurrent ? "ring-2 ring-[#9affd6]" : ""}`}
              >
                <BiomeThumb biome={biome} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="pixel-font text-sm" style={{ color: biome.color }}>{biome.name.toUpperCase()}</span>
                  <span className="text-xs text-[#bba6e0]">#{i + 1}</span>
                </div>
                <div className="text-xs text-[#bba6e0] mt-1">{biome.description}</div>
                <div className="text-xs text-[#ffd166] mt-2 pixel-font">
                  {biome.mathTier === 0 && "ARITHMETIC"}
                  {biome.mathTier === 1 && "MULT / DIV"}
                  {biome.mathTier === 2 && "FRACTIONS"}
                  {biome.mathTier === 3 && "PERCENTAGES"}
                  {biome.mathTier === 4 && "ALGEBRA + PROBABILITY"}
                  {!unlocked && <span className="ml-2 text-[#ff6ec7]">// LOCKED</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
