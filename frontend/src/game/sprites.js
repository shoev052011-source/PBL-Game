// Programmatic pixel-art sprites + biome-aware tiles + mob variants + accessories.

import { ITEM_BY_ID } from "./items";
import { CHARACTER_BY_ID } from "./characters";

// ===== Biome floor/wall =====
// Floor: stone-brick base with random "cracked" variations; biome-specific reskins
// (obsidian for hell, wood-plank for sakura, ice block, metal+circuit for tech).
export const drawFloorTile = (ctx, x, y, size, variant, biome, t = 0) => {
  const v = variant % 4;
  const cracked = (variant * 13) % 7 === 0; // ~14% chance
  const id = biome?.id || "dungeon";

  if (id === "hell") {
    // Obsidian floor with red veins + occasional lava strip
    const bases = ["#1a0a0a", "#220606", "#0e0202", "#2a0808"];
    ctx.fillStyle = bases[v];
    ctx.fillRect(x, y, size, size);
    // mortar
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y + size - 1, size, 1);
    ctx.fillRect(x + size - 1, y, 1, size);
    // glassy highlight
    ctx.fillStyle = "rgba(255, 110, 42, 0.05)";
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
    // red veins
    if (variant % 5 === 0) {
      ctx.fillStyle = "#7a1a0a";
      ctx.fillRect(x + 4, y + size / 2, size - 10, 1);
    }
    // animated lava strip (every 3rd row column-wise)
    if (variant % 9 === 0) {
      const flicker = Math.floor(Math.sin(t / 220 + variant) * 1);
      ctx.fillStyle = "#ff6e2a";
      ctx.fillRect(x + 3, y + size - 7 + flicker, size - 6, 2);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(x + 5, y + size - 6 + flicker, size - 10, 1);
    }
    return;
  }

  if (id === "sakura") {
    // Light wood plank floor with grain
    const bases = ["#c89a6a", "#b88656", "#d4a878", "#a87a4a"];
    ctx.fillStyle = bases[v];
    ctx.fillRect(x, y, size, size);
    // plank seams (horizontal)
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
    ctx.fillRect(x, y + size - 1, size, 1);
    // grain
    ctx.fillStyle = "rgba(80, 50, 20, 0.25)";
    ctx.fillRect(x + 4, y + 4, size - 8, 1);
    ctx.fillRect(x + 2, y + size / 2 + 4, size - 4, 1);
    // pink dust speckle
    if (variant % 6 === 0) {
      ctx.fillStyle = "rgba(255, 110, 199, 0.5)";
      ctx.fillRect(x + 6, y + 8, 2, 2);
    }
    return;
  }

  if (id === "ice") {
    const bases = ["#5a8acc", "#3a6aaa", "#7aaaee", "#2a4a7a"];
    ctx.fillStyle = bases[v];
    ctx.fillRect(x, y, size, size);
    // ice block edges (highlight top-left, dark bottom-right)
    ctx.fillStyle = "rgba(232, 244, 255, 0.5)";
    ctx.fillRect(x + 1, y + 1, size - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, size - 2);
    ctx.fillStyle = "rgba(20, 47, 74, 0.6)";
    ctx.fillRect(x + 1, y + size - 2, size - 2, 1);
    ctx.fillRect(x + size - 2, y + 1, 1, size - 2);
    // crystal shine
    if (cracked) {
      ctx.fillStyle = "#e8f4ff";
      ctx.fillRect(x + 6, y + 6, 3, 1);
      ctx.fillRect(x + 7, y + 5, 1, 1);
    }
    return;
  }

  if (id === "tech") {
    const bases = ["#0e1f3a", "#0a1a2a", "#142a44", "#06121f"];
    ctx.fillStyle = bases[v];
    ctx.fillRect(x, y, size, size);
    // metal panel seam
    ctx.fillStyle = "#040810";
    ctx.fillRect(x, y + size - 1, size, 1);
    ctx.fillRect(x + size - 1, y, 1, size);
    // circuit trace
    if (variant % 4 === 0) {
      ctx.fillStyle = "#9affd6";
      ctx.fillRect(x + 4, y + size / 2, size - 8, 1);
      ctx.fillRect(x + size / 2, y + 4, 1, size / 2 - 2);
    }
    // tiny LED
    if (variant % 7 === 0) {
      ctx.fillStyle = Math.floor(t / 400 + variant) % 2 === 0 ? "#ff3a6f" : "#9affd6";
      ctx.fillRect(x + size - 6, y + 4, 2, 2);
    }
    return;
  }

  // ===== Default: stone brick (Ancient Dungeon) =====
  // Brick layout: 2 rows, staggered. Within each "brick", apply variant tint.
  const bases = ["#3a3850", "#332f48", "#403d56", "#2b2a40"];
  const main = bases[v];
  ctx.fillStyle = main;
  ctx.fillRect(x, y, size, size);
  // brick mortar (horizontal middle + side edges)
  ctx.fillStyle = "#1a1726";
  ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
  ctx.fillRect(x, y + size - 1, size, 1);
  ctx.fillRect(x + size - 1, y, 1, size);
  // brick split (staggered) — vertical mortar at different positions on top/bottom row
  const topSplit = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? Math.floor(size / 2) : 0;
  if (topSplit > 0) ctx.fillRect(x + topSplit, y, 1, Math.floor(size / 2));
  const botSplit = topSplit === 0 ? Math.floor(size / 2) : Math.floor(size * 0.25);
  ctx.fillRect(x + botSplit, y + Math.floor(size / 2), 1, Math.floor(size / 2));
  // top highlight
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x + 1, y + 1, size - 2, 1);
  // cracked-tile variations (chunky, biome-readable cracks + mossy patches)
  if (cracked) {
    ctx.fillStyle = "#13101e";
    ctx.fillRect(x + 3, y + 6, 6, 1);
    ctx.fillRect(x + 5, y + 7, 1, 4);
    ctx.fillRect(x + 6, y + 10, 4, 1);
    ctx.fillRect(x + size - 12, y + size - 11, 7, 1);
    ctx.fillRect(x + size - 10, y + size - 14, 1, 4);
    // moss / lichen accent
    ctx.fillStyle = "rgba(122, 200, 110, 0.35)";
    ctx.fillRect(x + 3, y + 6, 2, 1);
    ctx.fillRect(x + size - 12, y + size - 11, 2, 1);
  }
  // small rune speckles
  if (variant % 5 === 0) {
    ctx.fillStyle = "rgba(190,160,255,0.18)";
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillRect(x + size - 7, y + size - 9, 1, 1);
    ctx.fillRect(x + size / 2 - 2, y + 3, 1, 1);
  }
};

