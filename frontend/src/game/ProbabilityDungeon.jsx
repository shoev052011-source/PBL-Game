import React, { useEffect, useRef, useState, useCallback } from "react";
import QuizDialog from "./QuizDialog";
import { PROBABILITY_QUESTIONS } from "./questions";
import {
  drawFloorTile,
  drawWallTile,
  drawDoorTile,
  drawPlayer,
  drawSkeleton,
  drawRobot,
  drawHeart,
  drawSlash,
} from "./sprites";
import {
  sfxStep,
  sfxAttack,
  sfxHit,
  sfxKill,
  sfxLock,
  sfxUnlock,
  sfxGameOver,
  sfxVictory,
  startAmbient,
  stopAmbient,
} from "./audio";

// ----- Constants -----
const TILE = 32;
const COLS = 16;
const ROWS = 12;
const W = COLS * TILE; // 512
const H = ROWS * TILE; // 384
const PLAYER_SIZE = 22;
const ENEMY_SIZE = 22;
const NPC_SIZE = 24;
const PLAYER_SPEED = 2.0;
const ENEMY_SPEED = 0.95;
const ATTACK_RANGE = 30;
const ATTACK_DURATION_MS = 220;
const IFRAME_MS = 700;
const SAFETY_BUFFER_PX = 56; // ~1.75 tiles
const ROBOT_PROXIMITY_PX = 40;
const TOTAL_ROOMS = 8;

// ----- Helpers -----
const aabb = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

// Build room: outer walls + entrance/exit door tiles
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

// Indices into walls for entrance (left, mid) and exit (right, mid)
// Entrance door tile: x=0, y=5*TILE  (col 0, row 5)
// Exit door tile:    x=(COLS-1)*TILE, y=5*TILE  (col 15, row 5)
const ENTRANCE_TILE = { x: 0, y: 5 * TILE };
const EXIT_TILE = { x: (COLS - 1) * TILE, y: 5 * TILE };

const buildRoom = (index, total) => {
  const walls = buildRoomWalls();
  // mark door slots (we still keep wall but flag as door so we can render and toggle solidity)
  for (const w of walls) {
    if (w.x === ENTRANCE_TILE.x && w.y === ENTRANCE_TILE.y) {
      w.kind = "door-entrance";
      w.solid = true; // initially passable visually but we treat as open until locked
    } else if (w.x === EXIT_TILE.x && w.y === EXIT_TILE.y) {
      w.kind = "door-exit";
      w.solid = true; // locked while enemies live
    }
  }

  // Difficulty scales with index
  const skelCount = Math.min(2 + Math.floor(index * 0.7), 6);
  const robotCount = index === 0 ? 1 : Math.random() < 0.7 ? 1 : 2;

  // Spawn skeletons at random positions away from entrance
  const skeletons = [];
  for (let i = 0; i < skelCount; i++) {
    let tries = 0;
    while (tries < 30) {
      const sx = 4 * TILE + Math.random() * (W - 6 * TILE);
      const sy = 2 * TILE + Math.random() * (H - 4 * TILE);
      if (sx > 5 * TILE) {
        skeletons.push({
          id: `sk-${index}-${i}`,
          x: sx,
          y: sy,
          w: ENEMY_SIZE,
          h: ENEMY_SIZE,
          hp: 2,
          hurtUntil: 0,
          alive: true,
        });
        break;
      }
      tries++;
    }
  }

  // Robots: place in less central spots, never blocking exit
  const robots = [];
  const robotSpots = [
    { x: 6 * TILE, y: 2 * TILE },
    { x: 9 * TILE, y: 8 * TILE },
    { x: 11 * TILE, y: 3 * TILE },
    { x: 4 * TILE, y: 8 * TILE },
  ];
  for (let i = 0; i < robotCount; i++) {
    const spot = robotSpots[(index + i) % robotSpots.length];
    robots.push({
      id: `rb-${index}-${i}`,
      x: spot.x,
      y: spot.y,
      w: NPC_SIZE,
      h: NPC_SIZE,
      questionIdx: (index * 3 + i) % PROBABILITY_QUESTIONS.length,
      exitClicks: 0,
      destroyed: false,
    });
  }

  return {
    index,
    isLast: index === total - 1,
    walls,
    skeletons,
    robots,
    locked: false, // set to true after safety buffer crossed
    cleared: false,
  };
};

