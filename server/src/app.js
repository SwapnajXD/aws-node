import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { nanoid } from 'nanoid';
import { pool, connectDB } from './config/db.js';
import redis from './config/redis.js';
import blockedExtensions from './utils/blockedExtensions.js';

const log = pino({ name: 'aws_node-api' });
const app = express();

/* ----------------------------------------------------------------
   CORS: allow-list via env FRONTEND_ORIGINS (comma-separated)
   Examples:
     FRONTEND_ORIGINS=http://localhost:8080,http://localhost:5173
     FRONTEND_ORIGINS=https://fe-1234abcd.ngrok.app
----------------------------------------------------------------- */
const allowList = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = allowList.length
  ? {
      origin: (origin, cb) => {
        // Allow non-browser (no origin) + explicit allowlist matches
        if (!origin || allowList.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
    }
  : { origin: '*' };

app.use(cors(corsOptions));
app.use(express.json());

/* ----------------------------------------------------------------
   DB init
----------------------------------------------------------------- */
await connectDB();

/* ----------------------------------------------------------------
   Helpers
----------------------------------------------------------------- */
const isBlocked = (url) => {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    return blockedExtensions.some((ext) => pathname.endsWith(ext));
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

/* ----------------------------------------------------------------
   Health
----------------------------------------------------------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: 'postgresql',
  });
});

/* ----------------------------------------------------------------
   POST /api/shorten
   Body: { longUrl, phrase? }
   Returns: { slug }
----------------------------------------------------------------- */
app.post('/api/shorten', async (req, res) => {
  try {
    const { longUrl, phrase = '' } = req.body || {};

    // 1) Validate input
    if (!isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    if (isBlocked(longUrl)) {
      return res.status(400).json({ error: 'Blocked file type' });
    }

    // 2) Normalize phrase (optional)
    const safePhrase = String(phrase)
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '')
      .slice(0, 60);

    // 3) Generate slug and insert with tiny retry for rare collisions
    let slug;
    let attempts = 0;

    while (attempts < 3) {
      const id = nanoid(6);
      slug = `${safePhrase ? `${safePhrase}-` : ''}${id}`;
      try {
        await pool.query(
          'INSERT INTO urls (slug, long_url) VALUES ($1, $2)',
          [slug, longUrl]
        );
        break; // success
      } catch (e) {
        // 23505 = unique_violation
        if (e?.code === '23505') {
          attempts += 1;
          continue;
        }
        throw e;
      }
    }

    // 4) Prime Redis (1 hour)
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);

    res.status(201).json({ slug });
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ----------------------------------------------------------------
   GET /api/resolve/:slug
   Returns: { longUrl, cached:boolean } or 404
----------------------------------------------------------------- */
app.get('/api/resolve/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    // 1) Redis first
    const cached = await redis.get(`slug:${slug}`);
    if (cached) {
      return res.json({ longUrl: cached, cached: true });
    }

    // 2) Postgres fallback
    const result = await pool.query(
      'SELECT long_url FROM urls WHERE slug = $1 LIMIT 1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const longUrl = result.rows[0].long_url;

    // 3) Backfill Redis
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);

    res.json({ longUrl, cached: false });
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ----------------------------------------------------------------
   GET /r/:slug
   Public redirect endpoint (shareable):
   - Use with a single ngrok tunnel exposing the API port (5000)
   Example short link to share:
     https://<your-api>.ngrok.app/r/<slug>
----------------------------------------------------------------- */
app.get('/r/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // Redis first
    const cached = await redis.get(`slug:${slug}`);
    if (cached) return res.redirect(cached);

    // DB fallback
    const result = await pool.query(
      'SELECT long_url FROM urls WHERE slug = $1 LIMIT 1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Short link not found');
    }

    const longUrl = result.rows[0].long_url;
    // Backfill cache (optional)
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);

    return res.redirect(longUrl);
  } catch (e) {
    log.error(e);
    return res.status(500).send('Server error');
  }
});

export default app;