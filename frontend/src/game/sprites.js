// Programmatic pixel-art sprites + biome-aware tiles + mob variants + accessories.

import { ITEM_BY_ID } from "./items";
import { CHARACTER_BY_ID } from "./characters";

// ===== Biome floor/wall =====
export const drawFloorTile = (ctx, x, y, size, variant, biome) => {
  const v = variant % 4;
  const base = biome?.floor?.[v] || ["#1a1726", "#181527", "#1c1828", "#16121f"][v];
  ctx.fillStyle = base;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = biome?.floorTrim || "#0e0a18";
  ctx.fillRect(x, y + size - 1, size, 1);
  ctx.fillRect(x + size - 1, y, 1, size);
  if (biome?.id === "tech") {
    // neon wire lines
    ctx.fillStyle = "rgba(154,255,214,0.18)";
    if (v === 0) ctx.fillRect(x + 4, y + 10, size - 8, 1);
    if (v === 2) ctx.fillRect(x + 14, y + 4, 1, size - 8);
  } else if (biome?.id === "sakura") {
    // petal speckles
    ctx.fillStyle = "rgba(255,110,199,0.25)";
    if (v === 0) ctx.fillRect(x + 6, y + 8, 2, 2);
    if (v === 2) ctx.fillRect(x + 20, y + 16, 2, 2);
  } else if (biome?.id === "hell") {
    ctx.fillStyle = "rgba(255,110,42,0.15)";
    if (v === 1) ctx.fillRect(x + 10, y + 14, 2, 1);
  } else if (biome?.id === "ice") {
    ctx.fillStyle = "rgba(232,244,255,0.18)";
    if (v === 1) ctx.fillRect(x + 5, y + 6, 6, 1);
    if (v === 3) ctx.fillRect(x + 14, y + 18, 5, 1);
  } else {
    ctx.fillStyle = "rgba(190,160,255,0.06)";
    ctx.fillRect(x + 3, y + 5, 1, 1);
    ctx.fillRect(x + 11, y + 18, 1, 1);
  }
};

export const drawWallTile = (ctx, x, y, size, biome) => {
  ctx.fillStyle = biome?.wallBase || "#3a2a52";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = biome?.wallShade || "#241836";
  ctx.fillRect(x, y + size - 4, size, 4);
  ctx.fillStyle = biome?.wallEdge || "#52407a";
  ctx.fillRect(x + 2, y + 2, size - 4, 2);
  ctx.fillStyle = biome?.wallSeam || "#161024";
  ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
  ctx.fillRect(x + Math.floor(size / 2), y, 1, Math.floor(size / 2));
  ctx.fillRect(x + Math.floor(size / 4), y + Math.floor(size / 2), 1, Math.floor(size / 2));
  // Bamboo accent for sakura
  if (biome?.id === "sakura") {
    ctx.fillStyle = "#aaeb6a";
    ctx.fillRect(x + 6, y + 4, 2, size - 8);
    ctx.fillRect(x + size - 8, y + 4, 2, size - 8);
    ctx.fillStyle = "#0e2a14";
    ctx.fillRect(x + 6, y + 12, 2, 1);
    ctx.fillRect(x + size - 8, y + 18, 2, 1);
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
