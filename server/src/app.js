import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { nanoid } from 'nanoid';
import { pool, connectDB } from './config/db.js';
import redis from './config/redis.js';
import blockedExtensions from './utils/blockedExtensions.js';

const log = pino({ name: 'aws_node-api' });
const app = express();

/** CORS: allow list via FRONTEND_ORIGINS (comma-separated) */
const allowList = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const corsOptions = allowList.length
  ? {
      origin: (origin, cb) => {
        if (!origin || allowList.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      }
    }
  : { origin: '*' };

app.use(cors(corsOptions));
app.use(express.json());

/** DB init */
await connectDB();

/** Helpers */
const isBlocked = (url) => {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    return blockedExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return true; // block unparseable URLs
  }
};
const isValidHttpUrl = (str) => {
  try {
    const u = new URL(str);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};

/** Health */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: 'postgresql'
  });
});

/** Shorten */
app.post('/api/shorten', async (req, res) => {
  try {
    const { longUrl, phrase = '' } = req.body || {};

    if (!isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    if (isBlocked(longUrl)) {
      return res.status(400).json({ error: 'Blocked file type' });
    }

    const safePhrase = String(phrase)
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '')
      .slice(0, 60);

    // generate + insert with tiny retry on rare collision
    let slug, attempts = 0;
    while (attempts < 3) {
      const id = nanoid(6);
      slug = `${safePhrase ? safePhrase + '-' : ''}${id}`;
      try {
        await pool.query(
          'INSERT INTO urls (slug, long_url) VALUES ($1, $2)',
          [slug, longUrl]
        );
        break; // success
      } catch (e) {
        if (e?.code === '23505') { attempts++; continue; } // unique violation
        throw e;
      }
    }

    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);
    res.status(201).json({ slug });
  } catch (e) {
    log.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Resolve */
app.get('/api/resolve/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const cached = await redis.get(`slug:${slug}`);
    if (cached) {
      return res.json({ longUrl: cached, cached: true });
    }

    const result = await pool.query(
      'SELECT long_url FROM urls WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const longUrl = result.rows[0].long_url;
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);
    res.json({ longUrl, cached: false });
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;