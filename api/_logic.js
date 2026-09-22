import crypto from 'crypto';

export const CAMPUS = {
  latitude: 28.720746820087875,
  longitude: 77.1413492831149,
  radiusMeters: 5000
};

export const ITERATION_COUNT = 63;
export const YEARS = ['1', '2', '3'];
export const STREAMS = ['CSE', 'CYBERSEC', 'CSAM', 'VLSI', 'IIOT', 'AIDS', 'AIML'];
export const SECTIONS = ['A', 'B', 'C'];

const menu = {
  Kirparam: [
    ['Aloo Samosa', 15], ['Spring Roll', 35], ['Paneer Cheese Burger', 85],
    ['Pao Bhaji', 90], ['Red Sauce Pasta', 110], ['Peri-Peri Tandoori Cheese Fries', 140]
  ],
  'Delicious Grounds': [
    ['Veg Burger', 50], ['Afgani Burger', 70], ['Tandoori Burgers', 80],
    ['French Fries', 90], ['Spl. KFC Fried Chap', 120], ['Spl. Malai Chaap Tikka', 140]
  ],
  Exotica: [
    ['Black Coffee', 40], ['Mochaccino', 60], ['Mint Mojito', 70],
    ['Cold Coffee Fresh', 90], ['Protein Shake', 170], ['Hazelnut Coffee', 120]
  ]
};

