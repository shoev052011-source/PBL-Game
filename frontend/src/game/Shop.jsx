import React, { useState, useRef, useEffect } from "react";
import { useStore, buyItem, equipItem } from "./store";
import { CLOTHES } from "./items";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { sfxPickup, sfxWrong } from "./audio";
import { toast } from "sonner";

const CategoryPreview = ({ item, owned, equipped }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    // pixel preview - simple swatch box with item color + trim
    ctx.fillStyle = "#0b0712";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = item.color;
    ctx.fillRect(8, 8, c.width - 16, c.height - 16);
    ctx.fillStyle = item.trim;
    ctx.fillRect(8, 8, c.width - 16, 4);
    ctx.fillRect(8, c.height - 12, c.width - 16, 4);
  }, [item]);
  return (
    <canvas
      ref={ref}
      width={64}
      height={64}
      className="crt"
      style={{
        width: 64,
        height: 64,
        imageRendering: "pixelated",
        border: `2px solid ${equipped ? "#9affd6" : owned ? "#f4bf4f" : "#3a2a52"}`,
      }}
    />
  );
};

export default function Shop({ onBack }) {
  const s = useStore();
  const [tab, setTab] = useState("hat");
  const itemsForTab = CLOTHES.filter((i) => i.slot === tab);

  const handleBuy = (item) => {
    const r = buyItem(item);
    if (r.ok) {
      sfxPickup();
      toast.success(`Bought ${item.name}!`);
    } else {
      sfxWrong();
      toast.error(r.reason === "owned" ? "Already owned." : "Not enough coins.");
    }
  };

  const handleEquip = (item) => {
    if (equipItem(item)) {
      sfxPickup();
      toast.success(`Equipped ${item.name}.`);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 fade-in" data-testid="shop-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="pixel-font text-2xl sm:text-3xl text-[#f4bf4f] glow-amber">// SHOP</h1>
          <div className="flex items-center gap-4">
            <div className="hud-bar px-4 py-2" data-testid="shop-coins">
              <span className="pixel-font text-xs text-[#f4bf4f] mr-2">COINS</span>
              <span className="text-xl text-[#ffd166] glow-amber font-bold">{s.coins}</span>
            </div>
            <button data-testid="shop-back-btn" onClick={onBack} className="btn-pixel btn-exit">BACK</button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-[#1a1326] border border-[#3a2a52]">
            <TabsTrigger value="hat" data-testid="shop-tab-hat" className="pixel-font text-xs">HATS</TabsTrigger>
            <TabsTrigger value="shirt" data-testid="shop-tab-shirt" className="pixel-font text-xs">T-SHIRTS</TabsTrigger>
            <TabsTrigger value="pants" data-testid="shop-tab-pants" className="pixel-font text-xs">PANTS</TabsTrigger>
            <TabsTrigger value="shoes" data-testid="shop-tab-shoes" className="pixel-font text-xs">SHOES</TabsTrigger>
          </TabsList>

          {["hat", "shirt", "pants", "shoes"].map((slot) => (
            <TabsContent key={slot} value={slot} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CLOTHES.filter((i) => i.slot === slot).map((item) => {
                  const owned = s.ownedItems.includes(item.id);
                  const equipped = s.equipped[item.slot] === item.id;
                  return (
                    <div
                      key={item.id}
                      data-testid={`shop-item-${item.id}`}
                      className="hud-bar p-4 flex items-center gap-4"
                    >
                      <CategoryPreview item={item} owned={owned} equipped={equipped} />
                      <div className="flex-1">
                        <div className="text-lg text-[#e9d8a6] font-semibold">{item.name}</div>
                        <div className="text-sm text-[#bba6e0] capitalize">{item.slot}</div>
                        <div className="pixel-font text-xs text-[#ffd166] mt-1">{item.price} COINS</div>
                      </div>
                      {owned ? (
                        <button
                          data-testid={`shop-equip-${item.id}`}
                          onClick={() => handleEquip(item)}
                          className={`btn-pixel ${equipped ? "!bg-[#9affd6] !text-black !border-[#9affd6]" : ""}`}
                        >
                          {equipped ? "WORN" : "EQUIP"}
                        </button>
                      ) : (
                        <button
                          data-testid={`shop-buy-${item.id}`}
                          onClick={() => handleBuy(item)}
                          disabled={s.coins < item.price}
                          className="btn-pixel disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          BUY
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