export const drawWallTile = (ctx, x, y, size, biome) => {
  const id = biome?.id || "dungeon";
  // 3D shading: lighter top, darker bottom — across ALL biomes
  let base, light, dark, edge, seam;
  if (id === "hell") {
    base = "#5a0a0a"; light = "#a8331a"; dark = "#1a0202"; edge = "#7a1a0a"; seam = "#000000";
  } else if (id === "sakura") {
    base = "#4aa05a"; light = "#9affb0"; dark = "#1f4a26"; edge = "#5aaa6a"; seam = "#0e2a14";
  } else if (id === "ice") {
    base = "#7aaaee"; light = "#e8f4ff"; dark = "#1f3a5a"; edge = "#a8ccee"; seam = "#0a1a2a";
  } else if (id === "tech") {
    base = "#2a4a6a"; light = "#5aaaee"; dark = "#040810"; edge = "#3a8acc"; seam = "#000000";
  } else {
    base = "#4a3a6a"; light = "#7a5a9a"; dark = "#1a0e2a"; edge = "#6a4a8a"; seam = "#161024";
  }
  // body
  ctx.fillStyle = base;
  ctx.fillRect(x, y, size, size);
  // top highlight (lighter)
  ctx.fillStyle = light;
  ctx.fillRect(x, y, size, 4);
  ctx.fillRect(x + 1, y + 4, size - 2, 1);
  // side highlight
  ctx.fillStyle = edge;
  ctx.fillRect(x, y, 2, size - 6);
  // bottom shadow (darker, longer)
  ctx.fillStyle = dark;
  ctx.fillRect(x, y + size - 6, size, 6);
  ctx.fillStyle = seam;
  ctx.fillRect(x, y + size - 1, size, 1);
  // brick mortar mid
  ctx.fillStyle = seam;
  ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
  // vertical brick splits (staggered)
  const splitTop = (Math.floor(x / size) % 2 === 0) ? Math.floor(size / 2) : Math.floor(size * 0.25);
  ctx.fillRect(x + splitTop, y, 1, Math.floor(size / 2));
  const splitBot = splitTop === Math.floor(size / 2) ? Math.floor(size * 0.25) : Math.floor(size * 0.75);
  ctx.fillRect(x + splitBot, y + Math.floor(size / 2), 1, Math.floor(size / 2));
  // biome accents
  if (id === "sakura") {
    // bamboo segments
    ctx.fillStyle = "#aaeb6a";
    ctx.fillRect(x + 6, y + 6, 2, size - 12);
    ctx.fillRect(x + size - 8, y + 6, 2, size - 12);
    ctx.fillStyle = "#0e2a14";
    ctx.fillRect(x + 6, y + Math.floor(size / 2), 2, 1);
    ctx.fillRect(x + size - 8, y + Math.floor(size * 0.7), 2, 1);
  } else if (id === "hell") {
    // glowing crack
    ctx.fillStyle = "#ff6e2a";
    ctx.fillRect(x + Math.floor(size / 2), y + 8, 1, size - 18);
  } else if (id === "tech") {
    // neon wire seam
    ctx.fillStyle = "#9affd6";
    ctx.fillRect(x + 4, y + size - 9, size - 8, 1);
  }
};

export const drawDoorTile = (ctx, x, y, size, locked) => {
  ctx.fillStyle = locked ? "#2a0e1a" : "#2a1f10";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = locked ? "#ff3a6f" : "#f4bf4f";
  ctx.fillRect(x + 6, y + 8, size - 12, size - 10);
  ctx.fillRect(x + 8, y + 4, size - 16, 4);
  ctx.fillStyle = "#0b0a13";
  ctx.fillRect(x + size - 12, y + size - 14, 2, 2);
  if (locked) {
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(x + 6, y + 14, size - 12, 2);
    ctx.fillRect(x + 6, y + 20, size - 12, 2);
  }
};

