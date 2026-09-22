import { CAMPUS, distanceMeters, parseSession, setSession } from './_logic.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });

  const session = parseSession(req);
  const { latitude, longitude, accuracy } = req.body || {};
  if (!session || !['q1', 'q2', 'q3'].every(stage => session.completed.includes(stage))) {
    return res.status(403).json({ error: 'Complete the earlier steps first.' });
  }

  if (![latitude, longitude, accuracy].every(Number.isFinite)) {
    return res.status(422).json({ error: 'Location could not be read. Try again.' });
  }

  if (accuracy > Math.max(CAMPUS.radiusMeters, 100)) {
    return res.status(422).json({ error: 'Location is not accurate enough yet. Move outdoors and try again.' });
  }

  if (distanceMeters(latitude, longitude, CAMPUS.latitude, CAMPUS.longitude) > CAMPUS.radiusMeters) {
    return res.status(403).json({ error: 'Not quite. Keep looking.' });
  }

  session.completed = [...new Set([...session.completed, 'location'])];
  setSession(res, session, req);
  return res.status(200).json({
    success: true,
    clue: process.env.BOARD_CLUE || 'Follow the clue to the board. The next code is there.'
  });
}
