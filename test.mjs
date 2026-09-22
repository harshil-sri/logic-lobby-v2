import { ITERATION_COUNT, puzzleFor } from './api/_logic.js';

const finalCodes = new Set();
const puzzles = new Set();
for (let seed = 1; seed <= ITERATION_COUNT; seed++) {
  const puzzle = puzzleFor(seed);
  if (!/^\d+$/.test(puzzle.q1)) throw new Error(`Q1 invalid for ${seed}`);
  if (!/^\d+$/.test(puzzle.q2)) throw new Error(`Q2 invalid for ${seed}`);
  if (!/^-?\d+-\d+$/.test(puzzle.entryCode)) throw new Error(`Entry code invalid for ${seed}`);
  if (!/^\d{3}-\d{3}-\d{3}$/.test(puzzle.finalCode)) throw new Error(`Final code format invalid for ${seed}`);
  if (finalCodes.has(puzzle.finalCode)) throw new Error(`Final code collision for ${seed}`);
  finalCodes.add(puzzle.finalCode);
  puzzles.add(`${puzzle.q1Prompt}\n${puzzle.q2Code}\n${puzzle.entryCode}\n${puzzle.finalCode}`);
}

if (finalCodes.size !== ITERATION_COUNT) throw new Error('Not all iterations have unique canteen codes.');
if (puzzles.size < 50) throw new Error(`Too few distinct puzzle combinations: ${puzzles.size}`);

console.log(`PASS: ${ITERATION_COUNT} randomized iterations available.`);
console.log(`Distinct complete puzzle combinations: ${puzzles.size}`);
console.log(`Unique final canteen codes: ${finalCodes.size}`);
