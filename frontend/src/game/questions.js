// 20 basic probability questions for the Probability Dungeon Robots
// Each question has 4 multiple-choice options + a numeric answer for "input" mode.
// `answerIndex` points to the correct option, `numeric` is the simplified fraction text.

export const PROBABILITY_QUESTIONS = [
  {
    q: "You roll a fair six-sided die. What is the probability of rolling a 4?",
    options: ["1/6", "1/4", "1/3", "1/2"],
    answerIndex: 0,
    numeric: "1/6",
  },
  {
    q: "Flip a fair coin once. What is the probability of getting heads?",
    options: ["1/4", "1/3", "1/2", "2/3"],
    answerIndex: 2,
    numeric: "1/2",
  },
  {
    q: "A bag has 3 red and 2 blue marbles. Probability of drawing a red marble?",
    options: ["2/5", "3/5", "1/2", "3/2"],
    answerIndex: 1,
    numeric: "3/5",
  },
  {
    q: "Roll a fair die. Probability of rolling an even number?",
    options: ["1/3", "1/2", "2/3", "1/6"],
    answerIndex: 1,
    numeric: "1/2",
  },
  {
    q: "Flip two fair coins. Probability of getting two heads?",
    options: ["1/2", "1/3", "1/4", "1/8"],
    answerIndex: 2,
    numeric: "1/4",
  },
  {
    q: "A bag has 4 green, 1 yellow marble. Probability of drawing yellow?",
    options: ["1/5", "1/4", "1/3", "4/5"],
    answerIndex: 0,
    numeric: "1/5",
  },
  {
    q: "Roll a die. Probability the result is greater than 4?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    answerIndex: 1,
    numeric: "1/3",
  },
  {
    q: "A standard deck of 52 cards. Probability of drawing a heart?",
    options: ["1/13", "1/4", "1/2", "1/52"],
    answerIndex: 1,
    numeric: "1/4",
  },
  {
    q: "Roll two fair dice. Probability the sum is 7?",
    options: ["1/12", "1/8", "1/6", "1/4"],
    answerIndex: 2,
    numeric: "1/6",
  },
  {
    q: "Flip a coin three times. Probability of getting all tails?",
    options: ["1/2", "1/4", "1/6", "1/8"],
    answerIndex: 3,
    numeric: "1/8",
  },
  {
    q: "Roll a die. Probability of rolling a prime number (2, 3, or 5)?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    answerIndex: 2,
    numeric: "1/2",
  },
  {
    q: "Bag: 2 red, 3 blue, 5 green marbles. Probability of drawing blue?",
    options: ["1/5", "3/10", "1/2", "3/5"],
    answerIndex: 1,
    numeric: "3/10",
  },
  {
    q: "Draw one card from 52. Probability it is the Ace of Spades?",
    options: ["1/13", "1/26", "1/52", "4/52"],
    answerIndex: 2,
    numeric: "1/52",
  },
  {
    q: "Roll a die twice. Probability both rolls are 6?",
    options: ["1/12", "1/18", "1/36", "1/6"],
    answerIndex: 2,
    numeric: "1/36",
  },
  {
    q: "Flip a coin. Probability of NOT getting heads?",
    options: ["0", "1/4", "1/2", "1"],
    answerIndex: 2,
    numeric: "1/2",
  },
  {
    q: "Bag has 5 marbles, 1 is red. Probability of NOT drawing red?",
    options: ["1/5", "2/5", "3/5", "4/5"],
    answerIndex: 3,
    numeric: "4/5",
  },
  {
    q: "Roll a die. Probability of rolling a 7?",
    options: ["0", "1/6", "1/3", "1"],
    answerIndex: 0,
    numeric: "0",
  },
  {
    q: "Flip two coins. Probability of getting at least one head?",
    options: ["1/4", "1/2", "3/4", "1"],
    answerIndex: 2,
    numeric: "3/4",
  },
  {
    q: "Roll a die. Probability of rolling a number from 1 to 6?",
    options: ["0", "1/6", "1/2", "1"],
    answerIndex: 3,
    numeric: "1",
  },
  {
    q: "Draw a card from 52. Probability it is a face card (J, Q, K)?",
    options: ["3/13", "1/13", "1/4", "12/52"],
    answerIndex: 0,
    numeric: "3/13",
  },
];
