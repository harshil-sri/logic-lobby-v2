import { parseSession, STREAMS, SECTIONS, YEARS } from './_logic.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });

  try {
    const session = parseSession(req);
    if (!session || !session.completed?.includes('final')) {
      return res.status(403).json({ error: 'Complete the event before submitting.' });
    }

    const { name, email, enrollmentNumber, year, stream, section } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanEnrollment = String(enrollmentNumber || '').trim().toUpperCase();

    if (!cleanName || !cleanEmail || !cleanEnrollment || !year || !stream || !section) {
      return res.status(400).json({ error: 'Name, email, enrollment number, year, stream, and section are required.' });
    }

    if (!YEARS.includes(String(year)) || !STREAMS.includes(String(stream)) || !SECTIONS.includes(String(section))) {
      return res.status(400).json({ error: 'Please choose a valid year, stream, and section.' });
    }

    const record = {
      name: cleanName,
      email: cleanEmail,
      enrollmentNumber: cleanEnrollment,
      year: String(year),
      stream: String(stream),
      section: String(section),
      iteration: session.seed,
      completedAt: new Date().toISOString(),
      startedAt: session.startedAt || null,
      elapsedSeconds: session.startedAt ? Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)) : null,
      status: 'VERIFIED_COMPLETION'
    };

    console.log('[LOGIC LOBBY SUBMISSION]', JSON.stringify(record));

    if (process.env.SUBMISSION_WEBHOOK_URL) {
      const webhookResponse = await fetch(process.env.SUBMISSION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!webhookResponse.ok) {
        throw new Error(`Submission webhook returned ${webhookResponse.status}`);
      }
    } else {
      // Fallback for local testing: append to submissions.json
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const file = path.join(process.cwd(), 'submissions.json');
        let existing = [];
        try { existing = JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) {}
        existing.push(record);
        await fs.writeFile(file, JSON.stringify(existing, null, 2));
      } catch (err) {
        console.error('Failed to write to local submissions.json', err);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'We could not record your completion. Please try again.' });
  }
}