export const drawPillar = (ctx, x, y, size, biome) => {
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x + 3, y + size - 3, size - 6, 3);
  ctx.fillStyle = biome?.pillarColor || "#4a3a6a";
  ctx.fillRect(x + 4, y + 2, size - 8, size - 6);
  ctx.fillStyle = biome?.pillarHighlight || "#5a4a82";
  ctx.fillRect(x + 4, y + 2, 2, size - 6);
  ctx.fillStyle = biome?.pillarShade || "#2a1a3a";
  ctx.fillRect(x + size - 6, y + 2, 2, size - 6);
  ctx.fillStyle = biome?.pillarHighlight || "#6a5a92";
  ctx.fillRect(x + 2, y, size - 4, 4);
  ctx.fillStyle = biome?.pillarShade || "#3a2a52";
  ctx.fillRect(x + 2, y + 4, size - 4, 1);
  ctx.fillStyle = biome?.pillarHighlight || "#6a5a92";
  ctx.fillRect(x + 2, y + size - 5, size - 4, 3);
  // Hell: glowing crack
  if (biome?.id === "hell") {
    ctx.fillStyle = "#ff6e2a";
    ctx.fillRect(x + size / 2, y + 6, 1, size - 14);
  } else if (biome?.id === "tech") {
    ctx.fillStyle = "#9affd6";
    ctx.fillRect(x + size / 2 - 1, y + 6, 2, 2);
    ctx.fillRect(x + size / 2 - 1, y + size - 10, 2, 2);
  }
};

export const drawPit = (ctx, x, y, size, biome, t = 0) => {
  if (biome?.id === "hell") {
    // Lava pool with bubble animation
    ctx.fillStyle = "#220606";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = "#ff6e2a";
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    ctx.fillStyle = "#ffd166";
    const off = Math.floor((t / 200) % 4);
    ctx.fillRect(x + 6 + off, y + 8, 2, 2);
    ctx.fillRect(x + size - 10 - off, y + size - 12, 2, 2);
  } else if (biome?.id === "ice") {
    ctx.fillStyle = "#0a1a2a";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = "#3a5a7a";
    ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    ctx.fillStyle = "#cce2f4";
    ctx.fillRect(x + 9, y + 10, 3, 1);
  } else if (biome?.id === "tech") {
    // Laser hazard pad
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = "#3a8acc";
    ctx.fillRect(x + 4, y + size / 2 - 1, size - 8, 2);
    ctx.fillStyle = `rgba(255, 60, 110, ${0.5 + Math.sin(t / 150) * 0.4})`;
    ctx.fillRect(x + 6, y + size / 2, size - 12, 1);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    ctx.fillStyle = "#3a2a52";
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
  }
};

// ===== Chest =====
export const drawChest = (ctx, x, y, size, opened = false, tier = 1) => {
  const s = size / 16;
  const px = (px2, py, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + px2 * s, y + py * s, w * s, h * s); };
  const tierBody = ["#7a4a1a", "#7a4a1a", "#6a4a8a", "#a8770e", "#8a1a8a"];
  const tierTrim = ["#a8732a", "#a8732a", "#aa77cc", "#f4bf4f", "#ff6ec7"];
  const body = tierBody[Math.min(tier, tierBody.length - 1)];
  const trim = tierTrim[Math.min(tier, tierTrim.length - 1)];
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x + 2 * s, y + 14 * s, 12 * s, 2 * s);
  px(2, 8, 12, 6, body);
  px(2, 13, 12, 1, "#3a1f0a");
  px(2, 8, 12, 1, trim);
  px(2, 10, 12, 1, "#3a1f0a");
  px(7, 8, 2, 6, "#3a1f0a");
  if (opened) {
    px(2, 4, 12, 4, body);
    px(2, 4, 12, 1, trim);
    px(2, 7, 12, 1, "#3a1f0a");
    px(5, 9, 6, 3, "#1a0a14");
    px(6, 10, 1, 1, "#ffd166");
    px(8, 10, 1, 1, "#ffd166");
    px(10, 10, 1, 1, "#ffd166");
  } else {
    px(2, 6, 12, 4, body);
    px(2, 6, 12, 1, trim);
    px(2, 9, 12, 1, "#3a1f0a");
    px(7, 7, 2, 3, trim);
    px(7, 8, 2, 1, "#0b0a13");
  }
  // Tier indicator dot
  if (tier >= 3) {
    px(3, 6, 1, 1, "#ffffff");
  }
};

