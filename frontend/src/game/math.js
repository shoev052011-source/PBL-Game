// Tiered math questions per biome difficulty.
// Tier 0 = basic arithmetic; Tier 1 = mult/div; Tier 2 = fractions;
// Tier 3 = percentages/decimals; Tier 4 = algebra / complex probability.

const Q = (q, options, answerIndex, numeric) => ({ q, options, answerIndex, numeric });

export const QUESTION_TIERS = [
  // ---- Tier 0: Basic Arithmetic ----
  [
    Q("What is 7 + 5?", ["10", "11", "12", "13"], 2, "12"),
    Q("What is 9 - 4?", ["3", "4", "5", "6"], 2, "5"),
    Q("What is 8 + 6?", ["12", "13", "14", "15"], 2, "14"),
    Q("What is 15 - 7?", ["6", "7", "8", "9"], 2, "8"),
    Q("What is 3 + 9?", ["10", "11", "12", "13"], 2, "12"),
    Q("What is 20 - 11?", ["7", "8", "9", "10"], 2, "9"),
    Q("What is 6 + 7?", ["12", "13", "14", "11"], 1, "13"),
    Q("What is 17 - 8?", ["7", "8", "9", "10"], 2, "9"),
    Q("What is 4 + 9?", ["12", "13", "14", "11"], 1, "13"),
    Q("What is 18 - 9?", ["7", "8", "9", "10"], 2, "9"),
  ],
  // ---- Tier 1: Multiplication / Division ----
  [
    Q("What is 6 × 7?", ["36", "40", "42", "48"], 2, "42"),
    Q("What is 9 × 4?", ["32", "34", "36", "40"], 2, "36"),
    Q("What is 8 × 7?", ["48", "52", "56", "64"], 2, "56"),
    Q("What is 56 ÷ 8?", ["6", "7", "8", "9"], 1, "7"),
    Q("What is 72 ÷ 9?", ["6", "7", "8", "9"], 2, "8"),
    Q("What is 11 × 6?", ["60", "64", "66", "72"], 2, "66"),
    Q("What is 7 × 7?", ["42", "47", "49", "56"], 2, "49"),
    Q("What is 81 ÷ 9?", ["7", "8", "9", "10"], 2, "9"),
    Q("What is 12 × 5?", ["50", "55", "60", "65"], 2, "60"),
    Q("What is 64 ÷ 8?", ["6", "7", "8", "9"], 2, "8"),
  ],
  // ---- Tier 2: Fractions ----
  [
    Q("What is 1/2 + 1/4?", ["1/3", "2/4", "3/4", "1"], 2, "3/4"),
    Q("What is 1/3 + 1/3?", ["1/6", "2/6", "2/3", "1/2"], 2, "2/3"),
    Q("What is 3/4 - 1/4?", ["1/4", "1/2", "2/3", "3/4"], 1, "1/2"),
    Q("Which is larger: 2/3 or 3/5?", ["2/3", "3/5", "equal", "neither"], 0, "2/3"),
    Q("What is 1/2 × 1/2?", ["1/2", "1/4", "1/3", "1"], 1, "1/4"),
    Q("Simplify 4/8.", ["1/2", "2/4", "1/4", "2/8"], 0, "1/2"),
    Q("What is 2/5 + 1/5?", ["1/5", "2/5", "3/5", "4/5"], 2, "3/5"),
    Q("What is 5/6 - 1/3?", ["1/2", "2/3", "1/3", "4/6"], 0, "1/2"),
    Q("Which fraction equals 0.5?", ["1/4", "1/3", "1/2", "2/3"], 2, "1/2"),
    Q("What is 1 - 1/4?", ["1/4", "1/2", "2/4", "3/4"], 3, "3/4"),
  ],
  // ---- Tier 3: Percentages / Decimals ----
  [
    Q("What is 50% of 80?", ["20", "30", "40", "50"], 2, "40"),
    Q("What is 25% of 200?", ["25", "40", "50", "75"], 2, "50"),
    Q("What is 0.4 as a percent?", ["4%", "14%", "40%", "400%"], 2, "40%"),
    Q("What is 10% of 250?", ["10", "20", "25", "50"], 2, "25"),
    Q("What is 0.75 + 0.25?", ["0.5", "1", "1.25", "0.95"], 1, "1"),
    Q("What is 75% as a fraction?", ["3/4", "1/2", "2/3", "7/10"], 0, "3/4"),
    Q("What is 30% of 60?", ["12", "15", "18", "20"], 2, "18"),
    Q("What is 1.5 × 4?", ["5", "6", "7", "8"], 1, "6"),
    Q("What is 20% of 150?", ["20", "25", "30", "35"], 2, "30"),
    Q("Which is larger: 0.6 or 3/5?", ["0.6", "3/5", "equal", "neither"], 2, "equal"),
  ],
  // ---- Tier 4: Algebra & Complex Probability ----
  [
    Q("Solve: x + 7 = 12. What is x?", ["3", "4", "5", "6"], 2, "5"),
    Q("Solve: 2x = 14. What is x?", ["6", "7", "8", "9"], 1, "7"),
    Q("Solve: 3x - 4 = 11. What is x?", ["3", "4", "5", "6"], 2, "5"),
    Q("Roll two dice. P(sum = 12)?", ["1/12", "1/18", "1/24", "1/36"], 3, "1/36"),
    Q("Flip 3 coins. P(exactly 2 heads)?", ["1/8", "3/8", "1/2", "5/8"], 1, "3/8"),
    Q("If x² = 49, x = ?", ["6", "7", "8", "9"], 1, "7"),
    Q("Draw 2 cards from 52 (no replacement). P(both aces)?", ["1/221", "1/169", "4/52", "1/52"], 0, "1/221"),
    Q("Solve: 5x + 3 = 23. What is x?", ["3", "4", "5", "6"], 1, "4"),
    Q("Roll two dice. P(sum is odd)?", ["1/3", "1/2", "2/3", "5/6"], 1, "1/2"),
    Q("Bag: 3 red, 2 blue. Draw 2 without replacement. P(both red)?", ["3/10", "9/25", "6/20", "1/2"], 0, "3/10"),
  ],
];

// Pick a question for a given biome tier + seed (room/robot index)
export const pickQuestion = (tier, seed = 0) => {
  const pool = QUESTION_TIERS[Math.max(0, Math.min(QUESTION_TIERS.length - 1, tier))];
  return pool[seed % pool.length];
};
