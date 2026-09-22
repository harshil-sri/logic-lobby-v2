import { parseSession, puzzleFor, setSession } from './_logic.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });

  const session = parseSession(req);
  if (!session) return res.status(401).json({ error: 'Your event session has expired. Scan the event QR again.' });

  const { stage, answer } = req.body || {};
  const puzzle = puzzleFor(session.seed);
  const order = ['q1', 'q2', 'q3'];
  const expected = { q1: puzzle.q1, q2: puzzle.q2, q3: puzzle.entryCode };
  const index = order.indexOf(stage);

  if (index < 0 || (index > 0 && !session.completed.includes(order[index - 1]))) {
    return res.status(403).json({ error: 'Complete the earlier step first.' });
  }

  if (String(answer || '').replace(/\s/g, '') !== expected[stage]) {
    return res.status(422).json({ error: 'Not quite. Try again.' });
  }

  session.completed = [...new Set([...session.completed, stage])];
  setSession(res, session, req);
  return res.status(200).json({ success: true });
}