// ===== Player (layered: base char + pants + shirt + hat + accessory) =====
// opts: { character, outfit, weapon }
export const drawPlayer = (ctx, x, y, size, dir = "down", swing = false, hurtFlash = false, opts = {}) => {
  const s = size / 16;
  const px = (px2, py, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + px2 * s, y + py * s, w * s, h * s); };

  const charId = opts.character || "hero";
  const char = CHARACTER_BY_ID[charId] || CHARACTER_BY_ID["hero"];
  const outfit = opts.outfit || {};
  const hat = outfit.hat ? ITEM_BY_ID[outfit.hat] : null;
  const shirt = outfit.shirt ? ITEM_BY_ID[outfit.shirt] : null;
  const pants = outfit.pants ? ITEM_BY_ID[outfit.pants] : null;
  const shoes = outfit.shoes ? ITEM_BY_ID[outfit.shoes] : null;
  const weapon = opts.weapon || { color: "#ffd166" };

  const skin = hurtFlash ? "#ffe7e7" : char.skin;
  const hair = char.hair;
  const sShirt = hurtFlash ? "#ff8888" : (shirt?.color || char.shirt);
  const sShirtTrim = shirt?.trim || char.shirtShade;
  const sPants = pants?.color || char.pants;
  const sPantsTrim = pants?.trim || char.pantsShade;
  const sShoe = shoes?.color || char.shoes;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);

  // Layer 1: shoes
  px(5, 14, 2, 1, sShoe);
  px(9, 14, 2, 1, sShoe);
  // Layer 2: pants
  px(5, 12, 2, 2, sPants);
  px(9, 12, 2, 2, sPants);
  px(5, 13, 2, 1, sPantsTrim);
  px(9, 13, 2, 1, sPantsTrim);
  // Layer 3: shirt (torso)
  px(4, 7, 8, 5, sShirt);
  px(4, 11, 8, 1, sShirtTrim);
  px(4, 7, 1, 5, sShirtTrim);
  px(11, 7, 1, 5, sShirtTrim);
  px(4, 10, 8, 1, "#f4bf4f");
  // Arms
  px(3, 8, 1, 3, skin);
  px(12, 8, 1, 3, skin);
  // Head
  px(5, 3, 6, 4, skin);
  // Hair
  const hatShape = hat?.shape;
  if (hatShape !== "helm" && hatShape !== "crown") {
    px(5, 2, 6, 1, hair);
    px(4, 3, 1, 2, hair);
    px(11, 3, 1, 2, hair);
  }
  // Eyes
  if (dir === "left") { px(6, 5, 1, 1, "#0b0a13"); px(8, 5, 1, 1, "#0b0a13"); }
  else if (dir === "right") { px(7, 5, 1, 1, "#0b0a13"); px(9, 5, 1, 1, "#0b0a13"); }
  else if (dir === "up") { px(6, 4, 1, 1, "#0b0a13"); px(9, 4, 1, 1, "#0b0a13"); }
  else { px(6, 5, 1, 1, "#0b0a13"); px(9, 5, 1, 1, "#0b0a13"); }

  // Character accessory (drawn over head, under hat)
  switch (char.accessory) {
    case "halo":
      ctx.fillStyle = "#ffe066";
      ctx.fillRect(x + 5 * s, y + 0 * s, 6 * s, 1 * s);
      ctx.fillRect(x + 4 * s, y + 1 * s, 1 * s, 1 * s);
      ctx.fillRect(x + 11 * s, y + 1 * s, 1 * s, 1 * s);
      break;
    case "fangs":
      px(6, 6, 1, 1, "#ffffff");
      px(9, 6, 1, 1, "#ffffff");
      break;
    case "mask-red":
      px(5, 5, 6, 1, "#7a1a2a");
      break;
    case "ears-wolf":
      px(4, 1, 2, 2, hair);
      px(10, 1, 2, 2, hair);
      px(5, 2, 1, 1, "#ff6e2a");
      px(10, 2, 1, 1, "#ff6e2a");
      break;
    case "antlers":
      ctx.fillStyle = "#a8770e";
      ctx.fillRect(x + 4 * s, y + 0 * s, 1 * s, 2 * s);
      ctx.fillRect(x + 3 * s, y + 0 * s, 1 * s, 1 * s);
      ctx.fillRect(x + 11 * s, y + 0 * s, 1 * s, 2 * s);
      ctx.fillRect(x + 12 * s, y + 0 * s, 1 * s, 1 * s);
      break;
    case "plume-blue":
      ctx.fillStyle = "#3a8acc";
      ctx.fillRect(x + 7 * s, y + 0 * s, 1 * s, 2 * s);
      ctx.fillRect(x + 8 * s, y + 0 * s, 1 * s, 2 * s);
      break;
    case "vial-green":
      ctx.fillStyle = "#9affd6";
      ctx.fillRect(x + 13 * s, y + 8 * s, 2 * s, 2 * s);
      ctx.fillStyle = "#3a8a6a";
      ctx.fillRect(x + 13 * s, y + 7 * s, 2 * s, 1 * s);
      break;
    case "goggles":
      px(5, 5, 6, 1, "#3d4760");
      px(6, 5, 1, 1, "#9affd6");
      px(9, 5, 1, 1, "#9affd6");
      break;
    case "skull":
      ctx.fillStyle = "#e9e6d8";
      ctx.fillRect(x + 6 * s, y + 0 * s, 4 * s, 2 * s);
      ctx.fillStyle = "#0b0a13";
      ctx.fillRect(x + 7 * s, y + 1 * s, 1 * s, 1 * s);
      ctx.fillRect(x + 8 * s, y + 1 * s, 1 * s, 1 * s);
      break;
    default: break;
  }

  // Hat overlay (drawn last over head)
  if (hat) {
    const hc = hat.color, ht = hat.trim;
    if (hatShape === "tall") {
      px(5, 2, 6, 1, hc); px(6, 1, 4, 1, hc); px(7, 0, 2, 1, hc); px(7, -1, 2, 1, hc); px(4, 2, 8, 1, ht);
    } else if (hatShape === "wide") {
      px(3, 3, 10, 1, hc); px(5, 1, 6, 2, hc); px(5, 1, 6, 1, ht);
    } else if (hatShape === "helm") {
      px(4, 1, 8, 4, hc); px(4, 4, 8, 1, ht); px(5, 2, 6, 2, ht); px(6, 4, 4, 1, "#0b0a13");
    } else if (hatShape === "crown") {
      px(4, 2, 8, 2, hc); px(4, 1, 1, 2, hc); px(11, 1, 1, 2, hc); px(7, 1, 2, 2, hc);
      px(5, 1, 1, 1, ht); px(10, 1, 1, 1, ht); px(7, 1, 2, 1, ht);
    }
  }

  // Weapon swing
  if (swing) {
    ctx.fillStyle = weapon.color || "#ffd166";
    if (dir === "right") { ctx.fillRect(x + 13 * s, y + 6 * s, 5 * s, 1 * s); ctx.fillRect(x + 16 * s, y + 5 * s, 2 * s, 3 * s); }
    else if (dir === "left") { ctx.fillRect(x - 2 * s, y + 6 * s, 5 * s, 1 * s); ctx.fillRect(x - 2 * s, y + 5 * s, 2 * s, 3 * s); }
    else if (dir === "up") { ctx.fillRect(x + 7 * s, y - 2 * s, 1 * s, 5 * s); ctx.fillRect(x + 6 * s, y - 2 * s, 3 * s, 2 * s); }
    else { ctx.fillRect(x + 8 * s, y + 13 * s, 1 * s, 5 * s); ctx.fillRect(x + 7 * s, y + 16 * s, 3 * s, 2 * s); }
  }
};