// ----- Component -----
export default function ProbabilityDungeon() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null); // mutable game state
  const keysRef = useRef({});
  const rafRef = useRef(null);
  const [screen, setScreen] = useState("title"); // title | playing | gameover | victory
  const [hudHp, setHudHp] = useState(3);
  const [hudRoom, setHudRoom] = useState(1);
  const [quiz, setQuiz] = useState({ open: false, robotId: null, question: null, exitClicks: 0 });

  // Initialize game state
  const initGame = useCallback(() => {
    const rooms = [];
    for (let i = 0; i < TOTAL_ROOMS; i++) rooms.push(buildRoom(i, TOTAL_ROOMS));
    stateRef.current = {
      rooms,
      currentRoom: 0,
      player: {
        x: ENTRANCE_TILE.x + TILE + 4,
        y: ENTRANCE_TILE.y + 5,
        w: PLAYER_SIZE,
        h: PLAYER_SIZE,
        facing: "right",
        hp: 3,
        iframesUntil: 0,
        attackUntil: 0,
        moving: false,
      },
      time: 0,
      slashes: [], // visual slashes
      lastFrameTs: 0,
      lockedNotifiedThisRoom: false,
      activeRobotId: null,
    };
    setHudHp(3);
    setHudRoom(1);
  }, []);

  // ----- Movement & Collision -----
  const moveAndCollide = (entity, dx, dy, walls) => {
    // X axis
    entity.x += dx;
    for (const w of walls) {
      if (!isWallSolid(w)) continue;
      if (aabb(entity, w)) {
        if (dx > 0) entity.x = w.x - entity.w;
        else if (dx < 0) entity.x = w.x + w.w;
      }
    }
    // Y axis
    entity.y += dy;
    for (const w of walls) {
      if (!isWallSolid(w)) continue;
      if (aabb(entity, w)) {
        if (dy > 0) entity.y = w.y - entity.h;
        else if (dy < 0) entity.y = w.y + w.h;
      }
    }
  };

  const isWallSolid = (w) => {
    if (w.kind === "wall") return true;
    if (w.kind === "door-entrance") return w.solid;
    if (w.kind === "door-exit") return w.solid;
    return false;
  };

  // ----- Game Loop -----
  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const tick = (ts) => {
      const st = stateRef.current;
      if (!st) return;
      const dt = Math.min(48, ts - (st.lastFrameTs || ts));
      st.lastFrameTs = ts;
      st.time += dt;

      const room = st.rooms[st.currentRoom];
      const player = st.player;

      // ---- Input ----
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      const speed = PLAYER_SPEED * (dt / 16.67);
      if (keys["w"] || keys["arrowup"]) { dy -= speed; player.facing = "up"; }
      if (keys["s"] || keys["arrowdown"]) { dy += speed; player.facing = "down"; }
      if (keys["a"] || keys["arrowleft"]) { dx -= speed; player.facing = "left"; }
      if (keys["d"] || keys["arrowright"]) { dx += speed; player.facing = "right"; }
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      player.moving = dx !== 0 || dy !== 0;
      if (player.moving) sfxStep();

      // Don't allow movement during quiz
      if (!quiz.open) {
        moveAndCollide(player, dx, dy, room.walls);
      }

      // ---- Room Lock Logic ----
      if (!room.locked) {
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        const ex = ENTRANCE_TILE.x + TILE / 2;
        const ey = ENTRANCE_TILE.y + TILE / 2;
        if (dist(px, py, ex, ey) >= SAFETY_BUFFER_PX) {
          // Lock the entrance: spawn closing wall
          const entrance = room.walls.find((w) => w.kind === "door-entrance");
          if (entrance) entrance.solid = true;
          room.locked = true;
          sfxLock();

          // Anti-stuck nudge if overlap
          if (entrance && aabb(player, entrance)) {
            player.x = W / 2 - player.w / 2;
            player.y = H / 2 - player.h / 2;
          }
        } else {
          // While not yet locked, entrance is passable
          const entrance = room.walls.find((w) => w.kind === "door-entrance");
          if (entrance) entrance.solid = false;
        }
      }

      // Exit door: locked until cleared
      const exitDoor = room.walls.find((w) => w.kind === "door-exit");
      if (exitDoor) {
        const aliveSkeletons = room.skeletons.filter((s) => s.alive).length;
        if (aliveSkeletons === 0 && !room.cleared) {
          room.cleared = true;
          exitDoor.solid = false;
          sfxUnlock();
        }
      }

      // ---- Skeletons ----
      if (!quiz.open) {
        for (const s of room.skeletons) {
          if (!s.alive) continue;
          const sx = s.x + s.w / 2;
          const sy = s.y + s.h / 2;
          const px = player.x + player.w / 2;
          const py = player.y + player.h / 2;
          const angle = Math.atan2(py - sy, px - sx);
          const sdx = Math.cos(angle) * ENEMY_SPEED * (dt / 16.67);
          const sdy = Math.sin(angle) * ENEMY_SPEED * (dt / 16.67);
          // separate from other skeletons (simple)
          let pushX = 0;
          let pushY = 0;
          for (const o of room.skeletons) {
            if (o === s || !o.alive) continue;
            const d = dist(s.x, s.y, o.x, o.y);
            if (d < 22 && d > 0) {
              pushX += (s.x - o.x) / d * 0.35;
              pushY += (s.y - o.y) / d * 0.35;
            }
          }
          moveAndCollide(s, sdx + pushX, sdy + pushY, room.walls);

          // Damage player on contact
          if (aabb(s, player) && st.time > player.iframesUntil) {
            player.hp -= 1;
            player.iframesUntil = st.time + IFRAME_MS;
            sfxHit();
            setHudHp(player.hp);
            // knockback
            player.x += Math.cos(angle) * -10;
            player.y += Math.sin(angle) * -10;
            if (player.hp <= 0) {
              setScreen("gameover");
              sfxGameOver();
              stopAmbient();
            }
          }
        }
      }

      // ---- Attack ----
      const attacking = st.time < player.attackUntil;
      if (attacking) {
        // hitbox in front of player
        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;
        const off = ATTACK_RANGE;
        let hbx = cx;
        let hby = cy;
        if (player.facing === "right") hbx += off / 2;
        if (player.facing === "left") hbx -= off / 2;
        if (player.facing === "up") hby -= off / 2;
        if (player.facing === "down") hby += off / 2;
        const hb = { x: hbx - 14, y: hby - 14, w: 28, h: 28 };
        for (const s of room.skeletons) {
          if (!s.alive) continue;
          if (st.time < s.hurtUntil) continue;
          if (aabb(hb, s)) {
            s.hp -= 1;
            s.hurtUntil = st.time + 250;
            // knockback
            const angle = Math.atan2(s.y - cy, s.x - cx);
            s.x += Math.cos(angle) * 8;
            s.y += Math.sin(angle) * 8;
            if (s.hp <= 0) {
              s.alive = false;
              sfxKill();
            } else {
              sfxHit();
            }
          }
        }
      }

      // ---- Robot Proximity ----
      if (!quiz.open && room.locked) {
        for (const r of room.robots) {
          if (r.destroyed) continue;
          const cx = player.x + player.w / 2;
          const cy = player.y + player.h / 2;
          const rx = r.x + r.w / 2;
          const ry = r.y + r.h / 2;
          if (dist(cx, cy, rx, ry) < ROBOT_PROXIMITY_PX) {
            st.activeRobotId = r.id;
            setQuiz({
              open: true,
              robotId: r.id,
              question: PROBABILITY_QUESTIONS[r.questionIdx],
              exitClicks: r.exitClicks,
            });
            // small bump back so player isn't re-triggering immediately on close
            player.x += (cx < rx ? -1 : 1) * 14;
            player.y += (cy < ry ? -1 : 1) * 14;
            break;
          }
        }
      }

      // ---- Exit transition ----
      if (room.cleared && exitDoor && !exitDoor.solid) {
        // If player walks into / past exit
        if (player.x + player.w >= W - TILE - 2 && player.y + player.h > exitDoor.y && player.y < exitDoor.y + exitDoor.h) {
          if (room.isLast) {
            setScreen("victory");
            sfxVictory();
            stopAmbient();
          } else {
            // advance
            st.currentRoom += 1;
            const next = st.rooms[st.currentRoom];
            // place player just inside entrance
            player.x = ENTRANCE_TILE.x + TILE + 4;
            player.y = ENTRANCE_TILE.y + 5;
            next.locked = false;
            const ent = next.walls.find((w) => w.kind === "door-entrance");
            if (ent) ent.solid = false;
            setHudRoom(st.currentRoom + 1);
          }
        }
      }

      // ---- Render ----
      render(ctx, st);

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [quiz.open]);

  // ----- Render -----
  const render = (ctx, st) => {
    // Floor
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawFloorTile(ctx, c * TILE, r * TILE, TILE, (r * 7 + c) % 4);
      }
    }
    const room = st.rooms[st.currentRoom];

    // Walls + doors
    for (const w of room.walls) {
      if (w.kind === "wall") drawWallTile(ctx, w.x, w.y, TILE);
      else if (w.kind === "door-entrance") drawDoorTile(ctx, w.x, w.y, TILE, w.solid);
      else if (w.kind === "door-exit") drawDoorTile(ctx, w.x, w.y, TILE, w.solid);
    }

    // Robots
    for (const r of room.robots) {
      if (r.destroyed) continue;
      const cx = st.player.x + st.player.w / 2;
      const cy = st.player.y + st.player.h / 2;
      const rx = r.x + r.w / 2;
      const ry = r.y + r.h / 2;
      const alerted = dist(cx, cy, rx, ry) < ROBOT_PROXIMITY_PX + 30;
      drawRobot(ctx, r.x - 4, r.y - 4, NPC_SIZE + 8, st.time, alerted);
    }

    // Skeletons
    for (const s of room.skeletons) {
      if (!s.alive) continue;
      const hurt = st.time < s.hurtUntil;
      drawSkeleton(ctx, s.x - 5, s.y - 5, ENEMY_SIZE + 10, st.time, hurt);
    }

    // Player
    const p = st.player;
    const flash = st.time < p.iframesUntil && Math.floor(st.time / 60) % 2 === 0;
    if (!flash) {
      const swinging = st.time < p.attackUntil;
      drawPlayer(p.attackOffsetCtx || ctx, p.x - 5, p.y - 5, PLAYER_SIZE + 10, p.facing, swinging, false);
      if (swinging) {
        const progress = 1 - (p.attackUntil - st.time) / ATTACK_DURATION_MS;
        drawSlash(ctx, p.x - 8, p.y - 8, PLAYER_SIZE + 16, p.facing, Math.max(0, Math.min(1, progress)));
      }
    }

    // Lock indicator overlay
    if (!room.locked) {
      ctx.fillStyle = "rgba(255, 110, 199, 0.06)";
      ctx.fillRect(0, 0, W, H);
    } else if (!room.cleared) {
      // pulsing red border to show locked
      const a = 0.18 + Math.sin(st.time / 200) * 0.05;
      ctx.strokeStyle = `rgba(255, 60, 110, ${a})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, W - 4, H - 4);
    }
  };

  // ----- Input -----
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (k === "o" && screen === "playing" && !quiz.open) {
        const st = stateRef.current;
        if (st && st.time >= st.player.attackUntil) {
          st.player.attackUntil = st.time + ATTACK_DURATION_MS;
          sfxAttack();
        }
      }
      // prevent default for arrows/space
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    };
    const onUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [screen, quiz.open]);

  // ----- Start / Restart -----
  const startGame = () => {
    initGame();
    setScreen("playing");
    startAmbient();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    requestAnimationFrame(() => startLoop());
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAmbient();
    };
  }, []);

  // Restart loop when quiz state changes (so callback captures latest)
  useEffect(() => {
    if (screen !== "playing") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.open, screen]);

  // ----- Quiz callbacks -----
  const handleQuizExit = () => {
    const st = stateRef.current;
    if (!st) { setQuiz({ open: false, robotId: null, question: null, exitClicks: 0 }); return; }
    const room = st.rooms[st.currentRoom];
    const robot = room.robots.find((r) => r.id === quiz.robotId);
    if (robot) {
      robot.exitClicks += 1;
      if (robot.exitClicks >= 2) {
        robot.destroyed = true;
        sfxKill();
      }
    }
    setQuiz({ open: false, robotId: null, question: null, exitClicks: 0 });
  };

  const handleQuizAnswered = (isCorrect) => {
    const st = stateRef.current;
    if (st) {
      const room = st.rooms[st.currentRoom];
      const robot = room.robots.find((r) => r.id === quiz.robotId);
      if (robot && isCorrect) {
        // Reward: small heal capped at 3 (and reset exit clicks)
        robot.exitClicks = 0;
        if (st.player.hp < 3) {
          st.player.hp += 1;
          setHudHp(st.player.hp);
        }
        // Move robot to a "satisfied" state by advancing question
        robot.questionIdx = (robot.questionIdx + 1) % PROBABILITY_QUESTIONS.length;
      }
    }
    setQuiz({ open: false, robotId: null, question: null, exitClicks: 0 });
  };

  // ----- HUD Hearts -----
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <span key={i} data-testid={`heart-${i}`} className={`inline-block ${i < hudHp ? "heart-pop" : ""}`}>
          <svg width="28" height="28" viewBox="0 0 8 7" className="crt">
            {[
              "01100110",
              "11111111",
              "11111111",
              "11111111",
              "01111110",
              "00111100",
              "00011000",
            ].map((row, ri) =>
              row.split("").map((cell, ci) => cell === "1" && (
                <rect key={`${ri}-${ci}`} x={ci} y={ri} width="1" height="1" fill={i < hudHp ? "#ff4d6d" : "#3a2a52"} />
              ))
            )}
          </svg>
        </span>
      );
    }
    return hearts;
  };

  // ----- Screens -----
  if (screen === "title") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10" data-testid="title-screen">
        <div className="max-w-3xl w-full text-center fade-in">
          <h1 className="pixel-font text-3xl sm:text-5xl lg:text-6xl text-[#f4bf4f] glow-amber mb-4">
            PROBABILITY
          </h1>
          <h1 className="pixel-font text-3xl sm:text-5xl lg:text-6xl text-[#ff6ec7] glow-magenta mb-8">
            DUNGEON
          </h1>
          <p className="text-xl text-[#9affd6] mb-2">A top-down pixel-art ARPG</p>
          <p className="text-base text-[#bba6e0] mb-8 max-w-xl mx-auto">
            Slay skeletons. Outsmart robots. Master probability.
            <br />
            Eight rooms. Three hearts. One brave hero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
            <button
              data-testid="start-game-btn"
              onClick={startGame}
              className="btn-pixel"
            >
              ENTER THE DUNGEON
            </button>
          </div>
          <div className="hud-bar inline-block px-6 py-4 text-left text-base text-[#e9d8a6]">
            <div className="pixel-font text-xs text-[#f4bf4f] mb-3">// CONTROLS</div>
            <div><span className="text-[#9affd6] font-bold">WASD</span> or <span className="text-[#9affd6] font-bold">Arrows</span> — move</div>
            <div><span className="text-[#9affd6] font-bold">O</span> — swing weapon</div>
            <div><span className="text-[#9affd6] font-bold">Walk near a robot</span> — open quiz</div>
            <div><span className="text-[#9affd6] font-bold">Exit twice</span> — robot powers down</div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "gameover" || screen === "victory") {
    const isWin = screen === "victory";
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10" data-testid={isWin ? "victory-screen" : "gameover-screen"}>
        <div className="max-w-2xl w-full text-center fade-in">
          <h1 className={`pixel-font text-4xl sm:text-6xl mb-6 ${isWin ? "text-[#9affd6] glow-cyan" : "text-[#ff6ec7] glow-magenta"}`}>
            {isWin ? "DUNGEON CLEARED" : "GAME OVER"}
          </h1>
          <p className="text-xl text-[#bba6e0] mb-8">
            {isWin
              ? "The probabilities yielded. The robots remember your name."
              : "The skeletons claim another wandering scholar..."}
          </p>
          <button data-testid="restart-btn" onClick={startGame} className="btn-pixel">
            {isWin ? "PLAY AGAIN" : "TRY AGAIN"}
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 dungeon-shell" data-testid="playing-screen">
      {/* HUD */}
      <div className="hud-bar w-full max-w-3xl px-5 py-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pixel-font text-xs text-[#f4bf4f] mr-2">HP</span>
          <div className="flex items-center gap-1" data-testid="hud-hearts">{renderHearts()}</div>
        </div>
        <div className="pixel-font text-xs text-[#9affd6] glow-cyan" data-testid="hud-room">
          ROOM {hudRoom} / {TOTAL_ROOMS}
        </div>
        <div className="pixel-font text-xs text-[#bba6e0]">
          [O] ATTACK · [WASD] MOVE
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="dungeon-canvas crt"
          data-testid="game-canvas"
          style={{
            width: "min(96vw, 1024px)",
            height: "auto",
            aspectRatio: `${W} / ${H}`,
          }}
        />
        <div className="absolute inset-0 pointer-events-none scanlines" />
      </div>

      <div className="mt-4 text-sm text-[#bba6e0] text-center max-w-xl">
        Defeat all skeletons to unlock the exit door. Approach a robot to face a probability quiz.
      </div>

      <QuizDialog
        open={quiz.open}
        question={quiz.question}
        exitClicks={quiz.exitClicks}
        onExit={handleQuizExit}
        onAnswered={handleQuizAnswered}
      />
    </div>
  );
}
