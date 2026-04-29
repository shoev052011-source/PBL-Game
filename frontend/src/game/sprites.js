// Programmatic pixel-art sprite drawers using the Canvas 2D API.
// Each function draws a sprite "stamp" at integer coordinates so that, combined
// with image-rendering: pixelated and a small back-buffer scaled up via CSS,
// the result looks crisp and pixel-accurate.

// ------------- Floor / Walls -------------

export const drawFloorTile = (ctx, x, y, size, variant = 0) => {
  // Dark slate floor with subtle cracks
  const base = ["#1a1726", "#181527", "#1c1828", "#16121f"][variant % 4];
  ctx.fillStyle = base;
  ctx.fillRect(x, y, size, size);

  // tile seam
  ctx.fillStyle = "#0e0a18";
  ctx.fillRect(x, y + size - 1, size, 1);
  ctx.fillRect(x + size - 1, y, 1, size);

  // speckle
  ctx.fillStyle = "rgba(190,160,255,0.06)";
  ctx.fillRect(x + 3, y + 5, 1, 1);
  ctx.fillRect(x + 11, y + 18, 1, 1);
  ctx.fillRect(x + 22, y + 9, 1, 1);
  if (variant % 3 === 0) {
    ctx.fillStyle = "#0c091a";
    ctx.fillRect(x + 6, y + 22, 6, 1);
    ctx.fillRect(x + 12, y + 21, 1, 1);
  }
};

export const drawWallTile = (ctx, x, y, size) => {
  // Stone block wall
  ctx.fillStyle = "#3a2a52";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#241836";
  ctx.fillRect(x, y + size - 4, size, 4);
  ctx.fillStyle = "#52407a";
  ctx.fillRect(x + 2, y + 2, size - 4, 2);
  // mortar lines
  ctx.fillStyle = "#161024";
  ctx.fillRect(x, y + Math.floor(size / 2), size, 1);
  ctx.fillRect(x + Math.floor(size / 2), y, 1, Math.floor(size / 2));
  ctx.fillRect(x + Math.floor(size / 4), y + Math.floor(size / 2), 1, Math.floor(size / 2));
};

export const drawDoorTile = (ctx, x, y, size, locked) => {
  // door frame
  ctx.fillStyle = locked ? "#2a0e1a" : "#2a1f10";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = locked ? "#ff3a6f" : "#f4bf4f";
  // arched door
  ctx.fillRect(x + 6, y + 8, size - 12, size - 10);
  ctx.fillRect(x + 8, y + 4, size - 16, 4);
  // handle
  ctx.fillStyle = "#0b0a13";
  ctx.fillRect(x + size - 12, y + size - 14, 2, 2);
  if (locked) {
    // glowing X bars
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(x + 6, y + 14, size - 12, 2);
    ctx.fillRect(x + 6, y + 20, size - 12, 2);
  }
};

// ------------- Player (Hero) -------------
// 16x16 logical sprite, upscaled by drawing at size px.
export const drawPlayer = (ctx, x, y, size, dir = "down", swing = false, hurtFlash = false) => {
  const s = size / 16; // scale factor
  const px = (px2, py, w = 1, h = 1, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px2 * s, y + py * s, w * s, h * s);
  };
  const skin = hurtFlash ? "#ffe7e7" : "#f4c79a";
  const tunic = hurtFlash ? "#ff8888" : "#3aa6c5"; // teal hero tunic
  const tunicShade = hurtFlash ? "#cc5555" : "#1f6b81";
  const hair = "#3a1a0e";
  const boot = "#2a1a0e";
  const belt = "#f4bf4f";

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);

  // legs
  px(5, 12, 2, 3, boot);
  px(9, 12, 2, 3, boot);
  // tunic
  px(4, 7, 8, 5, tunic);
  px(4, 11, 8, 1, tunicShade);
  px(4, 7, 1, 5, tunicShade);
  px(11, 7, 1, 5, tunicShade);
  // belt
  px(4, 10, 8, 1, belt);
  // arms
  px(3, 8, 1, 3, skin);
  px(12, 8, 1, 3, skin);
  // head
  px(5, 3, 6, 4, skin);
  px(5, 2, 6, 1, hair);
  px(4, 3, 1, 2, hair);
  px(11, 3, 1, 2, hair);
  // eyes
  if (dir === "left") {
    px(6, 5, 1, 1, "#0b0a13");
    px(8, 5, 1, 1, "#0b0a13");
  } else if (dir === "right") {
    px(7, 5, 1, 1, "#0b0a13");
    px(9, 5, 1, 1, "#0b0a13");
  } else if (dir === "up") {
    px(6, 4, 1, 1, "#0b0a13");
    px(9, 4, 1, 1, "#0b0a13");
  } else {
    px(6, 5, 1, 1, "#0b0a13");
    px(9, 5, 1, 1, "#0b0a13");
  }

  // sword swing
  if (swing) {
    ctx.fillStyle = "#ffd166";
    if (dir === "right") {
      ctx.fillRect(x + 13 * s, y + 6 * s, 5 * s, 1 * s);
      ctx.fillRect(x + 16 * s, y + 5 * s, 2 * s, 3 * s);
    } else if (dir === "left") {
      ctx.fillRect(x - 2 * s, y + 6 * s, 5 * s, 1 * s);
      ctx.fillRect(x - 2 * s, y + 5 * s, 2 * s, 3 * s);
    } else if (dir === "up") {
      ctx.fillRect(x + 7 * s, y - 2 * s, 1 * s, 5 * s);
      ctx.fillRect(x + 6 * s, y - 2 * s, 3 * s, 2 * s);
    } else {
      ctx.fillRect(x + 8 * s, y + 13 * s, 1 * s, 5 * s);
      ctx.fillRect(x + 7 * s, y + 16 * s, 3 * s, 2 * s);
    }
  }
};