// ===== Mobs =====
// Each mob receives (ctx, x, y, size, t, hurtFlash). Death/fade handled by caller via alpha.
const mobShadow = (ctx, x, y, s) => {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);
};

export const drawSkeleton = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const bone = hurt ? "#ff8a8a" : "#e9e6d8";
  const shade = hurt ? "#bb5555" : "#9a9788";
  mobShadow(ctx, x, y, s);
  const bob = Math.sin(t / 200) > 0 ? 0 : 1;
  px(5, 12 - bob, 2, 3, bone); px(9, 12 - bob, 2, 3, bone);
  px(4, 7, 8, 5, bone);
  for (let i = 0; i < 3; i++) px(5, 8 + i, 6, 1, shade);
  px(2, 8, 2, 4, bone); px(12, 8, 2, 4, bone);
  px(5, 2, 6, 5, bone); px(5, 7, 6, 1, shade);
  px(6, 4, 1, 2, "#1a0a14"); px(9, 4, 1, 2, "#1a0a14");
  px(6, 4, 1, 1, "#ff6e2a"); px(9, 4, 1, 1, "#ff6e2a");
};

export const drawZombie = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const skin = hurt ? "#ff8a8a" : "#5a8a5a";
  const dark = hurt ? "#aa3333" : "#2a4a2a";
  mobShadow(ctx, x, y, s);
  const bob = Math.sin(t / 250) > 0.5 ? 0 : 1;
  px(5, 12 - bob, 2, 3, dark); px(9, 12 + bob, 2, 3, dark);
  px(4, 7, 8, 5, skin);
  px(4, 11, 8, 1, dark);
  px(3, 8, 1, 4, skin); px(12, 8, 1, 4, skin);
  px(5, 2, 6, 4, skin); px(5, 6, 6, 1, dark);
  px(6, 4, 1, 1, "#f4bf4f"); px(9, 4, 1, 1, "#f4bf4f");
  px(7, 6, 2, 1, "#7a1a2a");
};

export const drawLavaSlime = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ffd166" : "#ff6e2a";
  const dark = hurt ? "#aa770e" : "#a8330a";
  mobShadow(ctx, x, y, s);
  const bob = Math.sin(t / 150) * 0.5;
  // blob shape
  px(4, 9 + Math.round(bob), 8, 5, body);
  px(3, 10, 1, 4, body); px(12, 10, 1, 4, body);
  px(5, 7, 6, 2, body);
  px(4, 13, 8, 1, dark);
  // eyes
  px(6, 10, 1, 1, "#ffffff"); px(9, 10, 1, 1, "#ffffff");
  px(6, 10, 1, 1, "#1a0a14"); px(9, 10, 1, 1, "#1a0a14");
  px(6, 10, 1, 1, "#1a0a14"); px(9, 10, 1, 1, "#1a0a14");
  // glow drips
  px(5, 14, 1, 1, "#ffd166");
  px(10, 14, 1, 1, "#ffd166");
};

export const drawImp = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const skin = hurt ? "#ff8a8a" : "#a8330a";
  const dark = hurt ? "#7a2020" : "#7a1a0a";
  mobShadow(ctx, x, y, s);
  // legs
  px(5, 12, 2, 3, dark); px(9, 12, 2, 3, dark);
  // body
  px(4, 7, 8, 5, skin);
  px(4, 11, 8, 1, dark);
  // wings (animated)
  const flap = Math.floor(Math.sin(t / 100) * 1.5);
  px(1, 7 + flap, 3, 3, skin); px(12, 7 + flap, 3, 3, skin);
  px(1, 7 + flap, 3, 1, dark); px(12, 7 + flap, 3, 1, dark);
  // head
  px(5, 2, 6, 4, skin);
  // horns
  px(4, 1, 1, 2, dark); px(11, 1, 1, 2, dark);
  // eyes
  px(6, 4, 1, 1, "#ffd166"); px(9, 4, 1, 1, "#ffd166");
  // sneer
  px(7, 5, 2, 1, dark);
};

