import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { nanoid } from 'nanoid';
import { pool, connectDB } from './config/db.js';
import redis from './config/redis.js';
import blockedExtensions from './utils/blockedExtensions.js';

const log = pino({ name: 'aws_node-api' });
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',').map(s => s.trim()) || '*'
}));
app.use(express.json());

// Initialize Postgres Connection & Table
await connectDB();

// --- Helper Functions ---

const isBlocked = (url) => {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    return blockedExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return true; // Block if URL is unparseable
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

// --- Routes ---

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(), 
    timestamp: Date.now(),
    database: 'postgresql' 
  });
});

// Shorten URL
app.post('/api/shorten', async (req, res) => {
  try {
    const { longUrl, phrase = '' } = req.body || {};

    // 1. Validations
    if (!isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    if (isBlocked(longUrl)) {
      return res.status(400).json({ error: 'Blocked file type' });
    }

    // 2. Generate Slug
    const safePhrase = String(phrase)
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '')
      .slice(0, 60);

    const id = nanoid(6);
    const slug = `${safePhrase ? safePhrase + '-' : ''}${id}`;

    // 3. Persist to Postgres
    const query = 'INSERT INTO urls (slug, long_url) VALUES ($1, $2) RETURNING slug';
    await pool.query(query, [slug, longUrl]);

    // 4. Cache in Redis (1 hour expiry)
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);

    res.status(201).json({ slug });
  } catch (e) {
    log.error(e);
    // Handle unique constraint violation for slug
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Slug conflict, please try again' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve URL
app.get('/api/resolve/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // 1. Check Redis Cache
    const cached = await redis.get(`slug:${slug}`);
    if (cached) {
      return res.json({ longUrl: cached, cached: true });
    }

    // 2. Check Postgres
    const result = await pool.query(
      'SELECT long_url FROM urls WHERE slug = $1', 
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const longUrl = result.rows[0].long_url;

    // 3. Backfill Redis
    await redis.set(`slug:${slug}`, longUrl, 'EX', 3600);

    res.json({ longUrl, cached: false });
  } catch (e) {
    log.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;