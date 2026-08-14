import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Bank-Grade Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// API & Webhook Routes
app.use('/api', apiRouter);
app.use('/webhook', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Render Anti-Sleep Keep-Alive Heartbeat (Pings /health every 10 minutes to prevent 15-minute sleep)
const RENDER_APP_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
if (RENDER_APP_URL) {
  setInterval(async () => {
    try {
      await fetch(`${RENDER_APP_URL}/health`);
      console.log(`💓 [RENDER KEEP-ALIVE] Heartbeat ping sent to ${RENDER_APP_URL}/health - Server kept 100% awake!`);
    } catch (e) {
      console.log(`[RENDER KEEP-ALIVE NOTICE]: ${e.message}`);
    }
  }, 10 * 60 * 1000); // Pings every 10 minutes
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Privacy Policy Endpoint for Meta Developer App Verification
app.get(['/privacy', '/privacy-policy', '/privacy-policy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/privacy-policy.html'));
});

// Standalone Backend Admin Portal Endpoint (Separated from Customer Frontend)
app.get(['/admin', '/admin-login', '/admin-portal', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Serve static frontend assets from dist in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
    return next();
  }
  const distIndex = path.join(__dirname, '../dist/index.html');
  res.sendFile(distIndex, (err) => {
    if (err) next();
  });
});


// MongoDB Connection with auto-formatting & error reporting
let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shadow_arrow';

if (MONGO_URI.includes('.mongodb.net/') && !MONGO_URI.includes('.mongodb.net/shadow_arrow')) {
  if (MONGO_URI.includes('.mongodb.net/?')) {
    MONGO_URI = MONGO_URI.replace('.mongodb.net/?', '.mongodb.net/shadow_arrow?');
  } else {
    MONGO_URI = MONGO_URI.replace('.mongodb.net/', '.mongodb.net/shadow_arrow');
  }
}

console.log('Attempting MongoDB connection to Atlas cluster...');

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ CONNECTED TO MONGODB ATLAS SUCCESSFULLY! Database: shadow_arrow');
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    console.log('MongoDB Notice: If using Atlas, ensure 0.0.0.0/0 IP is allowed under MongoDB Atlas Network Access.');
  });

app.listen(PORT, () => {
  console.log(`⚡ SHADOW ARROW Express Server running at http://localhost:${PORT}`);
});