export const drawSpirit = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ff8a8a" : "#ffd1dc";
  const dark = hurt ? "#cc5555" : "#ff6ec7";
  mobShadow(ctx, x, y, s);
  // floating - oscillate y
  const float = Math.round(Math.sin(t / 250) * 1.5);
  // wisp tail
  px(6, 13 + float, 4, 2, body);
  px(7, 15 + float, 2, 1, dark);
  // body
  px(4, 5 + float, 8, 7, body);
  px(4, 11 + float, 8, 1, dark);
  px(5, 4 + float, 6, 1, body);
  // eyes
  px(6, 7 + float, 1, 2, "#7a1a4a");
  px(9, 7 + float, 1, 2, "#7a1a4a");
  px(6, 7 + float, 1, 1, "#ffffff");
  px(9, 7 + float, 1, 1, "#ffffff");
};

export const drawBlossomBat = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ff8a8a" : "#ff6ec7";
  const dark = hurt ? "#aa3333" : "#7a1a4a";
  mobShadow(ctx, x, y, s);
  const flap = Math.sin(t / 80) > 0 ? 1 : -1;
  // wings (sakura petal-shape)
  px(0, 7 + flap, 4, 4, body);
  px(12, 7 - flap, 4, 4, body);
  px(0, 7 + flap, 4, 1, dark);
  px(12, 7 - flap, 4, 1, dark);
  // body
  px(5, 6, 6, 5, body);
  px(5, 10, 6, 1, dark);
  // face
  px(6, 8, 1, 1, "#ffd166");
  px(9, 8, 1, 1, "#ffd166");
  // fangs
  px(7, 10, 1, 1, "#ffffff");
  px(8, 10, 1, 1, "#ffffff");
};

export const drawIceGolem = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ffd1dc" : "#a8d0f4";
  const dark = hurt ? "#aa5555" : "#3a5a8a";
  const shine = "#e8f4ff";
  mobShadow(ctx, x, y, s);
  // chunky legs
  px(4, 12, 3, 3, body); px(9, 12, 3, 3, body);
  px(4, 14, 3, 1, dark); px(9, 14, 3, 1, dark);
  // big body
  px(3, 6, 10, 6, body);
  px(3, 11, 10, 1, dark);
  px(3, 6, 1, 6, dark); px(12, 6, 1, 6, dark);
  // chest icicle
  px(7, 8, 2, 3, shine);
  // head
  px(5, 2, 6, 4, body);
  px(5, 5, 6, 1, dark);
  // glowing eyes
  px(6, 3, 1, 2, "#9affd6"); px(9, 3, 1, 2, "#9affd6");
  // arms
  px(2, 7, 1, 4, body); px(13, 7, 1, 4, body);
};

export const drawFrostWolf = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const fur = hurt ? "#ffd1dc" : "#cce2f4";
  const dark = hurt ? "#aa5555" : "#3a5a8a";
  mobShadow(ctx, x, y, s);
  // legs
  px(4, 12, 2, 3, fur); px(7, 12, 2, 3, fur); px(10, 12, 2, 3, fur);
  // body (long)
  px(3, 8, 11, 5, fur);
  px(3, 12, 11, 1, dark);
  // head
  px(11, 5, 5, 4, fur);
  // ears
  px(11, 4, 1, 2, fur); px(14, 4, 1, 2, fur);
  // eye
  px(13, 6, 1, 1, "#9affd6");
  // teeth
  px(14, 8, 2, 1, "#ffffff");
  // tail
  px(0, 7, 4, 3, fur);
  px(0, 7, 1, 3, dark);
};

export const drawDrone = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ff8a8a" : "#3a8acc";
  const dark = hurt ? "#aa3333" : "#1a2f4a";
  const glow = "#9affd6";
  mobShadow(ctx, x, y, s);
  const hover = Math.round(Math.sin(t / 150) * 1.5);
  // rotors
  ctx.fillStyle = "rgba(154,255,214,0.5)";
  ctx.fillRect(x + 1 * s, y + 6 * s + hover, 4 * s, 1 * s);
  ctx.fillRect(x + 11 * s, y + 6 * s + hover, 4 * s, 1 * s);
  // body
  px(4, 7 + hover, 8, 4, body);
  px(4, 10 + hover, 8, 1, dark);
  // dome
  px(5, 5 + hover, 6, 2, glow);
  px(6, 6 + hover, 1, 1, "#000");
  px(9, 6 + hover, 1, 1, "#000");
  // underside laser dot
  px(7, 11 + hover, 2, 1, "#ff3a6f");
};

export const drawSentry = (ctx, x, y, size, t = 0, hurt = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = hurt ? "#ff8a8a" : "#3d4760";
  const dark = hurt ? "#aa3333" : "#1a2f4a";
  const eye = Math.floor(t / 200) % 2 === 0 ? "#ff3a6f" : "#9affd6";
  mobShadow(ctx, x, y, s);
  // tracked base
  px(3, 13, 10, 2, dark);
  px(4, 14, 2, 1, body); px(10, 14, 2, 1, body);
  // body
  px(4, 8, 8, 5, body);
  px(4, 12, 8, 1, dark);
  // turret
  px(5, 4, 6, 4, body);
  px(5, 7, 6, 1, dark);
  // big eye
  px(6, 5, 4, 2, eye);
  // cannons
  px(2, 8, 2, 1, dark); px(12, 8, 2, 1, dark);
};

