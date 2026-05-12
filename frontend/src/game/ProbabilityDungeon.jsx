import React, { useEffect, useRef, useState, useCallback } from "react";
import QuizDialog from "./QuizDialog";
import { useStore, addCoins, addWeapon, unlockBiome, recordLevelClear } from "./store";
import { rollChestReward, WEAPON_BY_ID } from "./items";
import { BIOME_BY_ID, BIOMES } from "./biomes";
import { generateQuestion } from "./math";
import {
  drawFloorTile, drawWallTile, drawDoorTile, drawPillar, drawPit, drawChest,
  drawPlayer, drawRobot, drawSlash, drawShatter, drawTwinBeam, drawPetal,
  drawTorch, drawRug, drawMiniMapFrame,
  MOB_DRAWERS,
} from "./sprites";
import {
  sfxStep, sfxAttack, sfxHit, sfxKill, sfxLock, sfxUnlock,
  sfxGameOver, sfxVictory, sfxPickup, startAmbient, stopAmbient,
} from "./audio";
import { toast } from "sonner";

const TILE = 32;
const COLS = 20;
const ROWS = 14;
const W = COLS * TILE;
const H = ROWS * TILE;
const PLAYER_SIZE = 26;
const ENEMY_SIZE = 26;
const NPC_SIZE = 32;
const CHEST_SIZE = 30;
const PLAYER_SPEED = 2.2;
const ENEMY_SPEED = 1.05;
const ATTACK_RANGE = 36;
const ATTACK_DURATION_MS = 220;
const IFRAME_MS = 700;
const SAFETY_BUFFER_PX = 56;
const ROBOT_PROXIMITY_PX = 48;
const CHEST_PROXIMITY_PX = 34;
const TOTAL_ROOMS = 3;
const BEAM_LENGTH = 320;
const BEAM_DMG_INTERVAL_MS = 240;

const aabb = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

const ENTRANCE_TILE = { x: 0, y: 7 * TILE };
const EXIT_TILE = { x: (COLS - 1) * TILE, y: 7 * TILE };

const buildRoomWalls = () => {
  const walls = [];
  for (let c = 0; c < COLS; c++) {
    walls.push({ x: c * TILE, y: 0, w: TILE, h: TILE, kind: "wall" });
    walls.push({ x: c * TILE, y: (ROWS - 1) * TILE, w: TILE, h: TILE, kind: "wall" });
  }
  for (let r = 1; r < ROWS - 1; r++) {
    walls.push({ x: 0, y: r * TILE, w: TILE, h: TILE, kind: "wall" });
    walls.push({ x: (COLS - 1) * TILE, y: r * TILE, w: TILE, h: TILE, kind: "wall" });
  }
  return walls;
};

// Obstacle layouts per room index (20x14 grid)
const ROOM_OBSTACLES = [
  [{ kind: "P", c: 9, r: 4 }, { kind: "P", c: 11, r: 4 }, { kind: "P", c: 9, r: 9 }, { kind: "P", c: 11, r: 9 }],
  [{ kind: "P", c: 6, r: 5 }, { kind: "P", c: 13, r: 8 }, { kind: ".", c: 10, r: 6 }, { kind: ".", c: 10, r: 7 }],
  [{ kind: "P", c: 7, r: 3 }, { kind: "P", c: 7, r: 10 }, { kind: "P", c: 14, r: 3 }, { kind: "P", c: 14, r: 10 }],
  [{ kind: "P", c: 5, r: 7 }, { kind: "P", c: 10, r: 4 }, { kind: "P", c: 15, r: 9 }, { kind: ".", c: 8, r: 7 }, { kind: ".", c: 12, r: 6 }],
  [{ kind: "P", c: 6, r: 4 }, { kind: "P", c: 6, r: 10 }, { kind: "P", c: 13, r: 4 }, { kind: "P", c: 13, r: 10 }, { kind: ".", c: 10, r: 5 }, { kind: ".", c: 10, r: 8 }],
  [{ kind: "P", c: 8, r: 6 }, { kind: "P", c: 11, r: 6 }, { kind: "P", c: 8, r: 8 }, { kind: "P", c: 11, r: 8 }, { kind: ".", c: 5, r: 7 }, { kind: ".", c: 14, r: 7 }],
];
// Chest spawn points — in CORNERS (per new requirement)
const ROOM_CHESTS = [
  [{ c: 2, r: 2 }, { c: 17, r: 11 }],
  [{ c: 17, r: 2 }, { c: 2, r: 11 }],
  [{ c: 2, r: 2 }, { c: 17, r: 11 }],
  [{ c: 2, r: 11 }, { c: 17, r: 2 }],
  [{ c: 2, r: 2 }, { c: 17, r: 2 }],
  [{ c: 2, r: 11 }, { c: 17, r: 11 }],
];
// Wall-mounted torch positions (col, row, side: 'top'|'bottom')
// Always on the wall row/col itself.
const ROOM_TORCHES = [
  // Spread torches on top/bottom walls
  [{ c: 4, r: 0 }, { c: 10, r: 0 }, { c: 15, r: 0 }, { c: 4, r: 13 }, { c: 10, r: 13 }, { c: 15, r: 13 }],
  [{ c: 3, r: 0 }, { c: 9, r: 0 }, { c: 16, r: 0 }, { c: 5, r: 13 }, { c: 14, r: 13 }],
  [{ c: 5, r: 0 }, { c: 11, r: 0 }, { c: 16, r: 0 }, { c: 4, r: 13 }, { c: 11, r: 13 }, { c: 16, r: 13 }],
  [{ c: 3, r: 0 }, { c: 8, r: 0 }, { c: 13, r: 0 }, { c: 17, r: 0 }, { c: 8, r: 13 }, { c: 13, r: 13 }],
  [{ c: 4, r: 0 }, { c: 10, r: 0 }, { c: 16, r: 0 }, { c: 4, r: 13 }, { c: 10, r: 13 }, { c: 16, r: 13 }],
  [{ c: 5, r: 0 }, { c: 10, r: 0 }, { c: 15, r: 0 }, { c: 5, r: 13 }, { c: 10, r: 13 }, { c: 15, r: 13 }],
];

