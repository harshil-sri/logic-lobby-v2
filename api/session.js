import crypto from 'crypto';
import { ITERATION_COUNT, puzzleFor, parseSession, setSession } from './_logic.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required.' });

  const existing = parseSession(req);
  if (existing) {
    const puzzle = puzzleFor(existing.seed);
    return res.status(200).json({
      puzzle: {
        q1Prompt: puzzle.q1Prompt,
        q2Code: puzzle.q2Code,
        q3Prompt: puzzle.q3Prompt
      },
      resumed: true
    });
  }

  const seed = crypto.randomInt(1, ITERATION_COUNT + 1);
  setSession(res, { seed, completed: [], startedAt: Date.now() }, req);
  const puzzle = puzzleFor(seed);
  return res.status(200).json({
    puzzle: {
      q1Prompt: puzzle.q1Prompt,
      q2Code: puzzle.q2Code,
      q3Prompt: puzzle.q3Prompt
    },
    resumed: false
  });
}