export const MOB_DRAWERS = {
  skeleton: drawSkeleton,
  zombie: drawZombie,
  lavaslime: drawLavaSlime,
  imp: drawImp,
  spirit: drawSpirit,
  blossombat: drawBlossomBat,
  icegolem: drawIceGolem,
  frostwolf: drawFrostWolf,
  drone: drawDrone,
  sentry: drawSentry,
};

// ===== Robot (deactivated style) =====
export const drawRobot = (ctx, x, y, size, t = 0, alerted = false, completed = false) => {
  const s = size / 16;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + a * s, y + b * s, w * s, h * s); };
  const body = completed ? "#5a6a8a" : "#7aa2ff";
  const bodyShade = completed ? "#2a3a5a" : "#3d5cb0";
  const trim = completed ? "#7a6a4a" : "#f4bf4f";
  const screen = completed ? "#5a8a7a" : (alerted ? "#ff6ec7" : "#9affd6");
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);
  px(3, 13, 10, 2, "#1a1326");
  px(4, 14, 2, 1, trim); px(10, 14, 2, 1, trim);
  px(3, 6, 10, 7, body);
  px(3, 12, 10, 1, bodyShade);
  px(3, 6, 1, 7, bodyShade); px(12, 6, 1, 7, bodyShade);
  px(5, 9, 6, 2, "#1a1326");
  px(6, 10, 1, 1, screen); px(8, 10, 1, 1, screen); px(10, 10, 1, 1, screen);
  px(4, 1, 8, 5, body);
  px(4, 5, 8, 1, bodyShade);
  px(5, 2, 6, 3, "#0b0a13");
  if (completed) {
    // X eyes
    px(6, 3, 1, 1, "#5a6a8a"); px(9, 3, 1, 1, "#5a6a8a");
    px(7, 3, 1, 1, "#3a4a6a"); px(8, 3, 1, 1, "#3a4a6a");
    // Check mark above
    ctx.fillStyle = "#9affd6";
    ctx.fillRect(x + 13 * s, y + (-2) * s, 1 * s, 2 * s);
    ctx.fillRect(x + 14 * s, y + (-1) * s, 1 * s, 1 * s);
    ctx.fillRect(x + 15 * s, y + (-3) * s, 1 * s, 2 * s);
  } else {
    const blink = Math.floor(t / 700) % 8 === 0;
    if (!blink) { px(6, 3, 1, 1, screen); px(9, 3, 1, 1, screen); }
    else { px(6, 3, 1, 1, "#3a2a52"); px(9, 3, 1, 1, "#3a2a52"); }
    px(7, -1, 1, 2, "#9affd6");
    px(7, -2, 1, 1, "#ff6ec7");
    if (alerted) {
      const off = Math.floor(Math.sin(t / 150) * 1);
      px(13, -3 + off, 3, 4, "#1a1326");
      px(14, -2 + off, 1, 1, "#f4bf4f");
      px(14, 0 + off, 1, 1, "#f4bf4f");
    }
  }
};

// ===== Slash FX =====
export const drawSlash = (ctx, x, y, size, dir, progress) => {
  const cx = x + size / 2, cy = y + size / 2, r = size * 0.55;
  const a0 = { right: -0.6, left: Math.PI - 0.6, up: -Math.PI / 2 - 0.6, down: Math.PI / 2 - 0.6 }[dir];
  ctx.strokeStyle = `rgba(255, 230, 150, ${1 - progress})`;
  ctx.lineWidth = Math.max(2, Math.floor(size / 10));
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a0 + 1.2 * progress);
  ctx.stroke();
};