const buildRoom = (index, total, biome, level) => {
  const walls = buildRoomWalls();
  for (const w of walls) {
    if (w.x === ENTRANCE_TILE.x && w.y === ENTRANCE_TILE.y) { w.kind = "door-entrance"; w.solid = true; }
    else if (w.x === EXIT_TILE.x && w.y === EXIT_TILE.y) { w.kind = "door-exit"; w.solid = true; }
  }
  const obstacles = (ROOM_OBSTACLES[index] || []).map((o) => ({
    x: o.c * TILE, y: o.r * TILE, w: TILE, h: TILE, kind: o.kind === "P" ? "pillar" : "pit",
  }));
  for (const ob of obstacles) {
    if (ob.kind === "pillar") walls.push({ ...ob, kind: "wall-pillar", solid: true });
  }
  const pits = obstacles.filter((o) => o.kind === "pit");

  // Biome-specific mobs — count scales with level too
  const mobTypes = biome.mobs;
  const levelBoost = Math.floor((level - 1) / 5); // +0..+2 mobs across the 15 levels
  const mobCount = Math.min(3 + Math.floor(index * 0.7) + levelBoost, 8);
  const mobHp = 2 + Math.floor(index / 2) + Math.floor((level - 1) / 4);
  const mobs = [];
  for (let i = 0; i < mobCount; i++) {
    let tries = 0;
    while (tries < 30) {
      const sx = 5 * TILE + Math.random() * (W - 7 * TILE);
      const sy = 2 * TILE + Math.random() * (H - 4 * TILE);
      if (sx > 5 * TILE) {
        mobs.push({
          id: `mb-${index}-${i}`, type: mobTypes[i % mobTypes.length],
          x: sx, y: sy, w: ENEMY_SIZE, h: ENEMY_SIZE,
          hp: mobHp, hurtUntil: 0, alive: true,
          deathProgress: 0, lastBeamHit: 0,
        });
        break;
      }
      tries++;
    }
  }

  const robotSpots = [
    { x: 8 * TILE, y: 3 * TILE },
    { x: 12 * TILE, y: 10 * TILE },
    { x: 14 * TILE, y: 4 * TILE },
    { x: 5 * TILE, y: 10 * TILE },
  ];
  const robotCount = index === 0 ? 1 : Math.random() < 0.6 ? 1 : 2;
  const robots = [];
  for (let i = 0; i < robotCount; i++) {
    const spot = robotSpots[(index + i) % robotSpots.length];
    robots.push({
      id: `rb-${index}-${i}`, x: spot.x, y: spot.y, w: NPC_SIZE, h: NPC_SIZE,
      exitClicks: 0, destroyed: false, isCompleted: false,
      question: generateQuestion(biome.mathTier, level),
    });
  }

  const chests = (ROOM_CHESTS[index] || []).map((c, i) => ({
    id: `ch-${index}-${i}`,
    x: c.c * TILE + (TILE - CHEST_SIZE) / 2,
    y: c.r * TILE + (TILE - CHEST_SIZE) / 2,
    w: CHEST_SIZE, h: CHEST_SIZE, opened: false,
  }));

  // Wall-mounted torches for this room
  const torches = (ROOM_TORCHES[index] || []).map((tr) => ({
    x: tr.c * TILE,
    y: tr.r * TILE,
  }));

  return {
    index, isLast: index === total - 1, walls, mobs, robots, chests, pits, torches,
    locked: false, cleared: false,
  };
};