// ------------- Skeleton -------------
export const drawSkeleton = (ctx, x, y, size, t = 0, hurtFlash = false) => {
  const s = size / 16;
  const px = (px2, py, w = 1, h = 1, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px2 * s, y + py * s, w * s, h * s);
  };
  const bone = hurtFlash ? "#ff8a8a" : "#e9e6d8";
  const shade = hurtFlash ? "#bb5555" : "#9a9788";
  const cloth = "#5a3a8a";

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);

  // bob
  const bob = Math.sin(t / 200) > 0 ? 0 : 1;

  // legs
  px(5, 12 - bob, 2, 3, bone);
  px(9, 12 - bob, 2, 3, bone);
  px(5, 14 - bob, 2, 1, shade);
  px(9, 14 - bob, 2, 1, shade);
  // ribcage
  px(4, 7, 8, 5, bone);
  for (let i = 0; i < 3; i++) px(5, 8 + i * 1, 6, 1, shade);
  px(4, 7, 8, 1, shade);
  // tattered cloth
  px(3, 11, 10, 1, cloth);
  px(2, 12, 12, 1, cloth);
  // arms (raised toward player)
  px(2, 8, 2, 4, bone);
  px(12, 8, 2, 4, bone);
  // skull
  px(5, 2, 6, 5, bone);
  px(5, 7, 6, 1, shade);
  // eye sockets
  px(6, 4, 1, 2, "#1a0a14");
  px(9, 4, 1, 2, "#1a0a14");
  // glowing eyes
  px(6, 4, 1, 1, "#ff6e2a");
  px(9, 4, 1, 1, "#ff6e2a");
  // teeth
  px(6, 6, 4, 1, shade);
  px(7, 6, 1, 1, "#1a0a14");
  px(9, 6, 1, 1, "#1a0a14");
};

// ------------- Robot -------------
export const drawRobot = (ctx, x, y, size, t = 0, alerted = false) => {
  const s = size / 16;
  const px = (px2, py, w = 1, h = 1, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px2 * s, y + py * s, w * s, h * s);
  };
  const body = "#7aa2ff";
  const bodyShade = "#3d5cb0";
  const trim = "#f4bf4f";
  const screen = alerted ? "#ff6ec7" : "#9affd6";

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 3 * s, y + 14 * s, 10 * s, 2 * s);

  // base / treads
  px(3, 13, 10, 2, "#1a1326");
  px(4, 14, 2, 1, trim);
  px(10, 14, 2, 1, trim);
  // body
  px(3, 6, 10, 7, body);
  px(3, 12, 10, 1, bodyShade);
  px(3, 6, 1, 7, bodyShade);
  px(12, 6, 1, 7, bodyShade);
  // chest panel
  px(5, 9, 6, 2, "#1a1326");
  px(6, 10, 1, 1, screen);
  px(8, 10, 1, 1, screen);
  px(10, 10, 1, 1, screen);
  // head
  px(4, 1, 8, 5, body);
  px(4, 5, 8, 1, bodyShade);
  // screen face
  px(5, 2, 6, 3, "#0b0a13");
  // eyes (blink occasionally)
  const blink = Math.floor(t / 700) % 8 === 0;
  if (!blink) {
    px(6, 3, 1, 1, screen);
    px(9, 3, 1, 1, screen);
  } else {
    px(6, 3, 1, 1, "#3a2a52");
    px(9, 3, 1, 1, "#3a2a52");
  }
  // antenna
  px(7, -1, 1, 2, "#9affd6");
  px(7, -2, 1, 1, "#ff6ec7");

  // alerted bubble (?)
  if (alerted) {
    const off = Math.floor(Math.sin(t / 150) * 1);
    px(13, -3 + off, 3, 4, "#1a1326");
    px(14, -2 + off, 1, 1, "#f4bf4f");
    px(14, 0 + off, 1, 1, "#f4bf4f");
  }
};

// ------------- Heart (HUD) -------------
export const drawHeart = (ctx, x, y, size, full = true) => {
  const s = size / 8;
  const px = (px2, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px2 * s, y + py * s, s, s);
  };
  const main = full ? "#ff4d6d" : "#3a2a52";
  const shade = full ? "#a8133e" : "#1a1326";
  const shine = full ? "#ffd1dc" : "#3a2a52";
  // 8x7 heart
  const map = [
    "01100110",
    "11111111",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
  ];
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === "1") px(c, r, main);
    }
  }
  // shading
  px(1, 1, shade);
  px(0, 2, shade);
  px(7, 2, shade);
  // shine
  px(2, 1, shine);
  px(3, 2, shine);
};

// ------------- Particle / FX -------------
export const drawSlash = (ctx, x, y, size, dir, progress) => {
  // 0..1 progress arc
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.55;
  const a0 = { right: -0.6, left: Math.PI - 0.6, up: -Math.PI / 2 - 0.6, down: Math.PI / 2 - 0.6 }[dir];
  const start = a0;
  const end = a0 + 1.2 * progress;
  ctx.strokeStyle = `rgba(255, 230, 150, ${1 - progress})`;
  ctx.lineWidth = Math.max(2, Math.floor(size / 10));
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.stroke();
};
