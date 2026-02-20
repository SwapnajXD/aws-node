import Redis from 'ioredis';
const url = process.env.REDIS_URL || '';
let client;
if (url) {
  client = new Redis(url);
  client.on('error', (e) => console.error('Redis error:', e));
} else {
  client = {
    async get() { return null; },
    async set() { return 'OK'; }
  };
}
export default client;