export default function ProbabilityDungeon({ biomeId, onExit }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const rafRef = useRef(null);
  const petalsRef = useRef([]);
  const storeSnap = useStore();
  const biome = BIOME_BY_ID[biomeId] || BIOMES[0];

  const [screen, setScreen] = useState("playing");
  const [hudHp, setHudHp] = useState(3);
  const [hudRoom, setHudRoom] = useState(1);
  const [hudCoinsRun, setHudCoinsRun] = useState(0);
  const [quiz, setQuiz] = useState({ open: false, robotId: null, question: null, exitClicks: 0, completed: false });

  const initGame = useCallback(() => {
    const rooms = [];
    for (let i = 0; i < TOTAL_ROOMS; i++) rooms.push(buildRoom(i, TOTAL_ROOMS, biome));
    stateRef.current = {
      rooms, currentRoom: 0,
      player: {
        x: ENTRANCE_TILE.x + TILE + 4,
        y: ENTRANCE_TILE.y + 5,
        w: PLAYER_SIZE, h: PLAYER_SIZE,
        facing: "right", hp: 3, iframesUntil: 0, attackUntil: 0,
        vx: 0, vy: 0, lastBeamTick: 0,
      },
      time: 0, lastFrameTs: 0, runCoins: 0, shatterFx: [],
    };
    setHudHp(3); setHudRoom(1); setHudCoinsRun(0);
    petalsRef.current = [];
  }, [biome]);

  const isWallSolid = (w) => {
    if (w.kind === "wall" || w.kind === "wall-pillar") return true;
    if (w.kind === "door-entrance" || w.kind === "door-exit") return w.solid;
    return false;
  };

  const moveAndCollide = (entity, dx, dy, walls) => {
    entity.x += dx;
    for (const w of walls) {
      if (!isWallSolid(w)) continue;
      if (aabb(entity, w)) {
        if (dx > 0) entity.x = w.x - entity.w;
        else if (dx < 0) entity.x = w.x + w.w;
      }
    }
    entity.y += dy;
    for (const w of walls) {
      if (!isWallSolid(w)) continue;
      if (aabb(entity, w)) {
        if (dy > 0) entity.y = w.y - entity.h;
        else if (dy < 0) entity.y = w.y + w.h;
      }
    }
  };

  const quizOpenRef = useRef(false);
  const screenRef = useRef("playing");
  useEffect(() => { quizOpenRef.current = quiz.open; }, [quiz.open]);
  useEffect(() => { screenRef.current = screen; }, [screen]);

  const isRoomCleared = (room) => {
    const mobsDead = room.mobs.every((m) => !m.alive);
    const robotsHandled = room.robots.every((r) => r.destroyed || r.isCompleted);
    return mobsDead && robotsHandled;
  };

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const tick = (ts) => {
      const st = stateRef.current;
      if (!st || screenRef.current !== "playing") {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(48, ts - (st.lastFrameTs || ts));
      st.lastFrameTs = ts;
      st.time += dt;

      const room = st.rooms[st.currentRoom];
      const player = st.player;
      const keys = keysRef.current;

      // ----- Input / Movement -----
      const isIce = biome.id === "ice";
      const friction = biome.friction || 0.78;
      let ax = 0, ay = 0;
      const accel = isIce ? 0.35 : 1.6;
      if (keys["w"] || keys["arrowup"]) { ay -= accel; player.facing = "up"; }
      if (keys["s"] || keys["arrowdown"]) { ay += accel; player.facing = "down"; }
      if (keys["a"] || keys["arrowleft"]) { ax -= accel; player.facing = "left"; }
      if (keys["d"] || keys["arrowright"]) { ax += accel; player.facing = "right"; }
      if (ax !== 0 && ay !== 0) { ax *= 0.7071; ay *= 0.7071; }

      const quizOpen = quizOpenRef.current;
      if (!quizOpen) {
        player.vx = (player.vx + ax) * (isIce ? friction : friction * 0.55);
        player.vy = (player.vy + ay) * (isIce ? friction : friction * 0.55);
        const maxV = PLAYER_SPEED * (isIce ? 1.4 : 1.2);
        if (player.vx > maxV) player.vx = maxV; if (player.vx < -maxV) player.vx = -maxV;
        if (player.vy > maxV) player.vy = maxV; if (player.vy < -maxV) player.vy = -maxV;
        // tiny snap when both axes zero & not ice
        if (!isIce && ax === 0 && ay === 0) { player.vx *= 0.6; player.vy *= 0.6; }
        const step = dt / 16.67;
        moveAndCollide(player, player.vx * step, player.vy * step, room.walls);
        if (Math.abs(player.vx) + Math.abs(player.vy) > 0.4) sfxStep();
      }

      // ----- Room lock with Safety Buffer -----
      if (!room.locked) {
        const px = player.x + player.w / 2, py = player.y + player.h / 2;
        const ex = ENTRANCE_TILE.x + TILE / 2, ey = ENTRANCE_TILE.y + TILE / 2;
        if (dist(px, py, ex, ey) >= SAFETY_BUFFER_PX) {
          const entrance = room.walls.find((w) => w.kind === "door-entrance");
          if (entrance) entrance.solid = true;
          room.locked = true;
          sfxLock();
          if (entrance && aabb(player, entrance)) {
            player.x = W / 2 - player.w / 2;
            player.y = H / 2 - player.h / 2;
          }
        } else {
          const entrance = room.walls.find((w) => w.kind === "door-entrance");
          if (entrance) entrance.solid = false;
        }
      }

      // ----- Double-Lock: exit only opens when mobs dead AND robots handled -----
      const exitDoor = room.walls.find((w) => w.kind === "door-exit");
      if (exitDoor) {
        if (isRoomCleared(room) && !room.cleared) {
          room.cleared = true;
          exitDoor.solid = false;
          sfxUnlock();
          toast.success("Exit unlocked!", { duration: 1200 });
        }
      }

      // ----- Mobs -----
      if (!quizOpen) {
        for (const m of room.mobs) {
          if (!m.alive) {
            if (m.deathProgress < 1) m.deathProgress = Math.min(1, m.deathProgress + dt / 400);
            continue;
          }
          const sx = m.x + m.w / 2, sy = m.y + m.h / 2;
          const px = player.x + player.w / 2, py = player.y + player.h / 2;
          const angle = Math.atan2(py - sy, px - sx);
          const sdx = Math.cos(angle) * ENEMY_SPEED * (dt / 16.67);
          const sdy = Math.sin(angle) * ENEMY_SPEED * (dt / 16.67);
          let pushX = 0, pushY = 0;
          for (const o of room.mobs) {
            if (o === m || !o.alive) continue;
            const d = dist(m.x, m.y, o.x, o.y);
            if (d < 22 && d > 0) {
              pushX += (m.x - o.x) / d * 0.35;
              pushY += (m.y - o.y) / d * 0.35;
            }
          }
          moveAndCollide(m, sdx + pushX, sdy + pushY, room.walls);

          if (aabb(m, player) && st.time > player.iframesUntil) {
            player.hp -= 1;
            player.iframesUntil = st.time + IFRAME_MS;
            sfxHit();
            setHudHp(player.hp);
            player.x += Math.cos(angle) * -10;
            player.y += Math.sin(angle) * -10;
            player.vx *= -0.5; player.vy *= -0.5;
            if (player.hp <= 0) {
              setScreen("gameover");
              sfxGameOver();
              stopAmbient();
              if (st.runCoins > 0) addCoins(st.runCoins);
            }
          }
        }
      }

      // ----- Attack (sword or twin-beam) -----
      const weapon = WEAPON_BY_ID[storeSnap.weapon] || WEAPON_BY_ID["sword"];
      const isBeam = weapon.id === "twin-beam";

      if (!isBeam) {
        const attacking = st.time < player.attackUntil;
        if (attacking) {
          const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
          const off = ATTACK_RANGE;
          let hbx = cx, hby = cy;
          if (player.facing === "right") hbx += off / 2;
          if (player.facing === "left") hbx -= off / 2;
          if (player.facing === "up") hby -= off / 2;
          if (player.facing === "down") hby += off / 2;
          const hb = { x: hbx - 14, y: hby - 14, w: 28, h: 28 };
          for (const m of room.mobs) {
            if (!m.alive) continue;
            if (st.time < m.hurtUntil) continue;
            if (aabb(hb, m)) {
              m.hp -= weapon.damage || 1;
              m.hurtUntil = st.time + 250;
              const angle = Math.atan2(m.y - cy, m.x - cx);
              m.x += Math.cos(angle) * 8;
              m.y += Math.sin(angle) * 8;
              if (m.hp <= 0) { m.alive = false; sfxKill(); st.runCoins += 2; setHudCoinsRun(st.runCoins); }
              else sfxHit();
            }
          }
        }
      } else {
        // Twin-Beam — held 'O' fires continuous beams; damage every BEAM_DMG_INTERVAL_MS
        const firing = !!keys["o"] && !quizOpen;
        if (firing && st.time - player.lastBeamTick > BEAM_DMG_INTERVAL_MS) {
          player.lastBeamTick = st.time;
          const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
          // Build beam rectangle along facing
          let bx = cx, by = cy, bw = BEAM_LENGTH, bh = 12;
          if (player.facing === "right") { bx = cx; by = cy - 6; bw = BEAM_LENGTH; bh = 12; }
          else if (player.facing === "left") { bx = cx - BEAM_LENGTH; by = cy - 6; bw = BEAM_LENGTH; bh = 12; }
          else if (player.facing === "up") { bx = cx - 6; by = cy - BEAM_LENGTH; bw = 12; bh = BEAM_LENGTH; }
          else { bx = cx - 6; by = cy; bw = 12; bh = BEAM_LENGTH; }
          const beamRect = { x: bx, y: by, w: bw, h: bh };
          for (const m of room.mobs) {
            if (!m.alive) continue;
            if (aabb(beamRect, m)) {
              m.hp -= 1;
              m.hurtUntil = st.time + 100;
              if (m.hp <= 0) { m.alive = false; sfxKill(); st.runCoins += 2; setHudCoinsRun(st.runCoins); }
              else if (st.time % 4 === 0) sfxHit();
            }
          }
        }
      }

      // ----- Robot proximity -----
      if (!quizOpen && room.locked) {
        for (const r of room.robots) {
          if (r.destroyed || r.isCompleted) continue;
          const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
          const rx = r.x + r.w / 2, ry = r.y + r.h / 2;
          if (dist(cx, cy, rx, ry) < ROBOT_PROXIMITY_PX) {
            setQuiz({ open: true, robotId: r.id, question: r.question, exitClicks: r.exitClicks, completed: false });
            player.x += (cx < rx ? -1 : 1) * 14;
            player.y += (cy < ry ? -1 : 1) * 14;
            player.vx *= -0.4; player.vy *= -0.4;
            break;
          }
        }
      }

      // ----- Chests -----
      if (!quizOpen) {
        for (const ch of room.chests) {
          if (ch.opened) continue;
          const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
          const rx = ch.x + ch.w / 2, ry = ch.y + ch.h / 2;
          if (dist(cx, cy, rx, ry) < CHEST_PROXIMITY_PX) {
            ch.opened = true;
            const reward = rollChestReward(biome.chestTier);
            if (reward.type === "coins") {
              st.runCoins += reward.amount;
              setHudCoinsRun(st.runCoins);
              sfxPickup();
              toast.success(`+${reward.amount} coins!`, { duration: 1500 });
            } else {
              const w = reward.weapon;
              const isNew = addWeapon(w.id);
              sfxPickup();
              toast.success(isNew ? `Weapon: ${w.name} equipped!` : `${w.name} (already owned)`, { duration: 1800 });
            }
          }
        }
      }

      // ----- Sakura petals -----
      if (biome.id === "sakura" && Math.random() < 0.4) {
        petalsRef.current.push({
          x: Math.random() * W, y: -4,
          vx: -0.3 + Math.random() * 0.6, vy: 0.6 + Math.random() * 0.6, life: 1.0,
        });
      }
      for (const p of petalsRef.current) {
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.005;
      }
      petalsRef.current = petalsRef.current.filter((p) => p.y < H + 8 && p.life > 0).slice(-60);

      // ----- Exit transition -----
      if (room.cleared && exitDoor && !exitDoor.solid) {
        if (player.x + player.w >= W - TILE - 2 && player.y + player.h > exitDoor.y && player.y < exitDoor.y + exitDoor.h) {
          if (room.isLast) {
            setScreen("victory");
            sfxVictory();
            stopAmbient();
            if (st.runCoins > 0) addCoins(st.runCoins);
            // Record level cleared + auto-unlock next biome at threshold
            const idx = BIOMES.findIndex((b) => b.id === biome.id);
            const next = idx + 1 < BIOMES.length ? BIOMES[idx + 1].id : null;
            recordLevelClear(biome.id, level, 5, next);
          } else {
            st.currentRoom += 1;
            const next = st.rooms[st.currentRoom];
            player.x = ENTRANCE_TILE.x + TILE + 4;
            player.y = ENTRANCE_TILE.y + 5;
            player.vx = 0; player.vy = 0;
            next.locked = false;
            const ent = next.walls.find((w) => w.kind === "door-entrance");
            if (ent) ent.solid = false;
            setHudRoom(st.currentRoom + 1);
          }
        }
      }

      render(ctx, st);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSnap, biome]);

  const render = (ctx, st) => {
    const room = st.rooms[st.currentRoom];
    // Floor (animated for hell)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawFloorTile(ctx, c * TILE, r * TILE, TILE, (r * 7 + c) % 4, biome, st.time);
      }
    }
    // Pits
    for (const p of room.pits) drawPit(ctx, p.x, p.y, TILE, biome, st.time);
    // Rugs under robots (drawn under)
    for (const r of room.robots) {
      if (r.destroyed) continue;
      drawRug(ctx, r.x - 6, r.y - 4, NPC_SIZE + 12, biome);
    }
    // Walls
    for (const w of room.walls) {
      if (w.kind === "wall") drawWallTile(ctx, w.x, w.y, TILE, biome);
      else if (w.kind === "wall-pillar") drawPillar(ctx, w.x, w.y, TILE, biome);
      else if (w.kind === "door-entrance" || w.kind === "door-exit") drawDoorTile(ctx, w.x, w.y, TILE, w.solid);
    }
    // Torches on walls (drawn after walls so they sit on top)
    for (const tr of room.torches) drawTorch(ctx, tr.x, tr.y, TILE, st.time, biome);
    // Chests
    for (const ch of room.chests) drawChest(ctx, ch.x - 4, ch.y - 4, CHEST_SIZE + 8, ch.opened, biome.chestTier);
    // Robots
    for (const r of room.robots) {
      if (r.destroyed) continue;
      const cx = st.player.x + st.player.w / 2, cy = st.player.y + st.player.h / 2;
      const rx = r.x + r.w / 2, ry = r.y + r.h / 2;
      const alerted = dist(cx, cy, rx, ry) < ROBOT_PROXIMITY_PX + 30;
      drawRobot(ctx, r.x - 4, r.y - 4, NPC_SIZE + 8, st.time, alerted && !r.isCompleted, r.isCompleted);
    }
    // Mobs (alive + death fx)
    for (const m of room.mobs) {
      if (m.alive) {
        const drawFn = MOB_DRAWERS[m.type] || MOB_DRAWERS.skeleton;
        drawFn(ctx, m.x - 5, m.y - 5, ENEMY_SIZE + 10, st.time, st.time < m.hurtUntil);
      } else if (m.deathProgress < 1) {
        drawShatter(ctx, m.x - 5, m.y - 5, ENEMY_SIZE + 10, m.deathProgress, "#e9d8a6");
      }
    }
    // Player
    const p = st.player;
    const flash = st.time < p.iframesUntil && Math.floor(st.time / 60) % 2 === 0;
    if (!flash) {
      const swinging = st.time < p.attackUntil;
      const weapon = WEAPON_BY_ID[storeSnap.weapon];
      drawPlayer(ctx, p.x - 5, p.y - 5, PLAYER_SIZE + 10, p.facing, swinging, false, {
        character: storeSnap.currentCharacter, outfit: storeSnap.equipped, weapon,
      });
      if (swinging) {
        const progress = 1 - (p.attackUntil - st.time) / ATTACK_DURATION_MS;
        drawSlash(ctx, p.x - 8, p.y - 8, PLAYER_SIZE + 16, p.facing, Math.max(0, Math.min(1, progress)));
      }
      // Twin-Beam render
      if (weapon?.id === "twin-beam" && keysRef.current["o"]) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        drawTwinBeam(ctx, cx, cy, p.facing, BEAM_LENGTH, st.time);
      }
    }
    // Petals
    if (biome.id === "sakura") for (const pt of petalsRef.current) drawPetal(ctx, pt.x, pt.y);
    // Lock pulse
    if (room.locked && !room.cleared) {
      const a = 0.18 + Math.sin(st.time / 200) * 0.05;
      ctx.strokeStyle = `rgba(255, 60, 110, ${a})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, W - 4, H - 4);
    }

    // ===== Mini-Map (top-right corner) =====
    drawMiniMap(ctx, st, room);
  };

  const drawMiniMap = (ctx, st, room) => {
    const MM_W = 120, MM_H = 84, MM_X = W - MM_W - 12, MM_Y = 18;
    // metallic frame around the map
    drawMiniMapFrame(ctx, MM_X, MM_Y, MM_W, MM_H);
    // inner bg = biome floor color
    ctx.fillStyle = biome.floor[0];
    ctx.fillRect(MM_X, MM_Y, MM_W, MM_H);
    // walls
    ctx.fillStyle = biome.wallBase;
    ctx.fillRect(MM_X, MM_Y, MM_W, 4);
    ctx.fillRect(MM_X, MM_Y + MM_H - 4, MM_W, 4);
    ctx.fillRect(MM_X, MM_Y, 4, MM_H);
    ctx.fillRect(MM_X + MM_W - 4, MM_Y, 4, MM_H);
    // doors
    const doorEntr = room.walls.find((w) => w.kind === "door-entrance");
    const doorExit = room.walls.find((w) => w.kind === "door-exit");
    if (doorEntr) {
      ctx.fillStyle = doorEntr.solid ? "#ff3a6f" : "#9affd6";
      ctx.fillRect(MM_X, MM_Y + Math.floor(MM_H * 7 / ROWS), 4, Math.ceil(MM_H / ROWS));
    }
    if (doorExit) {
      ctx.fillStyle = doorExit.solid ? "#ff3a6f" : "#9affd6";
      ctx.fillRect(MM_X + MM_W - 4, MM_Y + Math.floor(MM_H * 7 / ROWS), 4, Math.ceil(MM_H / ROWS));
    }
    // pillars
    ctx.fillStyle = biome.pillarColor;
    for (const w of room.walls) {
      if (w.kind !== "wall-pillar") continue;
      const mx = MM_X + Math.floor((w.x / W) * MM_W);
      const my = MM_Y + Math.floor((w.y / H) * MM_H);
      ctx.fillRect(mx, my, 4, 4);
    }
    // torches
    ctx.fillStyle = "#ffd166";
    for (const tr of room.torches) {
      const mx = MM_X + Math.floor((tr.x / W) * MM_W);
      const my = MM_Y + Math.floor((tr.y / H) * MM_H);
      ctx.fillRect(mx + 1, my + 1, 2, 2);
    }
    // chests
    for (const ch of room.chests) {
      ctx.fillStyle = ch.opened ? "#3a2a52" : "#f4bf4f";
      ctx.fillRect(MM_X + Math.floor((ch.x / W) * MM_W), MM_Y + Math.floor((ch.y / H) * MM_H), 4, 4);
    }
    // robots
    for (const r of room.robots) {
      if (r.destroyed) continue;
      ctx.fillStyle = r.isCompleted ? "#5a8a7a" : "#9affd6";
      ctx.fillRect(MM_X + Math.floor((r.x / W) * MM_W), MM_Y + Math.floor((r.y / H) * MM_H), 4, 4);
    }
    // mobs
    for (const m of room.mobs) {
      if (!m.alive) continue;
      ctx.fillStyle = "#ff3a6f";
      ctx.fillRect(MM_X + Math.floor((m.x / W) * MM_W), MM_Y + Math.floor((m.y / H) * MM_H), 3, 3);
    }
    // player (blinks)
    ctx.fillStyle = Math.floor(st.time / 250) % 2 === 0 ? "#ffffff" : "#9affd6";
    ctx.fillRect(MM_X + Math.floor((st.player.x / W) * MM_W), MM_Y + Math.floor((st.player.y / H) * MM_H), 4, 4);
    // label on the frame (positioned below the top metallic band so it doesn't clip)
    ctx.fillStyle = "#e8f4ff";
    ctx.font = "10px monospace";
    ctx.fillText(`${biome.short}  ${st.currentRoom + 1}/${TOTAL_ROOMS}`, MM_X + 4, MM_Y + 12);
  };

  const recoverFromQuiz = (st, robot) => {
    if (!st || !robot) return;
    const p = st.player;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const rx = robot.x + robot.w / 2, ry = robot.y + robot.h / 2;
    let dxr = cx - rx, dyr = cy - ry;
    const len = Math.hypot(dxr, dyr) || 1;
    dxr /= len; dyr /= len;
    const PUSH = 56;
    p.x = Math.max(TILE + 1, Math.min(W - TILE - p.w - 1, p.x + dxr * PUSH));
    p.y = Math.max(TILE + 1, Math.min(H - TILE - p.h - 1, p.y + dyr * PUSH));
    p.iframesUntil = st.time + 1500;
    p.vx = 0; p.vy = 0;
  };

  const handleQuizExit = () => {
    const st = stateRef.current;
    if (!st) { setQuiz({ open: false, robotId: null, question: null, exitClicks: 0, completed: false }); return; }
    const room = st.rooms[st.currentRoom];
    const robot = room.robots.find((r) => r.id === quiz.robotId);
    if (robot) {
      if (!robot.isCompleted) {
        // Only count exit clicks against active robots
        robot.exitClicks += 1;
        if (robot.exitClicks >= 2) { robot.destroyed = true; sfxKill(); }
      }
      recoverFromQuiz(st, robot);
    }
    setQuiz({ open: false, robotId: null, question: null, exitClicks: 0, completed: false });
  };

  const handleQuizAnswered = (isCorrect) => {
    const st = stateRef.current;
    if (st) {
      const room = st.rooms[st.currentRoom];
      const robot = room.robots.find((r) => r.id === quiz.robotId);
      if (robot && isCorrect) {
        robot.isCompleted = true; // "Good job!" — robot deactivates permanently
        robot.exitClicks = 0;
        if (st.player.hp < 3) { st.player.hp += 1; setHudHp(st.player.hp); }
        st.runCoins += 5;
        setHudCoinsRun(st.runCoins);
        toast.success('"Good job!" +5 coins', { duration: 1400 });
      }
      if (robot) recoverFromQuiz(st, robot);
    }
    setQuiz({ open: false, robotId: null, question: null, exitClicks: 0, completed: false });
  };

  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (k === "o" && screen === "playing" && !quiz.open) {
        const st = stateRef.current;
        const weapon = WEAPON_BY_ID[storeSnap.weapon];
        if (st && weapon?.id !== "twin-beam" && st.time >= st.player.attackUntil) {
          st.player.attackUntil = st.time + ATTACK_DURATION_MS;
          sfxAttack();
        }
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    };
    const onUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [screen, quiz.open, storeSnap.weapon]);

  useEffect(() => {
    initGame();
    setScreen("playing");
    startAmbient();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    requestAnimationFrame(() => startLoop());
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = () => {
    initGame();
    setScreen("playing");
    startAmbient();
  };

  const renderHearts = () => Array.from({ length: 3 }).map((_, i) => (
    <span key={i} data-testid={`heart-${i}`} className="inline-block">
      <svg width="28" height="28" viewBox="0 0 8 7" className="crt">
        {["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"].map((row, ri) =>
          row.split("").map((cell, ci) => cell === "1" && (
            <rect key={`${ri}-${ci}`} x={ci} y={ri} width="1" height="1" fill={i < hudHp ? "#ff4d6d" : "#3a2a52"} />
          ))
        )}
      </svg>
    </span>
  ));

  if (screen === "gameover" || screen === "victory") {
    const isWin = screen === "victory";
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10" data-testid={isWin ? "victory-screen" : "gameover-screen"}>
        <div className="max-w-2xl w-full text-center fade-in">
          <h1 className={`pixel-font text-4xl sm:text-6xl mb-6 ${isWin ? "text-[#9affd6] glow-cyan" : "text-[#ff6ec7] glow-magenta"}`}>
            {isWin ? `LEVEL ${level} CLEARED` : "GAME OVER"}
          </h1>
          <p className="text-xl text-[#bba6e0] mb-4">
            {isWin
              ? "Probability bends to your will. The next biome awaits."
              : "The dungeon claims another wandering scholar..."}
          </p>
          <p className="text-lg text-[#ffd166] mb-8">You earned <span className="glow-amber font-bold">{hudCoinsRun}</span> coins this run.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button data-testid="restart-btn" onClick={restart} className="btn-pixel">{isWin ? "RUN AGAIN" : "TRY AGAIN"}</button>
            <button data-testid="back-to-hub-btn" onClick={onExit} className="btn-pixel btn-exit">BACK TO HUB</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 dungeon-shell" data-testid="playing-screen">
      <div className="hud-bar w-full max-w-3xl px-5 py-3 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="pixel-font text-xs text-[#f4bf4f] mr-2">HP</span>
          <div className="flex items-center gap-1" data-testid="hud-hearts">{renderHearts()}</div>
        </div>
        <div className="pixel-font text-xs glow-cyan" data-testid="hud-room" style={{ color: biome.color }}>
          {biome.short} · LVL {level} · ROOM {hudRoom}/{TOTAL_ROOMS}
        </div>
        <div className="flex items-center gap-2" data-testid="hud-coins">
          <span className="pixel-font text-xs text-[#f4bf4f]">COINS</span>
          <span className="text-lg text-[#ffd166] glow-amber font-bold">+{hudCoinsRun}</span>
          <span className="text-sm text-[#bba6e0]">({storeSnap.coins} saved)</span>
        </div>
        <button
          data-testid="dungeon-exit-btn"
          onClick={() => { stopAmbient(); if (stateRef.current?.runCoins > 0) addCoins(stateRef.current.runCoins); onExit(); }}
          className="btn-pixel btn-exit !py-2 !px-3 !text-[10px]"
        >HUB</button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="dungeon-canvas crt"
          data-testid="game-canvas"
          style={{ width: "min(98vw, 1280px)", height: "auto", aspectRatio: `${W} / ${H}` }}
        />
        <div className="absolute inset-0 pointer-events-none scanlines" />
      </div>

      <div className="mt-4 text-sm text-[#bba6e0] text-center max-w-xl">
        Defeat all mobs <span className="text-[#f4bf4f]">AND</span> deactivate every robot. The exit unlocks only when both are done.
      </div>

      <QuizDialog
        open={quiz.open}
        question={quiz.question}
        exitClicks={quiz.exitClicks}
        completed={quiz.completed}
        onExit={handleQuizExit}
        onAnswered={handleQuizAnswered}
      />
    </div>
  );
}
