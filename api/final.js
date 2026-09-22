import { parseSession, puzzleFor, setSession } from './_logic.js';

export default function handler(req, res) {
  const session = parseSession(req);

  if (req.method === 'GET') {
    if (!session || !session.completed.includes('location')) {
      return res.status(403).json({ error: 'This page opens after the physical board.' });
    }
    const { choices, finalCode } = puzzleFor(session.seed);
    console.log('\n========================================');
    console.log('  DEV MODE: Your Final Answer is:', finalCode);
    console.log('========================================\n');
    return res.status(200).json({
      choices: choices.map(({ vendor, item, quantity }) => ({ vendor, item, quantity }))
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST required.' });
  if (!session || !session.completed.includes('location')) {
    return res.status(403).json({ error: 'This page opens after the physical board.' });
  }

  const answer = String(req.body?.answer || '').replace(/\s/g, '');
  const expected = puzzleFor(session.seed).finalCode;
  if (!/^\d{3}-\d{3}-\d{3}$/.test(answer) || answer !== expected) {
    return res.status(422).json({ error: 'That price code is not correct.' });
  }

  session.completed = [...new Set([...session.completed, 'final'])];
  setSession(res, session, req);
  return res.status(200).json({ success: true });
}
