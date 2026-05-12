import React, { useEffect, useRef } from "react";
import { useStore, equipItem, unequipSlot, setCurrentCharacter, buyCharacter } from "./store";
import { CLOTHES } from "./items";
import { CHARACTERS } from "./characters";
import { drawPlayer } from "./sprites";
import { sfxPickup, sfxWrong } from "./audio";
import { toast } from "sonner";

const PreviewCanvas = ({ character, outfit }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0b0712";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#1a1326";
    ctx.fillRect(20, c.height - 24, c.width - 40, 16);
    ctx.fillStyle = "#3a2a52";
    ctx.fillRect(24, c.height - 22, c.width - 48, 2);
    const SIZE = 144;
    drawPlayer(ctx, (c.width - SIZE) / 2, (c.height - SIZE) / 2 - 6, SIZE, "down", false, false, { character, outfit });
  }, [character, outfit]);
  return (
    <canvas
      ref={ref}
      width={240}
      height={260}
      className="crt"
      style={{ imageRendering: "pixelated", border: "2px solid #3a2a52", background: "#0b0712" }}
      data-testid="character-preview"
    />
  );
};

// Mini character thumbnail used in the roster grid
const CharThumb = ({ char, outfit, selected, owned }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = selected ? "#1a3325" : "#120c1f";
    ctx.fillRect(0, 0, c.width, c.height);
    const SIZE = 72;
    // Locked characters render with dim alpha
    ctx.globalAlpha = owned ? 1 : 0.35;
    drawPlayer(ctx, (c.width - SIZE) / 2, (c.height - SIZE) / 2 + 2, SIZE, "down", false, false, { character: char.id, outfit });
    ctx.globalAlpha = 1;
    if (!owned) {
      // lock overlay
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#f4bf4f";
      ctx.fillRect(c.width / 2 - 4, c.height / 2 + 4, 8, 6);
      ctx.fillRect(c.width / 2 - 3, c.height / 2 - 0, 6, 6);
    }
  }, [char, outfit, selected, owned]);
  return (
    <canvas
      ref={ref}
      width={104}
      height={104}
      style={{
        imageRendering: "pixelated",
        border: `2px solid ${selected ? "#9affd6" : owned ? "#f4bf4f" : "#3a2a52"}`,
      }}
    />
  );
};

export default function CharacterScreen({ onBack }) {
  const s = useStore();
  const currentChar = CHARACTERS.find((c) => c.id === s.currentCharacter) || CHARACTERS[0];

  const handleSelect = (char) => {
    if (!s.ownedCharacters.includes(char.id)) {
      // attempt to buy
      const r = buyCharacter(char);
      if (r.ok) {
        setCurrentCharacter(char.id);
        sfxPickup();
        toast.success(`Unlocked ${char.name}!`);
      } else {
        sfxWrong();
        toast.error(r.reason === "broke" ? `Need ${char.price} coins to unlock.` : "Already owned.");
      }
    } else {
      setCurrentCharacter(char.id);
      sfxPickup();
      toast.success(`Now playing as ${char.name}.`);
    }
  };

  const handleEquip = (item) => {
    if (equipItem(item)) {
      sfxPickup();
      toast.success(`Equipped ${item.name}.`);
    } else {
      toast.error("You don't own this item yet.");
    }
  };

  const handleUnequip = (slot) => { unequipSlot(slot); sfxPickup(); };

  const ownedClothes = CLOTHES.filter((i) => s.ownedItems.includes(i.id));
  const slots = ["hat", "shirt", "pants", "shoes"];

  return (
    <div className="min-h-screen px-6 py-10 fade-in" data-testid="character-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl text-[#9affd6] glow-cyan">// CHARACTER</h1>
          <div className="flex items-center gap-3">
            <div className="hud-bar px-4 py-2">
              <span className="pixel-font text-xs text-[#f4bf4f] mr-2">COINS</span>
              <span className="text-xl text-[#ffd166] glow-amber font-bold">{s.coins}</span>
            </div>
            <button data-testid="character-back-btn" onClick={onBack} className="btn-pixel btn-exit">BACK</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="hud-bar p-5 flex flex-col items-center gap-4">
            <PreviewCanvas character={s.currentCharacter} outfit={s.equipped} />
            <div className="w-full text-center">
              <div className="pixel-font text-sm text-[#f4bf4f] glow-amber">{currentChar.name.toUpperCase()}</div>
              <div className="text-xs text-[#bba6e0] mt-1">{currentChar.tagline}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="pixel-font text-xs text-[#f4bf4f] mb-3">// ROSTER ({s.ownedCharacters.length} / {CHARACTERS.length})</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3">
                {CHARACTERS.map((char) => {
                  const owned = s.ownedCharacters.includes(char.id);
                  const selected = s.currentCharacter === char.id;
                  const canAfford = s.coins >= char.price;
                  return (
                    <button
                      key={char.id}
                      data-testid={`char-${char.id}`}
                      onClick={() => handleSelect(char)}
                      disabled={!owned && !canAfford}
                      className="text-center hover:-translate-y-0.5 transition-transform disabled:opacity-50"
                    >
                      <CharThumb char={char} outfit={s.equipped} selected={selected} owned={owned} />
                      <div className="text-xs mt-1 text-[#e9d8a6]">{char.name}</div>
                      {!owned && (
                        <div className="text-xs text-[#ffd166] pixel-font">{char.price}c</div>
                      )}
                      {selected && owned && (
                        <div className="text-xs text-[#9affd6] pixel-font">EQUIPPED</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="pixel-font text-xs text-[#f4bf4f] mb-3">// WARDROBE</div>
              {ownedClothes.length === 0 ? (
                <div className="hud-bar p-6 text-center text-[#bba6e0]">
                  Your wardrobe is empty. Visit the <span className="text-[#f4bf4f]">SHOP</span> to buy clothes!
                </div>
              ) : (
                <div className="space-y-4">
                  {slots.map((slot) => {
                    const slotItems = ownedClothes.filter((i) => i.slot === slot);
                    return (
                      <div key={slot} className="hud-bar p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="pixel-font text-xs text-[#9affd6] uppercase">{slot}</div>
                          {s.equipped[slot] && (
                            <button
                              data-testid={`unequip-${slot}`}
                              onClick={() => handleUnequip(slot)}
                              className="text-xs text-[#ff6ec7] underline"
                            >unequip</button>
                          )}
                        </div>
                        {slotItems.length === 0 ? (
                          <div className="text-xs text-[#bba6e0]">No {slot} items owned.</div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {slotItems.map((item) => {
                              const equipped = s.equipped[item.slot] === item.id;
                              return (
                                <button
                                  key={item.id}
                                  data-testid={`wardrobe-item-${item.id}`}
                                  onClick={() => handleEquip(item)}
                                  className={`p-2 text-left ${equipped ? "border-2 border-[#9affd6]" : "border-2 border-[#3a2a52]"}`}
                                  style={{ background: "#120c1f" }}
                                >
                                  <div className="w-full h-10 mb-1" style={{ background: item.color, borderTop: `4px solid ${item.trim}` }} />
                                  <div className="text-xs text-[#e9d8a6]">{item.name}</div>
                                  <div className="text-xs text-[#bba6e0]">{equipped ? "WEARING" : "wear"}</div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