// Seed values are intentionally abstract iteration IDs. They do not encode year,
// stream, section, or any participant identity.
function random(seed) {
  let x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function q1For(seed) {
  const variant = ((seed - 1) % 7) + 1;
  const n = (Math.floor((seed - 1) / 7) % 7) + 2;

  switch (variant) {
    case 1: {
      const terms = [n ** 2, (n + 1) ** 2, (n + 2) ** 2, (n + 3) ** 2];
      return {
        variant,
        prompt: `A sequence follows a rule: ${terms.join(', ')} … What comes next?`,
        answer: String((n + 4) ** 2)
      };
    }
    case 2: {
      const start = n + 3;
      const step = 3 + (seed % 4);
      const terms = [start, start + step, start + step * 2, start + step * 3];
      return {
        variant,
        prompt: `A sequence follows a rule: ${terms.join(', ')} … What comes next?`,
        answer: String(start + step * 4)
      };
    }
    case 3: {
      const start = n + 1;
      const terms = [start, start * 2, start * 3, start * 4];
      return {
        variant,
        prompt: `A sequence follows a rule: ${terms.join(', ')} … What comes next?`,
        answer: String(start * 5)
      };
    }
    case 4: {
      const base = n;
      const terms = [base, base * 2 + 1, (base * 2 + 1) * 2 + 1, ((base * 2 + 1) * 2 + 1) * 2 + 1];
      return {
        variant,
        prompt: `Each term is made from the previous one. ${terms.join(', ')} … What comes next?`,
        answer: String(terms[3] * 2 + 1)
      };
    }
    case 5: {
      const start = n;
      const terms = [start + 1, start + 3, start + 6, start + 10];
      return {
        variant,
        prompt: `The gaps grow in a pattern: ${terms.join(', ')} … What comes next?`,
        answer: String(start + 15)
      };
    }
    case 6: {
      const a = n + 4;
      const b = a + 2;
      const terms = [a, b, b + 4, b + 4 + 2];
      return {
        variant,
        prompt: `Look closely at the alternating gaps: ${terms.join(', ')} … What comes next?`,
        answer: String(terms[3] + 4)
      };
    }
    default: {
      const a = n;
      const b = n + 1;
      const terms = [a, b, a + b, b + (a + b), (a + b) + (b + (a + b))];
      return {
        variant,
        prompt: `Two numbers begin a pattern: ${terms.slice(0, 4).join(', ')} … What comes next?`,
        answer: String(terms[4])
      };
    }
  }
}

function menuChoicesFor(seed, attempt = 0) {
  return Object.entries(menu).map(([vendor, items], index) => {
    const itemIndex = Math.floor(random(seed + index * 97 + attempt * 17) * items.length) % items.length;
    const quantity = 1 + (Math.floor(random(seed + index * 193 + attempt * 31) * 3) % 3);
    return {
      vendor,
      item: items[itemIndex][0],
      quantity,
      unitPrice: items[itemIndex][1],
      total: items[itemIndex][1] * quantity
    };
  });
}

function buildMenuScenarios() {
  const scenarios = new Map();
  const usedCodes = new Set();
  for (let seed = 1; seed <= ITERATION_COUNT; seed++) {
    let chosen = null;
    for (let attempt = 0; attempt < 500; attempt++) {
      const choices = menuChoicesFor(seed, attempt);
      const code = choices.map(choice => String(choice.total).padStart(3, '0')).join('-');
      if (!usedCodes.has(code)) {
        usedCodes.add(code);
        chosen = choices;
        break;
      }
    }
    if (!chosen) throw new Error(`Could not create a unique canteen scenario for iteration ${seed}.`);
    scenarios.set(seed, chosen);
  }
  return scenarios;
}

function q2For(seed) {
  const variant = ((seed - 1) % 9) + 1;
  const limit = 4 + (Math.floor((seed - 1) / 9) % 4);

  const programs = [
    `total = 0\nfor number in range(1, ${limit + 1}):\n    if number % 2 == 0:\n        total += number\n    else:\n        total += 1\nprint(total)`,
    `count = 0\nfor number in range(1, ${limit + 1}):\n    if number % 2 == 0:\n        count += 1\nprint(count)`,
    `total = 1\nfor number in range(1, ${limit + 1}):\n    if number % 2 == 0:\n        total *= 2\n    else:\n        total += 1\nprint(total)`,
    `total = 0\nfor number in range(${limit}, 0, -1):\n    if number > 2:\n        total += number\nprint(total)`,
    `total = 0\nfor number in range(1, ${limit + 1}):\n    if number % 2 == 0:\n        total += 3\n    else:\n        total += 2\nprint(total)`,
    `total = 0\nfor number in range(1, ${limit + 1}):\n    for step in range(2):\n        total += number\nprint(total)`,
    `total = 0\nfor number in range(1, ${limit + 1}):\n    if number % 3 == 0:\n        total += 5\n    else:\n        total += 1\nprint(total)`,
    `value = ${limit}\nfor _ in range(3):\n    value += 2\nprint(value)`,
    `total = 0\nfor number in range(1, ${limit + 1}):\n    total += number % 3\nprint(total)`
  ];

  const answers = [
    Array.from({ length: limit }, (_, i) => i + 1).reduce((t, n) => t + (n % 2 === 0 ? n : 1), 0),
    Math.floor(limit / 2),
    Array.from({ length: limit }, (_, i) => i + 1).reduce((t, n) => n % 2 === 0 ? t * 2 : t + 1, 1),
    Array.from({ length: limit }, (_, i) => limit - i).reduce((t, n) => t + (n > 2 ? n : 0), 0),
    Array.from({ length: limit }, (_, i) => i + 1).reduce((t, n) => t + (n % 2 === 0 ? 3 : 2), 0),
    Array.from({ length: limit }, (_, i) => (i + 1) * 2).reduce((t, n) => t + n, 0),
    Array.from({ length: limit }, (_, i) => i + 1).reduce((t, n) => t + (n % 3 === 0 ? 5 : 1), 0),
    limit + 6,
    Array.from({ length: limit }, (_, i) => (i + 1) % 3).reduce((t, n) => t + n, 0)
  ];

  return { variant, code: programs[variant - 1], answer: String(answers[variant - 1]) };
}

const menuScenarios = buildMenuScenarios();

export function puzzleFor(seed) {
  const normalizedSeed = Number(seed);
  if (!Number.isInteger(normalizedSeed) || normalizedSeed < 1 || normalizedSeed > ITERATION_COUNT) {
    throw new Error('Invalid puzzle iteration.');
  }

  const q1 = q1For(normalizedSeed);
  const q2 = q2For(normalizedSeed);
  const choices = menuScenarios.get(normalizedSeed);

  return {
    q1: q1.answer,
    q1Prompt: q1.prompt,
    q2: q2.answer,
    q2Code: q2.code,
    q3Prompt: 'Use the two numbers you just found. Enter them in the same order, joined by a hyphen.',
    entryCode: `${q1.answer}-${q2.answer}`,
    choices,
    finalCode: choices.map(choice => String(choice.total).padStart(3, '0')).join('-')
  };
}

const secret = process.env.LOGIC_LOBBY_SESSION_SECRET || 'development-only-change-me';
const cookieName = 'logic_lobby_session';

function signature(payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function parseSession(req) {
  const value = (req.headers.cookie || '')
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);

  if (!value) return null;
  const [payload, sig] = value.split('.');
  const expected = signature(payload || '');
  if (!payload || !sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (session.expiresAt <= Date.now()) return null;
    if (!Number.isInteger(session.seed) || session.seed < 1 || session.seed > ITERATION_COUNT) return null;
    return session;
  } catch {
    return null;
  }
}

export function setSession(res, session, req = null) {
  const value = Buffer.from(JSON.stringify({
    ...session,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000
  })).toString('base64url');
  const isSecure = process.env.NODE_ENV === 'production' || req?.headers?.['x-forwarded-proto'] === 'https';
  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${value}.${signature(value)}; Path=/; HttpOnly; SameSite=Lax;${isSecure ? ' Secure;' : ''} Max-Age=7200`
  );
}

export function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
