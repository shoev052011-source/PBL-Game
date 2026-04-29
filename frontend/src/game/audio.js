// Lightweight Web Audio synth for nostalgic chiptune SFX + ambient loop.
// No external assets — pure oscillator/noise synthesis.

let ctx = null;
let masterGain = null;
let ambientNodes = null;
let ambientPlaying = false;

const ensureCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const tone = ({ freq = 440, dur = 0.15, type = "square", vol = 0.18, slideTo = null, attack = 0.005, release = 0.05 }) => {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
  g.gain.linearRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + dur + release);
};

const noiseBurst = ({ dur = 0.18, vol = 0.18, filterFreq = 1800 }) => {
  const c = ensureCtx();
  if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = filterFreq;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(bp);
  bp.connect(g);
  g.connect(masterGain);
  src.start();
};

// SFX
let lastStep = 0;
export const sfxStep = () => {
  const now = performance.now();
  if (now - lastStep < 140) return; // throttle
  lastStep = now;
  noiseBurst({ dur: 0.06, vol: 0.08, filterFreq: 600 + Math.random() * 200 });
};

export const sfxAttack = () => {
  tone({ freq: 720, slideTo: 280, dur: 0.13, type: "square", vol: 0.18 });
  noiseBurst({ dur: 0.08, vol: 0.06, filterFreq: 2400 });
};

export const sfxHit = () => {
  tone({ freq: 220, slideTo: 90, dur: 0.18, type: "sawtooth", vol: 0.22 });
};

export const sfxKill = () => {
  tone({ freq: 520, slideTo: 130, dur: 0.22, type: "square", vol: 0.2 });
  setTimeout(() => tone({ freq: 380, slideTo: 80, dur: 0.22, type: "triangle", vol: 0.18 }), 80);
};

export const sfxPickup = () => {
  tone({ freq: 660, dur: 0.1, type: "square", vol: 0.16 });
  setTimeout(() => tone({ freq: 990, dur: 0.12, type: "square", vol: 0.16 }), 90);
};

export const sfxQuizOpen = () => {
  tone({ freq: 440, dur: 0.08, type: "square", vol: 0.14 });
  setTimeout(() => tone({ freq: 587, dur: 0.1, type: "square", vol: 0.14 }), 70);
};

export const sfxCorrect = () => {
  tone({ freq: 523, dur: 0.1, type: "square", vol: 0.16 });
  setTimeout(() => tone({ freq: 659, dur: 0.1, type: "square", vol: 0.16 }), 100);
  setTimeout(() => tone({ freq: 784, dur: 0.18, type: "square", vol: 0.16 }), 200);
};

export const sfxWrong = () => {
  tone({ freq: 200, dur: 0.18, type: "sawtooth", vol: 0.18 });
  setTimeout(() => tone({ freq: 140, dur: 0.22, type: "sawtooth", vol: 0.18 }), 120);
};

export const sfxLock = () => {
  tone({ freq: 110, slideTo: 60, dur: 0.5, type: "sawtooth", vol: 0.22 });
};

export const sfxUnlock = () => {
  tone({ freq: 300, slideTo: 800, dur: 0.4, type: "square", vol: 0.18 });
};

export const sfxGameOver = () => {
  tone({ freq: 440, dur: 0.25, type: "square", vol: 0.2 });
  setTimeout(() => tone({ freq: 330, dur: 0.25, type: "square", vol: 0.2 }), 220);
  setTimeout(() => tone({ freq: 220, dur: 0.4, type: "square", vol: 0.2 }), 440);
  setTimeout(() => tone({ freq: 165, dur: 0.7, type: "triangle", vol: 0.22 }), 700);
};

export const sfxVictory = () => {
  const notes = [523, 659, 784, 1046];
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, dur: 0.18, type: "square", vol: 0.18 }), i * 120));
};

// Nostalgic ambient loop — slow arpeggio in minor key (A minor).
// Loops until stopAmbient is called.
export const startAmbient = () => {
  const c = ensureCtx();
  if (!c || ambientPlaying) return;
  ambientPlaying = true;
  // Pattern: A2, E3, A3, C4, E4, A3, E3, C4 (loop)
  const pattern = [110.0, 164.81, 220.0, 261.63, 329.63, 220.0, 164.81, 261.63];
  const stepDur = 0.42;
  let i = 0;
  const padGain = c.createGain();
  padGain.gain.value = 0.06;
  padGain.connect(masterGain);
  // soft reverb-ish feedback delay
  const delay = c.createDelay();
  delay.delayTime.value = 0.36;
  const fb = c.createGain();
  fb.gain.value = 0.32;
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(padGain);

  const playStep = () => {
    if (!ambientPlaying) return;
    const f = pattern[i % pattern.length];
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.09, c.currentTime + 0.04);
    g.gain.linearRampToValueAtTime(0.0001, c.currentTime + stepDur * 1.5);
    osc.connect(g);
    g.connect(padGain);
    g.connect(delay);
    osc.start();
    osc.stop(c.currentTime + stepDur * 1.6);

    // Sub bass every 4 steps
    if (i % 4 === 0) {
      const bass = c.createOscillator();
      bass.type = "sine";
      bass.frequency.value = 55;
      const bg = c.createGain();
      bg.gain.setValueAtTime(0, c.currentTime);
      bg.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.05);
      bg.gain.linearRampToValueAtTime(0.0001, c.currentTime + stepDur * 3);
      bass.connect(bg);
      bg.connect(masterGain);
      bass.start();
      bass.stop(c.currentTime + stepDur * 3.2);
    }
    i++;
    ambientNodes = setTimeout(playStep, stepDur * 1000);
  };
  playStep();
};

export const stopAmbient = () => {
  ambientPlaying = false;
  if (ambientNodes) clearTimeout(ambientNodes);
  ambientNodes = null;
};

export const setMasterVolume = (v) => {
  ensureCtx();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
};
