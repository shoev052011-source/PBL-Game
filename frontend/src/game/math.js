// Tiered math questions per biome difficulty.
// QUESTION_TIERS[tier] is a static fallback pool.
// generateQuestion(biomeTier, level) scales complexity programmatically per level (1-15).

const Q = (q, options, answerIndex, numeric) => ({ q, options, answerIndex, numeric });

export const QUESTION_TIERS = [
  // Tier 0 - basic arithmetic
  [
    Q("What is 7 + 5?", ["10", "11", "12", "13"], 2, "12"),
    Q("What is 9 - 4?", ["3", "4", "5", "6"], 2, "5"),
    Q("What is 8 + 6?", ["12", "13", "14", "15"], 2, "14"),
  ],
  // Tier 1 - mult/div
  [
    Q("What is 6 × 7?", ["36", "40", "42", "48"], 2, "42"),
    Q("What is 56 ÷ 8?", ["6", "7", "8", "9"], 1, "7"),
  ],
  // Tier 2 - fractions
  [
    Q("What is 1/2 + 1/4?", ["1/3", "2/4", "3/4", "1"], 2, "3/4"),
  ],
  // Tier 3 - percentages
  [
    Q("What is 50% of 80?", ["20", "30", "40", "50"], 2, "40"),
  ],
  // Tier 4 - algebra
  [
    Q("Solve: x + 7 = 12. What is x?", ["3", "4", "5", "6"], 2, "5"),
  ],
];

export const pickQuestion = (tier, seed = 0) => {
  const pool = QUESTION_TIERS[Math.max(0, Math.min(QUESTION_TIERS.length - 1, tier))];
  return pool[seed % pool.length];
};

// --- Helpers ---
const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const distract = (correctNum, count = 3, range = 5) => {
  const set = new Set();
  while (set.size < count) {
    const delta = rint(-range, range);
    if (delta !== 0) set.add(correctNum + delta);
  }
  return Array.from(set);
};
const mkQ = (text, correctVal, distractors, numeric) => {
  const all = shuffle([correctVal, ...distractors]);
  return Q(text, all.map(String), all.indexOf(correctVal), numeric ?? String(correctVal));
};

// gcd for fraction simplification
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const simplifyFrac = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };

