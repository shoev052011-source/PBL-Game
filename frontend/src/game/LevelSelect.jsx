import React, { useState } from "react";
import { useStore } from "./store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { sfxPickup, sfxWrong } from "./audio";
import { toast } from "sonner";

const LEVELS_PER_BIOME = 15;

const Lock = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
    <path d="M12 2a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 9V7a3 3 0 1 1 6 0v4H9z"/>
  </svg>
);
const Star = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
    <path d="M12 2l2.95 6.97L22 10l-5 4.55L18.18 22 12 18.27 5.82 22 7 14.55 2 10l7.05-1.03L12 2z"/>
  </svg>
);

const difficultyLabel = (lvl) => {
  if (lvl <= 5) return "EASY";
  if (lvl <= 10) return "MEDIUM";
  return "HARD";
};

const difficultyHint = (biomeTier, lvl) => {
  const tierHints = [
    ["Addition & subtraction", "2-digit arithmetic", "3-term expressions"], // tier 0
    ["Times tables", "2-digit × 1-digit", "Division with remainders"],      // tier 1
    ["Same-denominator", "Mixed denominators", "Fraction multiplication"],   // tier 2
    ["Simple percentages", "Mixed percentages", "Decimal multiplication"],   // tier 3
    ["Linear x+a=b", "2x+a=b", "x² & complex probability"],                 // tier 4
  ];
  const subT = lvl <= 5 ? 0 : lvl <= 10 ? 1 : 2;
  return tierHints[biomeTier]?.[subT] || "";
};

/**
 * LevelSelect — opened from BiomeSelect when a biome card is clicked.
 * Props:
 *   biome — full biome object
 *   open — bool
 *   onClose() — go back
 *   onStart(level) — start the chosen level
 */
export default function LevelSelect({ biome, open, onClose, onStart }) {
  const s = useStore();
  const [picked, setPicked] = useState(null);
  if (!biome) return null;

  const maxCleared = s.progress[biome.id] || 0;
  // Sequential: levels 1..(maxCleared+1) are playable; rest locked
  const isLocked = (lvl) => lvl > maxCleared + 1;
  const isCompleted = (lvl) => lvl <= maxCleared;
  const isCurrent = (lvl) => lvl === maxCleared + 1;

  const handlePick = (lvl) => {
    if (isLocked(lvl)) {
      sfxWrong();
      toast.error(`Locked. Beat level ${lvl - 1} first.`);
      return;
    }
    sfxPickup();
    setPicked(lvl);
  };

  const handleStart = () => {
    if (!picked) {
      toast.error("Pick a level first.");
      return;
    }
    onStart(picked);
  };

  // biome-themed accent values
  const accentBg = biome.id === "hell" ? "rgba(255,110,42,0.10)"
    : biome.id === "sakura" ? "rgba(255,110,199,0.10)"
    : biome.id === "ice" ? "rgba(154,255,214,0.10)"
    : biome.id === "tech" ? "rgba(58,138,204,0.10)"
    : "rgba(180,140,255,0.08)";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        data-testid="level-select"
        className="max-w-2xl bg-[#0c0814] text-[#e9d8a6]"
        style={{ border: `2px solid ${biome.color}`, boxShadow: `0 0 40px ${accentBg}` }}
      >
        <DialogHeader>
          <DialogTitle className="pixel-font text-base sm:text-lg" style={{ color: biome.color, textShadow: `0 0 12px ${biome.color}66` }}>
            {biome.short} // LEVELS
          </DialogTitle>
          <DialogDescription className="text-[#bba6e0] text-sm">
            {biome.description} Pick a level to play. Difficulty ramps from Level 1 (easy) to Level 15 (hard).
          </DialogDescription>
        </DialogHeader>

        <div className="px-1 pt-2 pb-1 flex items-center justify-between text-sm">
          <span className="pixel-font text-xs" style={{ color: biome.accent }}>PROGRESS</span>
          <span className="text-[#bba6e0]">
            <span className="text-[#f4bf4f] font-bold">{maxCleared}</span> / {LEVELS_PER_BIOME} cleared
          </span>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-5 gap-3 my-2" data-testid="level-grid">
          {Array.from({ length: LEVELS_PER_BIOME }).map((_, i) => {
            const lvl = i + 1;
            const locked = isLocked(lvl);
            const done = isCompleted(lvl);
            const current = isCurrent(lvl);
            const isPicked = picked === lvl;

            // states: completed=Gold, current/picked=White-ish, locked=Grey
            let bg, border, color, label;
            if (locked) {
              bg = "#1a1326"; border = "#3a2a52"; color = "#5a5070"; label = <Lock />;
            } else if (done) {
              bg = isPicked ? "#f4bf4f" : "#3a2a14";
              border = "#f4bf4f";
              color = isPicked ? "#0c0814" : "#f4bf4f";
              label = (
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">{lvl}</span>
                  <span className="opacity-80"><Star /></span>
                </div>
              );
            } else if (current) {
              // next playable, never-cleared — white/cyan
              bg = isPicked ? "#e9f5ff" : "#0e1f3a";
              border = "#9affd6";
              color = isPicked ? "#0c0814" : "#e9f5ff";
              label = <span className="text-base font-bold">{lvl}</span>;
            } else {
              bg = "#0e1f3a"; border = "#3a2a52"; color = "#bba6e0";
              label = <span className="text-base font-bold">{lvl}</span>;
            }

            return (
              <button
                key={lvl}
                data-testid={`level-${lvl}`}
                onClick={() => handlePick(lvl)}
                disabled={locked}
                className={`aspect-square flex items-center justify-center pixel-font text-sm transition-transform ${!locked ? "hover:-translate-y-0.5" : "cursor-not-allowed"}`}
                style={{
                  background: bg,
                  color,
                  border: `2px solid ${border}`,
                  boxShadow: isPicked ? `0 0 12px ${biome.color}` : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Selected level summary */}
        <div className="hud-bar p-3 mt-2" data-testid="level-summary">
          {picked ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="pixel-font text-xs" style={{ color: biome.color }}>
                  LEVEL {picked} · {difficultyLabel(picked)}
                </div>
                <div className="text-sm text-[#bba6e0]">{difficultyHint(biome.mathTier, picked)}</div>
              </div>
              <div className="text-xs text-[#9affd6]">
                {isCompleted(picked) ? "REPLAY · earn coins again" : "FIRST CLEAR"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#bba6e0]">Tap a level above to see details, then press <span className="text-[#f4bf4f]">START LEVEL</span>.</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-3">
          <button data-testid="level-cancel-btn" onClick={onClose} className="btn-pixel btn-exit">CANCEL</button>
          <button
            data-testid="start-level-btn"
            onClick={handleStart}
            disabled={!picked}
            className="btn-pixel disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: biome.color,
              color: biome.color,
              boxShadow: `0 0 0 2px #0b0a13, 4px 4px 0 0 ${biome.color}44`,
            }}
          >
            START LEVEL
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { LEVELS_PER_BIOME };
