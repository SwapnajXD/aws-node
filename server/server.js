import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;
createServer(app).listen(PORT, () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});