// =================================================================
// generateQuestion — biomeTier (0..4) × level (1..15) -> scaled question
// =================================================================
export const generateQuestion = (biomeTier = 0, level = 1) => {
  const tier = Math.max(0, Math.min(4, biomeTier));
  const lvl = Math.max(1, Math.min(15, level));
  const subTier = lvl <= 5 ? "easy" : lvl <= 10 ? "mid" : "hard";

  // ===== Tier 0 — Arithmetic =====
  if (tier === 0) {
    if (subTier === "easy") {
      // 1-15 + 1-15
      const a = rint(2, 12 + lvl), b = rint(2, 12 + lvl);
      return mkQ(`What is ${a} + ${b}?`, a + b, distract(a + b, 3, 4));
    }
    if (subTier === "mid") {
      // 2-digit add/sub
      const a = rint(15, 60), b = rint(8, a - 2);
      if (Math.random() < 0.5) return mkQ(`What is ${a} + ${b}?`, a + b, distract(a + b, 3, 6));
      return mkQ(`What is ${a} - ${b}?`, a - b, distract(a - b, 3, 6));
    }
    // hard — 3-term or negatives
    const a = rint(20, 90), b = rint(5, 40), c = rint(2, 20);
    if (Math.random() < 0.5) return mkQ(`What is ${a} + ${b} - ${c}?`, a + b - c, distract(a + b - c, 3, 7));
    return mkQ(`What is ${a} - ${b} + ${c}?`, a - b + c, distract(a - b + c, 3, 7));
  }

  // ===== Tier 1 — Multiplication / Division =====
  if (tier === 1) {
    if (subTier === "easy") {
      // table multiplication
      const a = rint(2, 9), b = rint(2, 9);
      return mkQ(`What is ${a} × ${b}?`, a * b, distract(a * b, 3, 5));
    }
    if (subTier === "mid") {
      // 2-digit × 1-digit or simple division
      if (Math.random() < 0.55) {
        const a = rint(11, 25), b = rint(2, 9);
        return mkQ(`What is ${a} × ${b}?`, a * b, distract(a * b, 3, 8));
      }
      const b = rint(3, 9), a = b * rint(2, 12);
      return mkQ(`What is ${a} ÷ ${b}?`, a / b, distract(a / b, 3, 3));
    }
    // hard — division with remainder
    const b = rint(3, 12), q = rint(4, 15), r = rint(1, b - 1);
    const a = b * q + r;
    return Q(
      `What is ${a} ÷ ${b}? (give remainder)`,
      shuffle([
        `${q} r ${r}`,
        `${q + 1} r ${Math.max(0, r - 1)}`,
        `${q - 1} r ${Math.min(b - 1, r + 1)}`,
        `${q} r ${(r + 2) % b}`,
      ]),
      0, // we will replace below
      `${q} r ${r}`,
    );
  }

  // ===== Tier 2 — Fractions =====
  if (tier === 2) {
    if (subTier === "easy") {
      // same-denom add
      const d = rint(3, 8);
      const a = rint(1, d - 1), b = rint(1, d - a);
      const [nS, dS] = simplifyFrac(a + b, d);
      const ans = `${nS}/${dS}`;
      const opts = shuffle([ans, `${a}/${d}`, `${a + b}/${d * 2}`, `${a + b - 1}/${d}`]);
      return Q(`What is ${a}/${d} + ${b}/${d}?`, opts, opts.indexOf(ans), ans);
    }
    if (subTier === "mid") {
      // mixed denominators
      const d1 = 2 + rint(0, 2) * 2; // 2,4,6
      const d2 = 3 + rint(0, 2) * 3; // 3,6,9
      const n1 = 1, n2 = 1;
      // 1/d1 + 1/d2
      const lcm = (d1 * d2) / (gcd(d1, d2) || 1);
      const sumN = (lcm / d1) * n1 + (lcm / d2) * n2;
      const [nS, dS] = simplifyFrac(sumN, lcm);
      const ans = `${nS}/${dS}`;
      const opts = shuffle([ans, `${sumN}/${lcm}`, `2/${d1 + d2}`, `1/${d1 + d2}`]);
      return Q(`What is 1/${d1} + 1/${d2}?`, opts, opts.indexOf(ans), ans);
    }
    // hard — multiplication of fractions
    const a = rint(1, 3), b = rint(2, 5), c = rint(1, 3), d = rint(2, 5);
    const [nS, dS] = simplifyFrac(a * c, b * d);
    const ans = `${nS}/${dS}`;
    const opts = shuffle([ans, `${a + c}/${b + d}`, `${a * c}/${b + d}`, `${a + c}/${b * d}`]);
    return Q(`What is ${a}/${b} × ${c}/${d}?`, opts, opts.indexOf(ans), ans);
  }

  // ===== Tier 3 — Percentages / Decimals =====
  if (tier === 3) {
    if (subTier === "easy") {
      // X% of round number
      const pct = [10, 20, 25, 50][rint(0, 3)];
      const base = [40, 60, 80, 100, 120, 200][rint(0, 5)];
      const ans = (base * pct) / 100;
      return mkQ(`What is ${pct}% of ${base}?`, ans, distract(ans, 3, 8));
    }
    if (subTier === "mid") {
      const pct = rint(5, 45);
      const base = [50, 100, 150, 200, 250][rint(0, 4)];
      const ans = (base * pct) / 100;
      return mkQ(`What is ${pct}% of ${base}?`, ans, distract(ans, 3, 8));
    }
    // hard — decimal multiplication
    const a = (rint(11, 25) / 10).toFixed(1);
    const b = rint(2, 9);
    const ans = parseFloat((parseFloat(a) * b).toFixed(1));
    const opts = shuffle([ans, ans + 0.5, ans - 0.5, ans + 1]).map(String);
    return Q(`What is ${a} × ${b}?`, opts, opts.indexOf(String(ans)), String(ans));
  }

  // ===== Tier 4 — Algebra / Complex Probability =====
  if (tier === 4) {
    if (subTier === "easy") {
      const x = rint(2, 12), a = rint(2, 15);
      return mkQ(`Solve: x + ${a} = ${x + a}. What is x?`, x, distract(x, 3, 3));
    }
    if (subTier === "mid") {
      const x = rint(2, 9), m = rint(2, 6), a = rint(1, 12);
      return mkQ(`Solve: ${m}x + ${a} = ${m * x + a}. What is x?`, x, distract(x, 3, 3));
    }
    // hard — algebra with x² or complex probability
    if (Math.random() < 0.5) {
      const x = rint(2, 9);
      return mkQ(`If x² = ${x * x}, what is x? (positive)`, x, distract(x, 3, 2));
    }
    // probability: rolling dice
    const target = rint(2, 12);
    const ways = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][target - 2];
    const ansN = ways, ansD = 36;
    const [nS, dS] = simplifyFrac(ansN, ansD);
    const ans = `${nS}/${dS}`;
    const opts = shuffle([ans, `${ansN}/24`, `${ansN + 1}/36`, `1/${target}`]);
    return Q(`Roll two dice. Probability of sum = ${target}?`, opts, opts.indexOf(ans), ans);
  }

  return pickQuestion(0, 0);
};