// ===== Twin-Beam Laser FX =====
// Renders two parallel beams from player toward facing direction.
export const drawTwinBeam = (ctx, px, py, dir, length, t = 0) => {
  const dirVecs = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  const v = dirVecs[dir] || [1, 0];
  const perp = [-v[1], v[0]];
  const colors = ["#ff3a6f", "#9affd6"];
  for (let i = 0; i < 2; i++) {
    const offset = (i === 0 ? -3 : 3);
    const sx = px + perp[0] * offset;
    const sy = py + perp[1] * offset;
    const ex = sx + v[0] * length;
    const ey = sy + v[1] * length;
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 + Math.sin(t / 80 + i) * 0.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // halo glow
    ctx.strokeStyle = colors[i] + "55";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
};

// ===== Death FX (shatter shards) =====
export const drawShatter = (ctx, x, y, size, progress, color = "#e9e6d8") => {
  // progress 0..1
  const cx = x + size / 2, cy = y + size / 2;
  const shards = 8;
  const radius = size * 0.6 * progress;
  ctx.fillStyle = color;
  for (let i = 0; i < shards; i++) {
    const a = (i / shards) * Math.PI * 2;
    const r = radius * (0.6 + (i % 3) * 0.15);
    const sx = cx + Math.cos(a) * r;
    const sy = cy + Math.sin(a) * r;
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
};

// ===== Sakura petal particle =====
export const drawPetal = (ctx, x, y) => {
  ctx.fillStyle = "#ff6ec7";
  ctx.fillRect(x, y, 2, 2);
  ctx.fillStyle = "#ffd1dc";
  ctx.fillRect(x + 1, y, 1, 1);
};

// ===== Wall-Mounted Torch (with flicker) =====
// Drawn at top of a wall tile. dir: 'top' or 'bottom' (which wall row it belongs to).
export const drawTorch = (ctx, x, y, size, t = 0, biome) => {
  const s = size / 16;
  const id = biome?.id || "dungeon";
  // bracket (metal)
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(x + 7 * s, y + 7 * s, 2 * s, 5 * s);
  ctx.fillStyle = "#6a4a2a";
  ctx.fillRect(x + 6 * s, y + 11 * s, 4 * s, 2 * s);
  // handle wood
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(x + 7 * s, y + 5 * s, 2 * s, 3 * s);
  // flame
  const flicker = Math.sin(t / 80) * 0.5 + Math.sin(t / 53) * 0.3;
  const fy = Math.round(flicker);
  let core, mid, outer;
  if (id === "ice" || id === "tech") {
    core = "#e8f4ff"; mid = "#9affd6"; outer = "#3a8acc";
  } else if (id === "sakura") {
    core = "#ffffff"; mid = "#ffd1dc"; outer = "#ff6ec7";
  } else {
    core = "#fff7c2"; mid = "#ffd166"; outer = "#ff6e2a";
  }
  // outer flame
  ctx.fillStyle = outer;
  ctx.fillRect(x + 5 * s, y + (2 + fy) * s, 6 * s, 3 * s);
  ctx.fillRect(x + 6 * s, y + (0 + fy) * s, 4 * s, 2 * s);
  // mid
  ctx.fillStyle = mid;
  ctx.fillRect(x + 6 * s, y + (3 + fy) * s, 4 * s, 2 * s);
  ctx.fillRect(x + 7 * s, y + (1 + fy) * s, 2 * s, 2 * s);
  // core
  ctx.fillStyle = core;
  ctx.fillRect(x + 7 * s, y + (3 + fy) * s, 2 * s, 1 * s);
  // glow halo (semi-transparent)
  const haloA = 0.18 + Math.sin(t / 120) * 0.04;
  ctx.fillStyle = `rgba(255, 200, 110, ${haloA})`;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 3, size * 0.85, 0, Math.PI * 2);
  ctx.fill();
};

// ===== Rug / Platform (under robots, NPCs) =====
export const drawRug = (ctx, x, y, size, biome) => {
  const id = biome?.id || "dungeon";
  let main, trim, dot;
  if (id === "hell") { main = "#a8330a"; trim = "#ffd166"; dot = "#ff6e2a"; }
  else if (id === "sakura") { main = "#ff6ec7"; trim = "#ffd1dc"; dot = "#9affd6"; }
  else if (id === "ice") { main = "#5aaaee"; trim = "#e8f4ff"; dot = "#9affd6"; }
  else if (id === "tech") { main = "#1f3a5a"; trim = "#9affd6"; dot = "#ff3a6f"; }
  else { main = "#7a1a4a"; trim = "#f4bf4f"; dot = "#9affd6"; }
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x + 2, y + size - 4, size - 4, 3);
  // rug body (oval-ish via two rects)
  ctx.fillStyle = main;
  ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
  ctx.fillRect(x + 2, y + 8, size - 4, size - 16);
  // trim border
  ctx.fillStyle = trim;
  ctx.fillRect(x + 4, y + 4, size - 8, 2);
  ctx.fillRect(x + 4, y + size - 6, size - 8, 2);
  ctx.fillRect(x + 4, y + 4, 2, size - 8);
  ctx.fillRect(x + size - 6, y + 4, 2, size - 8);
  // center motif
  ctx.fillStyle = dot;
  ctx.fillRect(x + size / 2 - 2, y + size / 2 - 2, 4, 4);
  ctx.fillStyle = trim;
  ctx.fillRect(x + size / 2 - 1, y + size / 2 - 1, 2, 2);
};

// ===== Mini-Map metallic frame =====
export const drawMiniMapFrame = (ctx, x, y, w, h) => {
  const out = 4;
  // outer dark
  ctx.fillStyle = "#0a0612";
  ctx.fillRect(x - out, y - out, w + out * 2, h + out * 2);
  // metallic gradient (light top -> dark bottom)
  const grad = ctx.createLinearGradient(x - out, y - out, x - out, y + h + out);
  grad.addColorStop(0, "#9aa5b8");
  grad.addColorStop(0.45, "#5a6a8a");
  grad.addColorStop(0.55, "#3a4a6a");
  grad.addColorStop(1, "#1a2333");
  ctx.fillStyle = grad;
  ctx.fillRect(x - out, y - out, w + out * 2, out);
  ctx.fillRect(x - out, y + h, w + out * 2, out);
  ctx.fillRect(x - out, y - out, out, h + out * 2);
  ctx.fillRect(x + w, y - out, out, h + out * 2);
  // bolt rivets (corners)
  const drawBolt = (bx, by) => {
    ctx.fillStyle = "#1a1f2a";
    ctx.fillRect(bx, by, 3, 3);
    ctx.fillStyle = "#cce2f4";
    ctx.fillRect(bx, by, 1, 1);
  };
  drawBolt(x - out + 1, y - out + 1);
  drawBolt(x + w + out - 4, y - out + 1);
  drawBolt(x - out + 1, y + h + out - 4);
  drawBolt(x + w + out - 4, y + h + out - 4);
  // inner inset shadow
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
};
